import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tryout } from '../entities/tryout.entity';
import { TryoutApplication } from '../entities/tryout-application.entity';
import { ClubProfile } from '../entities/club-profile.entity';
import { CreateTryoutDto } from './dto/create-tryout.dto';
import { ApplyTryoutDto } from './dto/apply-tryout.dto';

@Injectable()
export class TryoutsService {
  constructor(
    @InjectRepository(Tryout) private readonly tryoutRepo: Repository<Tryout>,
    @InjectRepository(TryoutApplication) private readonly appRepo: Repository<TryoutApplication>,
    @InjectRepository(ClubProfile) private readonly clubRepo: Repository<ClubProfile>,
  ) {}

  async create(userId: string, dto: CreateTryoutDto): Promise<Tryout> {
    const club = await this.clubRepo.findOne({ where: { userId } });
    if (!club) throw new ForbiddenException('Only clubs can create tryouts');

    const tryout = this.tryoutRepo.create({
      clubId: club.id,
      title: dto.title,
      description: dto.description,
      sport: dto.sport ?? 'football',
      position: dto.position,
      ageGroup: dto.ageGroup,
      location: dto.location,
      city: dto.city,
      country: dto.country,
      tryoutDate: dto.tryoutDate ? new Date(dto.tryoutDate) : undefined,
      endDate: dto.endDate ? new Date(dto.endDate) : undefined,
      maxParticipants: dto.maxParticipants,
      requirements: dto.requirements,
      status: 'open',
    });
    return this.tryoutRepo.save(tryout);
  }

  async findAll(filters: {
    sport?: string;
    position?: string;
    city?: string;
    country?: string;
    page?: number;
    limit?: number;
  }) {
    const page = filters.page ?? 1;
    const limit = filters.limit ?? 20;

    const qb = this.tryoutRepo
      .createQueryBuilder('t')
      .leftJoinAndSelect('t.club', 'club')
      .where('t.status = :status', { status: 'open' })
      .orderBy('t.tryoutDate', 'ASC', 'NULLS LAST')
      .addOrderBy('t.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    if (filters.sport) {
      qb.andWhere('t.sport = :sport', { sport: filters.sport });
    }
    if (filters.position) {
      qb.andWhere('t.position = :position', { position: filters.position });
    }
    if (filters.city) {
      qb.andWhere('LOWER(t.city) LIKE LOWER(:city)', { city: `%${filters.city}%` });
    }
    if (filters.country) {
      qb.andWhere('LOWER(t.country) LIKE LOWER(:country)', { country: `%${filters.country}%` });
    }

    const [items, total] = await qb.getManyAndCount();

    return {
      items: items.map((t) => ({
        id: t.id,
        title: t.title,
        description: t.description,
        sport: t.sport,
        position: t.position,
        ageGroup: t.ageGroup,
        location: t.location,
        city: t.city,
        country: t.country,
        tryoutDate: t.tryoutDate,
        endDate: t.endDate,
        maxParticipants: t.maxParticipants,
        requirements: t.requirements,
        status: t.status,
        createdAt: t.createdAt,
        club: t.club
          ? {
              id: t.club.id,
              clubName: t.club.clubName,
              city: t.club.city,
              country: t.club.country,
            }
          : null,
      })),
      total,
      page,
      limit,
    };
  }

  async findOne(id: string) {
    const tryout = await this.tryoutRepo.findOne({
      where: { id },
      relations: ['club'],
    });
    if (!tryout) throw new NotFoundException('Tryout not found');
    return tryout;
  }

  async apply(tryoutId: string, playerId: string, dto: ApplyTryoutDto) {
    const tryout = await this.tryoutRepo.findOne({ where: { id: tryoutId } });
    if (!tryout) throw new NotFoundException('Tryout not found');
    if (tryout.status !== 'open') throw new ForbiddenException('This tryout is not open');

    if (tryout.maxParticipants) {
      const count = await this.appRepo.count({
        where: [{ tryoutId, status: 'applied' }, { tryoutId, status: 'accepted' }],
      });
      if (count >= tryout.maxParticipants) {
        throw new ConflictException('This tryout is full');
      }
    }

    const existing = await this.appRepo.findOne({
      where: { tryoutId, playerId },
    });
    if (existing) throw new ConflictException('You have already applied');

    const application = this.appRepo.create({
      tryoutId,
      playerId,
      message: dto.message,
      status: 'applied',
    });
    return this.appRepo.save(application);
  }

  async withdrawApplication(tryoutId: string, playerId: string) {
    const app = await this.appRepo.findOne({
      where: { tryoutId, playerId },
    });
    if (!app) throw new NotFoundException('Application not found');
    app.status = 'withdrawn';
    return this.appRepo.save(app);
  }

  async getApplicationsForTryout(tryoutId: string, userId: string) {
    const tryout = await this.tryoutRepo.findOne({
      where: { id: tryoutId },
      relations: ['club'],
    });
    if (!tryout) throw new NotFoundException('Tryout not found');
    if (tryout.club.userId !== userId) {
      throw new ForbiddenException('Only the club owner can view applications');
    }

    const apps = await this.appRepo.find({
      where: { tryoutId },
      relations: ['player'],
      order: { createdAt: 'DESC' },
    });

    return apps.map((a) => ({
      ...a,
      player: a.player
        ? {
            id: a.player.id,
            email: a.player.email,
            role: a.player.role,
            status: a.player.status,
            createdAt: a.player.createdAt,
          }
        : null,
    }));
  }

  async updateApplicationStatus(
    applicationId: string,
    userId: string,
    status: 'accepted' | 'rejected',
  ) {
    const app = await this.appRepo.findOne({
      where: { id: applicationId },
      relations: ['tryout', 'tryout.club'],
    });
    if (!app) throw new NotFoundException('Application not found');
    if (app.tryout.club.userId !== userId) {
      throw new ForbiddenException('Only the club owner can update applications');
    }
    app.status = status;
    return this.appRepo.save(app);
  }

  async getMyTryouts(userId: string) {
    const club = await this.clubRepo.findOne({ where: { userId } });
    if (!club) return [];

    return this.tryoutRepo.find({
      where: { clubId: club.id },
      order: { createdAt: 'DESC' },
    });
  }

  async getMyApplications(userId: string) {
    return this.appRepo.find({
      where: { playerId: userId },
      relations: ['tryout', 'tryout.club'],
      order: { createdAt: 'DESC' },
    });
  }

  async closeTryout(tryoutId: string, userId: string) {
    const tryout = await this.tryoutRepo.findOne({
      where: { id: tryoutId },
      relations: ['club'],
    });
    if (!tryout) throw new NotFoundException('Tryout not found');
    if (tryout.club.userId !== userId) {
      throw new ForbiddenException('Only the club owner can close this tryout');
    }
    tryout.status = 'closed';
    return this.tryoutRepo.save(tryout);
  }
}
