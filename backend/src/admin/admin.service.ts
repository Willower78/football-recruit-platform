import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { PlayerProfile } from '../entities/player-profile.entity';
import { ClubProfile } from '../entities/club-profile.entity';
import { AuditLog } from '../entities/audit-log.entity';
import { Consent } from '../entities/consent.entity';
import { ContentReport } from '../entities/content-report.entity';
import { VerificationRequest } from '../entities/verification-request.entity';
import { VerificationBadge } from '../entities/verification-badge.entity';
import { AuditService } from '../audit/audit.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(PlayerProfile) private readonly playerRepo: Repository<PlayerProfile>,
    @InjectRepository(ClubProfile) private readonly clubRepo: Repository<ClubProfile>,
    @InjectRepository(AuditLog) private readonly auditLogRepo: Repository<AuditLog>,
    @InjectRepository(Consent) private readonly consentRepo: Repository<Consent>,
    @InjectRepository(ContentReport) private readonly reportRepo: Repository<ContentReport>,
    @InjectRepository(VerificationRequest)
    private readonly verReqRepo: Repository<VerificationRequest>,
    @InjectRepository(VerificationBadge) private readonly badgeRepo: Repository<VerificationBadge>,
    private readonly audit: AuditService,
    private readonly notifications: NotificationsService,
  ) {}

  /* ───── User Management ───── */

  async listUsers(filters: {
    role?: string;
    status?: string;
    subscription_plan?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const qb = this.userRepo
      .createQueryBuilder('u')
      .leftJoinAndSelect('u.playerProfile', 'pp')
      .leftJoinAndSelect('u.clubProfile', 'cp')
      .orderBy('u.created_at', 'DESC');

    if (filters.role) qb.andWhere('u.role = :role', { role: filters.role });
    if (filters.status) qb.andWhere('u.status = :status', { status: filters.status });
    if (filters.subscription_plan) {
      qb.andWhere('u.subscription_plan = :plan', { plan: filters.subscription_plan });
    }
    if (filters.search) {
      qb.andWhere('u.email ILIKE :search', { search: `%${filters.search}%` });
    }

    const page = filters.page ?? 1;
    const limit = filters.limit ?? 20;
    qb.skip((page - 1) * limit).take(limit);

    const [items, total] = await qb.getManyAndCount();

    const safeItems = items.map((u) => {
      const rest = { ...u };
      delete (rest as Record<string, unknown>).passwordHash;
      return rest;
    });

    return { items: safeItems, total, page, limit };
  }

  async getUser(id: string) {
    const user = await this.userRepo.findOne({
      where: { id },
      relations: ['playerProfile', 'clubProfile'],
    });
    if (!user) throw new NotFoundException('User not found');

    const consents = await this.consentRepo.find({ where: { userId: id } });
    const recentAudit = await this.auditLogRepo.find({
      where: { actorUserId: id },
      order: { createdAt: 'DESC' },
      take: 20,
    });

    const safeUser = { ...user };
    delete (safeUser as Record<string, unknown>).passwordHash;
    return { ...safeUser, consents, recentAudit };
  }

  async updateUserStatus(id: string, adminUserId: string, dto: { status: string; reason: string }) {
    const user = await this.userRepo.findOneBy({ id });
    if (!user) throw new NotFoundException('User not found');

    user.status = dto.status as User['status'];
    await this.userRepo.save(user);

    await this.audit.log({
      actorUserId: adminUserId,
      actionType: dto.status === 'suspended' ? 'user_suspended' : 'user_activated',
      entityType: 'user',
      entityId: id,
      metadata: { reason: dto.reason },
    });

    if (dto.status === 'suspended') {
      await this.notifications.create(
        id,
        'account_suspended',
        'Account Suspended',
        `Your account has been suspended. Reason: ${dto.reason}. Contact support if you believe this is an error.`,
        {},
      );
    }

    return { id, status: dto.status };
  }

  async updateUserRole(id: string, adminUserId: string, dto: { role: string }) {
    const user = await this.userRepo.findOneBy({ id });
    if (!user) throw new NotFoundException('User not found');

    const oldRole = user.role;
    user.role = dto.role as User['role'];
    await this.userRepo.save(user);

    await this.audit.log({
      actorUserId: adminUserId,
      actionType: 'role_changed',
      entityType: 'user',
      entityId: id,
      metadata: { oldRole, newRole: dto.role },
    });

    return { id, role: dto.role };
  }

  async deleteUser(id: string, adminUserId: string, dto: { type: string }) {
    const user = await this.userRepo.findOneBy({ id });
    if (!user) throw new NotFoundException('User not found');

    if (dto.type === 'gdpr_full') {
      await this.userRepo.delete(id);
      await this.audit.log({
        actorUserId: adminUserId,
        actionType: 'gdpr_deletion',
        entityType: 'user',
        entityId: id,
        metadata: { email: '[REDACTED]' },
      });
    } else {
      user.status = 'suspended' as User['status'];
      user.email = `deleted_${id}@removed.local`;
      await this.userRepo.save(user);
      await this.audit.log({
        actorUserId: adminUserId,
        actionType: 'user_soft_deleted',
        entityType: 'user',
        entityId: id,
      });
    }

    return { id, deleted: true, type: dto.type };
  }

  /* ───── Content Reports (admin) ───── */

  async listReports(filters: {
    status?: string;
    reason?: string;
    entity_type?: string;
    page?: number;
    limit?: number;
  }) {
    const qb = this.reportRepo
      .createQueryBuilder('r')
      .leftJoinAndSelect('r.reporter', 'reporter')
      .orderBy('r.created_at', 'DESC');

    if (filters.status) qb.andWhere('r.status = :status', { status: filters.status });
    if (filters.reason) qb.andWhere('r.reason = :reason', { reason: filters.reason });
    if (filters.entity_type) {
      qb.andWhere('r.reported_entity_type = :et', { et: filters.entity_type });
    }

    const page = filters.page ?? 1;
    const limit = filters.limit ?? 20;
    qb.skip((page - 1) * limit).take(limit);

    const [items, total] = await qb.getManyAndCount();
    return { items, total, page, limit };
  }

  async getReport(id: string) {
    const report = await this.reportRepo.findOne({
      where: { id },
      relations: ['reporter'],
    });
    if (!report) throw new NotFoundException('Report not found');
    return report;
  }

  async updateReport(
    id: string,
    adminUserId: string,
    dto: { status: string; resolution_notes?: string },
  ) {
    const report = await this.reportRepo.findOneBy({ id });
    if (!report) throw new NotFoundException('Report not found');

    report.status = dto.status as ContentReport['status'];
    report.reviewedBy = adminUserId;
    report.reviewedAt = new Date();
    if (dto.resolution_notes) report.resolutionNotes = dto.resolution_notes;

    await this.reportRepo.save(report);

    await this.notifications.create(
      report.reporterUserId,
      'report_resolved',
      'Report Reviewed',
      "Thank you for your report. We've reviewed it and taken appropriate action.",
      { reportId: id },
    );

    await this.audit.log({
      actorUserId: adminUserId,
      actionType: 'report_reviewed',
      entityType: 'content_report',
      entityId: id,
      metadata: { status: dto.status, resolution_notes: dto.resolution_notes },
    });

    return report;
  }

  /* ───── Audit Logs ───── */

  async listAuditLogs(filters: {
    user_id?: string;
    action_type?: string;
    entity_type?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const qb = this.auditLogRepo.createQueryBuilder('a').orderBy('a.created_at', 'DESC');

    if (filters.user_id) qb.andWhere('a.actor_user_id = :uid', { uid: filters.user_id });
    if (filters.action_type) qb.andWhere('a.action_type = :at', { at: filters.action_type });
    if (filters.entity_type) qb.andWhere('a.entity_type = :et', { et: filters.entity_type });
    if (filters.search) {
      qb.andWhere('a.action_type ILIKE :search', { search: `%${filters.search}%` });
    }

    const page = filters.page ?? 1;
    const limit = filters.limit ?? 50;
    qb.skip((page - 1) * limit).take(limit);

    const [items, total] = await qb.getManyAndCount();
    return { items, total, page, limit };
  }

  async exportAuditLogs(filters: { from?: string; to?: string }) {
    const qb = this.auditLogRepo.createQueryBuilder('a').orderBy('a.created_at', 'DESC');

    if (filters.from) qb.andWhere('a.created_at >= :from', { from: filters.from });
    if (filters.to) qb.andWhere('a.created_at <= :to', { to: filters.to });

    const logs = await qb.getMany();

    const header = 'id,actor_user_id,action_type,entity_type,entity_id,metadata,created_at\n';
    const rows = logs.map(
      (l) =>
        `${l.id},"${l.actorUserId ?? ''}","${l.actionType}","${l.entityType ?? ''}","${l.entityId ?? ''}","${JSON.stringify(l.metadata).replace(/"/g, '""')}","${l.createdAt.toISOString()}"`,
    );
    return header + rows.join('\n');
  }

  /* ───── Consents ───── */

  async listConsents(filters: {
    user_id?: string;
    consent_type?: string;
    page?: number;
    limit?: number;
  }) {
    const qb = this.consentRepo.createQueryBuilder('c').orderBy('c.created_at', 'DESC');

    if (filters.user_id) qb.andWhere('c.user_id = :uid', { uid: filters.user_id });
    if (filters.consent_type) qb.andWhere('c.consent_type = :ct', { ct: filters.consent_type });

    const page = filters.page ?? 1;
    const limit = filters.limit ?? 20;
    qb.skip((page - 1) * limit).take(limit);

    const [items, total] = await qb.getManyAndCount();
    return { items, total, page, limit };
  }

  async getUserConsents(userId: string) {
    return this.consentRepo.find({ where: { userId }, order: { createdAt: 'DESC' } });
  }

  async triggerDataExport(userId: string, adminUserId: string) {
    const user = await this.userRepo.findOne({
      where: { id: userId },
      relations: ['playerProfile', 'clubProfile'],
    });
    if (!user) throw new NotFoundException('User not found');

    const consents = await this.consentRepo.find({ where: { userId } });
    const auditLogs = await this.auditLogRepo.find({ where: { actorUserId: userId } });

    const safeUser = { ...user };
    delete (safeUser as Record<string, unknown>).passwordHash;
    const exportData = { user: safeUser, consents, auditLogs };

    await this.audit.log({
      actorUserId: adminUserId,
      actionType: 'gdpr_data_export',
      entityType: 'user',
      entityId: userId,
    });

    return exportData;
  }

  async triggerDataDeletion(userId: string, adminUserId: string) {
    const user = await this.userRepo.findOneBy({ id: userId });
    if (!user) throw new NotFoundException('User not found');

    await this.userRepo.delete(userId);

    await this.audit.log({
      actorUserId: adminUserId,
      actionType: 'gdpr_data_deletion',
      entityType: 'user',
      entityId: userId,
      metadata: { email: '[REDACTED]' },
    });

    return { deleted: true, userId };
  }

  /* ───── Analytics ───── */

  async getAnalyticsOverview() {
    const totalUsers = await this.userRepo.count();
    const playerCount = await this.userRepo.count({ where: { role: 'player' } });
    const clubCount = await this.userRepo.count({ where: { role: 'club' } });
    const adminCount = await this.userRepo.count({ where: { role: 'admin' } });
    const scoutCount = await this.userRepo.count({ where: { role: 'scout' } });
    const premiumCount = await this.userRepo.count({ where: { subscriptionPlan: 'premium' } });
    const freeCount = await this.userRepo.count({ where: { subscriptionPlan: 'free' } });

    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const newSignups7d = await this.userRepo
      .createQueryBuilder('u')
      .where('u.created_at >= :since', { since: sevenDaysAgo })
      .getCount();

    const newSignups30d = await this.userRepo
      .createQueryBuilder('u')
      .where('u.created_at >= :since', { since: thirtyDaysAgo })
      .getCount();

    const activeUsers7d = await this.userRepo
      .createQueryBuilder('u')
      .where('u.last_login_at >= :since', { since: sevenDaysAgo })
      .getCount();

    const activeUsers30d = await this.userRepo
      .createQueryBuilder('u')
      .where('u.last_login_at >= :since', { since: thirtyDaysAgo })
      .getCount();

    const verifiedClubs = await this.clubRepo.count({ where: { verified: true } });
    const pendingVerifications = await this.verReqRepo.count({ where: { status: 'pending' } });
    const openReports = await this.reportRepo.count({ where: { status: 'pending' } });

    const conversionRate = totalUsers > 0 ? ((premiumCount / totalUsers) * 100).toFixed(1) : '0';

    return {
      totalUsers,
      byRole: { player: playerCount, club: clubCount, scout: scoutCount, admin: adminCount },
      newSignups: { last7Days: newSignups7d, last30Days: newSignups30d },
      activeUsers: { last7Days: activeUsers7d, last30Days: activeUsers30d },
      subscriptions: {
        free: freeCount,
        premium: premiumCount,
        conversionRate: `${conversionRate}%`,
      },
      verifiedClubs,
      pendingVerifications,
      openReports,
    };
  }

  async getSignupAnalytics(days: number) {
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const result = await this.userRepo
      .createQueryBuilder('u')
      .select('DATE(u.created_at)', 'date')
      .addSelect('COUNT(*)', 'count')
      .where('u.created_at >= :since', { since })
      .groupBy('DATE(u.created_at)')
      .orderBy('DATE(u.created_at)', 'ASC')
      .getRawMany();

    return result.map((r) => ({ date: r.date, count: parseInt(r.count) }));
  }

  async getConversionAnalytics(days: number) {
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const result = await this.userRepo
      .createQueryBuilder('u')
      .select('DATE(u.created_at)', 'date')
      .addSelect("SUM(CASE WHEN u.subscription_plan = 'premium' THEN 1 ELSE 0 END)", 'premium')
      .addSelect('COUNT(*)', 'total')
      .where('u.created_at >= :since', { since })
      .groupBy('DATE(u.created_at)')
      .orderBy('DATE(u.created_at)', 'ASC')
      .getRawMany();

    return result.map((r) => ({
      date: r.date,
      premium: parseInt(r.premium),
      total: parseInt(r.total),
    }));
  }
}
