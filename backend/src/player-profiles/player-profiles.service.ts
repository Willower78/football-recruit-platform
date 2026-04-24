import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';

import { PlayerProfile } from '../entities/player-profile.entity';
import { UpdatePlayerProfileDto } from './dto/update-player-profile.dto';
import { SearchPlayersDto } from './dto/search-players.dto';

@Injectable()
export class PlayerProfilesService {
  constructor(
    @InjectRepository(PlayerProfile)
    private readonly repo: Repository<PlayerProfile>,
  ) {}

  async findForUser(userId: string): Promise<PlayerProfile> {
    const profile = await this.repo.findOne({ where: { userId } });
    if (!profile) throw new NotFoundException('Player profile not found');
    return profile;
  }

  async findById(id: string, viewerRole?: string): Promise<PlayerProfile> {
    const profile = await this.repo.findOne({ where: { id } });
    if (!profile) throw new NotFoundException('Player not found');

    if (profile.visibilityLevel === 'private' && viewerRole !== 'admin') {
      throw new ForbiddenException('This profile is private');
    }
    if (profile.visibilityLevel === 'clubs_only' && !['club', 'scout', 'admin'].includes(viewerRole ?? '')) {
      throw new ForbiddenException('This profile is only visible to clubs');
    }
    return profile;
  }

  async updateForUser(userId: string, dto: UpdatePlayerProfileDto): Promise<PlayerProfile> {
    const profile = await this.findForUser(userId);
    const { latitude, longitude, ...rest } = dto;

    // Apply scalar fields only. Geography is written separately via raw SQL so
    // PostGIS can build the `geography(Point)` value correctly.
    await this.repo.update(
      { userId },
      rest as unknown as QueryDeepPartialEntity<PlayerProfile>,
    );

    if (latitude !== undefined && longitude !== undefined) {
      await this.repo.query(
        `UPDATE player_profiles
         SET geo_point = ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography
         WHERE user_id = $3`,
        [Number(longitude), Number(latitude), userId],
      );
    }

    // Touch updated_at (repo.update() already bumps it if present).
    void profile;
    return this.findForUser(userId);
  }

  async search(dto: SearchPlayersDto) {
    const qb = this.repo.createQueryBuilder('p').where('p.visibility_level != :priv', { priv: 'private' });

    if (dto.position) {
      qb.andWhere('p.primary_position = :pos', { pos: dto.position });
    }
    if (dto.country) {
      qb.andWhere('p.country ILIKE :country', { country: `%${dto.country}%` });
    }
    if (dto.dominantFoot) {
      qb.andWhere('p.dominant_foot = :foot', { foot: dto.dominantFoot });
    }
    if (dto.freeAgent !== undefined) {
      qb.andWhere('p.free_agent = :fa', { fa: dto.freeAgent });
    }
    if (dto.availabilityStatus) {
      qb.andWhere('p.availability_status = :avs', { avs: dto.availabilityStatus });
    }
    if (dto.ageMin !== undefined) {
      qb.andWhere(`p.date_of_birth <= (CURRENT_DATE - INTERVAL '${Number(dto.ageMin)} years')`);
    }
    if (dto.ageMax !== undefined) {
      qb.andWhere(`p.date_of_birth >= (CURRENT_DATE - INTERVAL '${Number(dto.ageMax)} years')`);
    }

    if (dto.lat !== undefined && dto.lng !== undefined && dto.radiusKm !== undefined) {
      qb.andWhere(
        'ST_DWithin(p.geo_point, ST_SetSRID(ST_MakePoint(:lng,:lat),4326)::geography, :meters)',
        { lng: dto.lng, lat: dto.lat, meters: dto.radiusKm * 1000 },
      );
    }

    const page = dto.page ?? 1;
    const limit = dto.limit ?? 20;
    qb.skip((page - 1) * limit).take(limit);
    qb.orderBy('p.updated_at', 'DESC');

    const [items, total] = await qb.getManyAndCount();
    return { items, total, page, limit };
  }
}
