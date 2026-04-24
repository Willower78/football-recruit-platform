import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';

import { PlayerProfile } from '../entities/player-profile.entity';
import { UpdatePlayerProfileDto } from './dto/update-player-profile.dto';
import { SearchPlayersDto } from './dto/search-players.dto';
import { PlayerSearchService } from './player-search.service';

@Injectable()
export class PlayerProfilesService {
  constructor(
    @InjectRepository(PlayerProfile)
    private readonly repo: Repository<PlayerProfile>,
    private readonly searchService: PlayerSearchService,
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
    if (
      profile.visibilityLevel === 'clubs_only' &&
      !['club', 'scout', 'admin'].includes(viewerRole ?? '')
    ) {
      throw new ForbiddenException('This profile is only visible to clubs');
    }
    return profile;
  }

  async updateForUser(userId: string, dto: UpdatePlayerProfileDto): Promise<PlayerProfile> {
    const profile = await this.findForUser(userId);
    const { latitude, longitude, ...rest } = dto;

    // Apply scalar fields only. Geography is written separately via raw SQL so
    // PostGIS can build the `geography(Point)` value correctly.
    await this.repo.update({ userId }, rest as unknown as QueryDeepPartialEntity<PlayerProfile>);

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
    return this.searchService.search(dto);
  }
}
