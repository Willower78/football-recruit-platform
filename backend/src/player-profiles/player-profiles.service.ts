import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { JwtUser } from '../common/decorators/current-user.decorator';
import { PlayerProfile } from '../entities/player-profile.entity';
import { SearchPlayersDto } from './dto/search-players.dto';
import { UpdatePlayerProfileDto } from './dto/update-player-profile.dto';

@Injectable()
export class PlayerProfilesService {
  constructor(
    @InjectRepository(PlayerProfile)
    private readonly repo: Repository<PlayerProfile>,
  ) {}

  async findOwn(userId: string): Promise<PlayerProfile> {
    const profile = await this.repo.findOne({ where: { userId } });
    if (!profile) {
      throw new NotFoundException('Player profile not found');
    }
    return profile;
  }

  async updateOwn(
    userId: string,
    dto: UpdatePlayerProfileDto,
  ): Promise<PlayerProfile> {
    const existing = await this.repo.findOne({ where: { userId } });
    if (!existing) {
      throw new NotFoundException('Player profile not found');
    }

    const assignable: QueryDeepPartialEntity<PlayerProfile> = {};
    if (dto.full_name !== undefined) assignable.fullName = dto.full_name;
    if (dto.date_of_birth !== undefined)
      assignable.dateOfBirth = dto.date_of_birth;
    if (dto.nationality !== undefined) assignable.nationality = dto.nationality;
    if (dto.city !== undefined) assignable.city = dto.city;
    if (dto.country !== undefined) assignable.country = dto.country;
    if (dto.dominant_foot !== undefined)
      assignable.dominantFoot = dto.dominant_foot;
    if (dto.primary_position !== undefined)
      assignable.primaryPosition = dto.primary_position;
    if (dto.secondary_positions !== undefined)
      assignable.secondaryPositions = dto.secondary_positions;
    if (dto.height_cm !== undefined) assignable.heightCm = dto.height_cm;
    if (dto.weight_kg !== undefined) assignable.weightKg = dto.weight_kg;
    if (dto.current_club !== undefined) assignable.currentClub = dto.current_club;
    if (dto.free_agent !== undefined) assignable.freeAgent = dto.free_agent;
    if (dto.availability_status !== undefined)
      assignable.availabilityStatus = dto.availability_status;
    if (dto.bio !== undefined) assignable.bio = dto.bio;
    if (dto.visibility_level !== undefined)
      assignable.visibilityLevel = dto.visibility_level;
    if (dto.guardian_required !== undefined)
      assignable.guardianRequired = dto.guardian_required;

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

  async findById(
    id: string,
    requester: JwtUser | null,
  ): Promise<PlayerProfile> {
    const profile = await this.repo.findOne({ where: { id } });
    if (!profile) {
      throw new NotFoundException('Player profile not found');
    }
    const isSelf = requester?.sub && profile.userId === requester.sub;
    const isAdmin = requester?.role === 'admin';
    const isClub = requester?.role === 'club';

    if (profile.visibilityLevel === 'private' && !isSelf && !isAdmin) {
      throw new ForbiddenException('This profile is private');
    }
    if (
      profile.visibilityLevel === 'clubs_only' &&
      !isSelf &&
      !isAdmin &&
      !isClub
    ) {
      throw new ForbiddenException('This profile is visible to clubs only');
    }
    return profile;
  }

  async search(
    query: SearchPlayersDto,
    requester: JwtUser | null,
  ): Promise<{
    data: PlayerProfile[];
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

    const canSeeClubsOnly =
      requester?.role === 'club' || requester?.role === 'admin';
    const visibilities = canSeeClubsOnly
      ? ['public', 'clubs_only']
      : ['public'];

    const qb = this.repo
      .createQueryBuilder('p')
      .where('p.visibility_level IN (:...visibilities)', {
        visibilities,
      });

    if (query.position) {
      qb.andWhere('p.primary_position = :position', {
        position: query.position,
      });
    }
    if (query.country) {
      qb.andWhere('p.country = :country', { country: query.country });
    }
    if (query.dominant_foot) {
      qb.andWhere('p.dominant_foot = :foot', { foot: query.dominant_foot });
    }
    if (query.free_agent !== undefined) {
      qb.andWhere('p.free_agent = :freeAgent', { freeAgent: query.free_agent });
    }
    if (query.availability_status) {
      qb.andWhere('p.availability_status = :availability', {
        availability: query.availability_status,
      });
    }
    if (query.age_min !== undefined) {
      qb.andWhere(
        `p.date_of_birth IS NOT NULL AND date_part('year', age(p.date_of_birth)) >= :ageMin`,
        { ageMin: query.age_min },
      );
    }
    if (query.age_max !== undefined) {
      qb.andWhere(
        `p.date_of_birth IS NOT NULL AND date_part('year', age(p.date_of_birth)) <= :ageMax`,
        { ageMax: query.age_max },
      );
    }
    if (
      query.lat !== undefined &&
      query.lng !== undefined &&
      query.radius_km !== undefined
    ) {
      qb.andWhere(
        `ST_DWithin(p.geo_point, ST_SetSRID(ST_MakePoint(:lng, :lat), 4326)::geography, :radiusMeters)`,
        {
          lat: query.lat,
          lng: query.lng,
          radiusMeters: query.radius_km * 1000,
        },
      );
    }

    const orderColumn = sortBy === 'full_name' ? 'p.full_name' : 'p.created_at';
    qb.orderBy(orderColumn, sortOrder);
    qb.skip((page - 1) * limit).take(limit);

    const [data, total] = await qb.getManyAndCount();
    return { data, page, limit, total };
  }
}
