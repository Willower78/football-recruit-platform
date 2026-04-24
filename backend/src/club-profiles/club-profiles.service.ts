import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';

import { ClubProfile } from '../entities/club-profile.entity';
import { UpdateClubProfileDto } from './dto/update-club-profile.dto';
import { SearchClubsDto } from './dto/search-clubs.dto';

@Injectable()
export class ClubProfilesService {
  constructor(
    @InjectRepository(ClubProfile)
    private readonly repo: Repository<ClubProfile>,
  ) {}

  async findForUser(userId: string): Promise<ClubProfile> {
    const profile = await this.repo.findOne({ where: { userId } });
    if (!profile) throw new NotFoundException('Club profile not found');
    return profile;
  }

  async findById(id: string): Promise<ClubProfile> {
    const profile = await this.repo.findOne({ where: { id } });
    if (!profile) throw new NotFoundException('Club not found');
    return profile;
  }

  async updateForUser(userId: string, dto: UpdateClubProfileDto): Promise<ClubProfile> {
    await this.findForUser(userId); // ensure exists
    const { latitude, longitude, ...rest } = dto;

    await this.repo.update({ userId }, rest as unknown as QueryDeepPartialEntity<ClubProfile>);

    if (latitude !== undefined && longitude !== undefined) {
      await this.repo.query(
        `UPDATE club_profiles
         SET geo_point = ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography
         WHERE user_id = $3`,
        [Number(longitude), Number(latitude), userId],
      );
    }
    return this.findForUser(userId);
  }

  async search(dto: SearchClubsDto) {
    const qb = this.repo.createQueryBuilder('c');

    if (dto.country) qb.andWhere('c.country ILIKE :country', { country: `%${dto.country}%` });
    if (dto.competitionLevel)
      qb.andWhere('c.competition_level = :cl', { cl: dto.competitionLevel });
    if (dto.verified !== undefined) qb.andWhere('c.verified = :v', { v: dto.verified });
    if (dto.ageGroup) qb.andWhere(`c.age_groups @> to_jsonb(:ag::text)`, { ag: dto.ageGroup });

    if (dto.lat !== undefined && dto.lng !== undefined && dto.radiusKm !== undefined) {
      qb.andWhere(
        'ST_DWithin(c.geo_point, ST_SetSRID(ST_MakePoint(:lng,:lat),4326)::geography, :meters)',
        { lng: dto.lng, lat: dto.lat, meters: dto.radiusKm * 1000 },
      );
    }

    const page = dto.page ?? 1;
    const limit = dto.limit ?? 20;
    qb.skip((page - 1) * limit).take(limit);
    qb.orderBy('c.updated_at', 'DESC');

    const [items, total] = await qb.getManyAndCount();
    return { items, total, page, limit };
  }
}
