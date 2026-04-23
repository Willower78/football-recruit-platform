import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { ClubProfile } from '../entities/club-profile.entity';
import { SearchClubsDto } from './dto/search-clubs.dto';
import { UpdateClubProfileDto } from './dto/update-club-profile.dto';

@Injectable()
export class ClubProfilesService {
  constructor(
    @InjectRepository(ClubProfile)
    private readonly repo: Repository<ClubProfile>,
  ) {}

  async findOwn(userId: string): Promise<ClubProfile> {
    const profile = await this.repo.findOne({ where: { userId } });
    if (!profile) {
      throw new NotFoundException('Club profile not found');
    }
    return profile;
  }

  async updateOwn(
    userId: string,
    dto: UpdateClubProfileDto,
  ): Promise<ClubProfile> {
    const existing = await this.repo.findOne({ where: { userId } });
    if (!existing) {
      throw new NotFoundException('Club profile not found');
    }

    const assignable: QueryDeepPartialEntity<ClubProfile> = {};
    if (dto.club_name !== undefined) assignable.clubName = dto.club_name;
    if (dto.country !== undefined) assignable.country = dto.country;
    if (dto.city !== undefined) assignable.city = dto.city;
    if (dto.league_name !== undefined) assignable.leagueName = dto.league_name;
    if (dto.competition_level !== undefined)
      assignable.competitionLevel = dto.competition_level;
    if (dto.age_groups !== undefined) assignable.ageGroups = dto.age_groups;
    if (dto.description !== undefined) assignable.description = dto.description;
    if (dto.website_url !== undefined) assignable.websiteUrl = dto.website_url;

    await this.repo.update({ id: existing.id }, assignable);

    if (dto.latitude !== undefined && dto.longitude !== undefined) {
      await this.repo
        .createQueryBuilder()
        .update()
        .set({
          geoPoint: () =>
            `ST_SetSRID(ST_MakePoint(${Number(dto.longitude)}, ${Number(dto.latitude)}), 4326)::geography`,
        })
        .where('id = :id', { id: existing.id })
        .execute();
    }

    return this.findOwn(userId);
  }

  async findById(id: string): Promise<ClubProfile> {
    const profile = await this.repo.findOne({ where: { id } });
    if (!profile) {
      throw new NotFoundException('Club profile not found');
    }
    return profile;
  }

  async search(query: SearchClubsDto): Promise<{
    data: ClubProfile[];
    page: number;
    limit: number;
    total: number;
  }> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const sortBy = query.sort_by ?? 'created_at';
    const sortOrder = (query.sort_order ?? 'desc').toUpperCase() as
      | 'ASC'
      | 'DESC';

    const qb = this.repo.createQueryBuilder('c');

    if (query.country) {
      qb.andWhere('c.country = :country', { country: query.country });
    }
    if (query.competition_level) {
      qb.andWhere('c.competition_level = :level', {
        level: query.competition_level,
      });
    }
    if (query.age_group) {
      qb.andWhere(`c.age_groups @> :ageGroup::jsonb`, {
        ageGroup: JSON.stringify([query.age_group]),
      });
    }
    if (query.verified !== undefined) {
      qb.andWhere('c.verified = :verified', { verified: query.verified });
    }
    if (
      query.lat !== undefined &&
      query.lng !== undefined &&
      query.radius_km !== undefined
    ) {
      qb.andWhere(
        `ST_DWithin(c.geo_point, ST_SetSRID(ST_MakePoint(:lng, :lat), 4326)::geography, :radiusMeters)`,
        {
          lat: query.lat,
          lng: query.lng,
          radiusMeters: query.radius_km * 1000,
        },
      );
    }

    const orderColumn =
      sortBy === 'club_name' ? 'c.club_name' : 'c.created_at';
    qb.orderBy(orderColumn, sortOrder);
    qb.skip((page - 1) * limit).take(limit);

    const [data, total] = await qb.getManyAndCount();
    return { data, page, limit, total };
  }
}
