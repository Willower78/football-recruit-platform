import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { PlayerProfile } from '../entities/player-profile.entity';
import { ClubProfile } from '../entities/club-profile.entity';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(PlayerProfile) private readonly playerRepo: Repository<PlayerProfile>,
    @InjectRepository(ClubProfile) private readonly clubRepo: Repository<ClubProfile>,
  ) {}

  async getOverview() {
    const [totalUsers, totalPlayers, totalClubs] = await Promise.all([
      this.userRepo.count(),
      this.playerRepo.count(),
      this.clubRepo.count(),
    ]);

    const [activeUsers, suspendedUsers, premiumUsers] = await Promise.all([
      this.userRepo.count({ where: { status: 'active' } }),
      this.userRepo.count({ where: { status: 'suspended' } }),
      this.userRepo.count({ where: { subscriptionPlan: 'premium' } }),
    ]);

    const roleBreakdown = await this.userRepo
      .createQueryBuilder('u')
      .select('u.role', 'role')
      .addSelect('COUNT(*)', 'count')
      .groupBy('u.role')
      .getRawMany();

    return {
      totalUsers,
      totalPlayers,
      totalClubs,
      activeUsers,
      suspendedUsers,
      premiumUsers,
      freeUsers: totalUsers - premiumUsers,
      roleBreakdown: roleBreakdown.map((r) => ({ role: r.role, count: Number(r.count) })),
    };
  }

  async getRegistrationTrend(days = 30) {
    const result = await this.userRepo
      .createQueryBuilder('u')
      .select("DATE(u.created_at)", 'date')
      .addSelect('COUNT(*)', 'count')
      .where("u.created_at >= NOW() - :days * INTERVAL '1 day'", { days })
      .groupBy("DATE(u.created_at)")
      .orderBy("DATE(u.created_at)", 'ASC')
      .getRawMany();

    return result.map((r) => ({ date: r.date, count: Number(r.count) }));
  }

  async getRecentUsers(limit = 10) {
    return this.userRepo.find({
      select: ['id', 'email', 'role', 'status', 'subscriptionPlan', 'createdAt', 'lastLoginAt'],
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  async getPositionBreakdown() {
    const result = await this.playerRepo
      .createQueryBuilder('p')
      .select('p.primary_position', 'position')
      .addSelect('COUNT(*)', 'count')
      .where('p.primary_position IS NOT NULL')
      .groupBy('p.primary_position')
      .getRawMany();

    return result.map((r) => ({ position: r.position, count: Number(r.count) }));
  }

  async getCountryBreakdown() {
    const players = await this.playerRepo
      .createQueryBuilder('p')
      .select('p.country', 'country')
      .addSelect('COUNT(*)', 'count')
      .where('p.country IS NOT NULL')
      .groupBy('p.country')
      .orderBy('COUNT(*)', 'DESC')
      .limit(10)
      .getRawMany();

    const clubs = await this.clubRepo
      .createQueryBuilder('c')
      .select('c.country', 'country')
      .addSelect('COUNT(*)', 'count')
      .where('c.country IS NOT NULL')
      .groupBy('c.country')
      .orderBy('COUNT(*)', 'DESC')
      .limit(10)
      .getRawMany();

    return {
      players: players.map((r) => ({ country: r.country, count: Number(r.count) })),
      clubs: clubs.map((r) => ({ country: r.country, count: Number(r.count) })),
    };
  }
}
