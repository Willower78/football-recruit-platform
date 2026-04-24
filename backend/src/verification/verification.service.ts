import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VerificationRequest } from '../entities/verification-request.entity';
import { VerificationBadge } from '../entities/verification-badge.entity';
import { ClubProfile } from '../entities/club-profile.entity';
import { AuditService } from '../audit/audit.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class VerificationService {
  private readonly logger = new Logger(VerificationService.name);

  constructor(
    @InjectRepository(VerificationRequest)
    private readonly requestRepo: Repository<VerificationRequest>,
    @InjectRepository(VerificationBadge)
    private readonly badgeRepo: Repository<VerificationBadge>,
    @InjectRepository(ClubProfile)
    private readonly clubRepo: Repository<ClubProfile>,
    private readonly audit: AuditService,
    private readonly notifications: NotificationsService,
  ) {}

  /* ───── Club / User-facing ───── */

  async createRequest(
    userId: string,
    dto: {
      entity_type: string;
      entity_id: string;
      verification_method: string;
      evidence_notes?: string;
      evidence_url?: string;
    },
  ): Promise<VerificationRequest> {
    const existing = await this.requestRepo.findOne({
      where: {
        userId,
        entityType: dto.entity_type,
        entityId: dto.entity_id,
        status: 'pending',
      },
    });
    if (existing) {
      throw new ConflictException('A pending verification request already exists for this entity');
    }

    const evidence: Record<string, unknown> = {};
    if (dto.evidence_notes) evidence.notes = dto.evidence_notes;
    if (dto.evidence_url) evidence.url = dto.evidence_url;

    const request = this.requestRepo.create({
      userId,
      entityType: dto.entity_type,
      entityId: dto.entity_id,
      verificationMethod: dto.verification_method as VerificationRequest['verificationMethod'],
      evidence,
      status: 'pending',
    });

    if (dto.verification_method === 'email_domain') {
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      request.verificationCode = code;
      request.codeExpiresAt = new Date(Date.now() + 30 * 60 * 1000);
      this.logger.log(
        `Email verification code for request: ${code} (would be emailed in production)`,
      );
    }

    const saved = await this.requestRepo.save(request);

    if (dto.entity_type === 'club') {
      await this.clubRepo.update({ id: dto.entity_id }, { verificationTier: 'pending' });
    }

    return saved;
  }

  async confirmEmail(
    userId: string,
    requestId: string,
    code: string,
  ): Promise<VerificationRequest> {
    const request = await this.requestRepo.findOne({ where: { id: requestId, userId } });
    if (!request) throw new NotFoundException('Verification request not found');
    if (request.status !== 'pending') throw new BadRequestException('Request is not pending');
    if (request.verificationMethod !== 'email_domain') {
      throw new BadRequestException('This request does not use email verification');
    }
    if (!request.verificationCode || request.verificationCode !== code) {
      throw new BadRequestException('Invalid verification code');
    }
    if (request.codeExpiresAt && new Date() > request.codeExpiresAt) {
      throw new BadRequestException('Verification code has expired');
    }

    request.status = 'approved';
    request.reviewedAt = new Date();
    const saved = await this.requestRepo.save(request);

    await this.grantBadgeInternal({
      entityType: request.entityType,
      entityId: request.entityId,
      badgeType: 'verified',
      grantedBy: null,
    });

    if (request.entityType === 'club') {
      await this.clubRepo.update(
        { id: request.entityId },
        { verificationTier: 'verified', verifiedAt: new Date(), verified: true },
      );

      const club = await this.clubRepo.findOne({ where: { id: request.entityId } });
      if (club) {
        await this.notifications.create(
          club.userId,
          'verification_approved',
          'Club Verified!',
          'Your club has been verified via email domain! A verified badge is now displayed on your profile.',
          { entityType: 'club', entityId: request.entityId },
        );
      }
    }

    return saved;
  }

  async getStatus(userId: string) {
    const clubProfile = await this.clubRepo.findOne({ where: { userId } });

    const pendingRequests = await this.requestRepo.find({
      where: { userId, status: 'pending' },
      order: { createdAt: 'DESC' },
    });

    const badges = clubProfile
      ? await this.badgeRepo.find({
          where: { entityType: 'club', entityId: clubProfile.id, revoked: false },
        })
      : [];

    return {
      verificationTier: clubProfile?.verificationTier ?? 'unverified',
      badges,
      pendingRequests,
    };
  }

  async getBadges(entityType: string, entityId: string) {
    return this.badgeRepo
      .createQueryBuilder('b')
      .where('b.entity_type = :entityType', { entityType })
      .andWhere('b.entity_id = :entityId', { entityId })
      .andWhere('b.revoked = false')
      .andWhere('(b.expires_at IS NULL OR b.expires_at > NOW())')
      .getMany();
  }

  /* ───── Admin-facing ───── */

  async getQueue(filters: {
    entity_type?: string;
    verification_method?: string;
    status?: string;
    page?: number;
    limit?: number;
  }) {
    const qb = this.requestRepo
      .createQueryBuilder('r')
      .leftJoinAndSelect('r.user', 'user')
      .orderBy('r.created_at', 'ASC');

    if (filters.entity_type) qb.andWhere('r.entity_type = :et', { et: filters.entity_type });
    if (filters.verification_method)
      qb.andWhere('r.verification_method = :vm', { vm: filters.verification_method });
    if (filters.status) {
      qb.andWhere('r.status = :status', { status: filters.status });
    } else {
      qb.andWhere('r.status = :status', { status: 'pending' });
    }

    const page = filters.page ?? 1;
    const limit = filters.limit ?? 20;
    qb.skip((page - 1) * limit).take(limit);

    const [items, total] = await qb.getManyAndCount();
    return { items, total, page, limit };
  }

  async getQueueItem(id: string) {
    const request = await this.requestRepo.findOne({
      where: { id },
      relations: ['user'],
    });
    if (!request) throw new NotFoundException('Verification request not found');

    let entityData: Record<string, unknown> = {};
    if (request.entityType === 'club') {
      const club = await this.clubRepo.findOne({ where: { id: request.entityId } });
      if (club) entityData = { clubName: club.clubName, country: club.country, city: club.city };
    }

    return { ...request, entityData };
  }

  async reviewRequest(
    id: string,
    adminUserId: string,
    dto: { status: 'approved' | 'rejected'; rejection_reason?: string; badge_type?: string },
  ) {
    const request = await this.requestRepo.findOne({ where: { id } });
    if (!request) throw new NotFoundException('Verification request not found');
    if (request.status !== 'pending') throw new BadRequestException('Request is not pending');

    if (dto.status === 'rejected' && !dto.rejection_reason) {
      throw new BadRequestException('Rejection reason is required');
    }
    if (dto.status === 'approved' && !dto.badge_type) {
      throw new BadRequestException('Badge type is required when approving');
    }

    request.status = dto.status;
    request.reviewedBy = adminUserId;
    request.reviewedAt = new Date();
    if (dto.rejection_reason) request.rejectionReason = dto.rejection_reason;

    await this.requestRepo.save(request);

    if (dto.status === 'approved' && dto.badge_type) {
      await this.grantBadgeInternal({
        entityType: request.entityType,
        entityId: request.entityId,
        badgeType: dto.badge_type as 'verified' | 'official' | 'trusted',
        grantedBy: adminUserId,
      });

      if (request.entityType === 'club') {
        const tier = dto.badge_type === 'official' ? 'official' : 'verified';
        await this.clubRepo.update(
          { id: request.entityId },
          {
            verificationTier: tier as ClubProfile['verificationTier'],
            verifiedAt: new Date(),
            verified: true,
          },
        );

        const club = await this.clubRepo.findOne({ where: { id: request.entityId } });
        if (club) {
          await this.notifications.create(
            club.userId,
            'verification_approved',
            'Verification Approved!',
            `Your club has been verified! A ${tier} badge is now displayed on your profile.`,
            { entityType: 'club', entityId: request.entityId, tier },
          );
        }
      }

      await this.audit.log({
        actorUserId: adminUserId,
        actionType: 'verification_approved',
        entityType: 'verification_request',
        entityId: id,
        metadata: { badge_type: dto.badge_type },
      });
    }

    if (dto.status === 'rejected') {
      await this.notifications.create(
        request.userId,
        'verification_rejected',
        'Verification Request Not Approved',
        `Your verification request was not approved. Reason: ${dto.rejection_reason}. You can submit a new request with additional evidence.`,
        { entityType: request.entityType, entityId: request.entityId },
      );

      if (request.entityType === 'club') {
        await this.clubRepo.update({ id: request.entityId }, { verificationTier: 'unverified' });
      }

      await this.audit.log({
        actorUserId: adminUserId,
        actionType: 'verification_rejected',
        entityType: 'verification_request',
        entityId: id,
        metadata: { rejection_reason: dto.rejection_reason },
      });
    }

    return request;
  }

  async grantBadge(
    adminUserId: string,
    dto: { entity_type: string; entity_id: string; badge_type: string; expires_at?: string },
  ) {
    const badge = await this.grantBadgeInternal({
      entityType: dto.entity_type,
      entityId: dto.entity_id,
      badgeType: dto.badge_type as 'verified' | 'official' | 'trusted',
      grantedBy: adminUserId,
      expiresAt: dto.expires_at ? new Date(dto.expires_at) : undefined,
    });

    if (dto.entity_type === 'club') {
      const tier = dto.badge_type === 'official' ? 'official' : 'verified';
      await this.clubRepo.update(
        { id: dto.entity_id },
        {
          verificationTier: tier as ClubProfile['verificationTier'],
          verifiedAt: new Date(),
          verified: true,
        },
      );
    }

    await this.audit.log({
      actorUserId: adminUserId,
      actionType: 'badge_granted',
      entityType: dto.entity_type,
      entityId: dto.entity_id,
      metadata: { badge_type: dto.badge_type },
    });

    return badge;
  }

  async revokeBadge(badgeId: string, adminUserId: string, revokeReason: string) {
    const badge = await this.badgeRepo.findOne({ where: { id: badgeId } });
    if (!badge) throw new NotFoundException('Badge not found');

    badge.revoked = true;
    badge.revokedAt = new Date();
    badge.revokeReason = revokeReason;
    await this.badgeRepo.save(badge);

    if (badge.entityType === 'club') {
      await this.clubRepo.update(
        { id: badge.entityId },
        { verificationTier: 'unverified', verified: false, verifiedAt: null },
      );
    }

    await this.audit.log({
      actorUserId: adminUserId,
      actionType: 'badge_revoked',
      entityType: badge.entityType,
      entityId: badge.entityId,
      metadata: { badge_id: badgeId, revoke_reason: revokeReason },
    });

    return badge;
  }

  async listBadges(filters: {
    entity_type?: string;
    badge_type?: string;
    revoked?: string;
    page?: number;
    limit?: number;
  }) {
    const qb = this.badgeRepo.createQueryBuilder('b').orderBy('b.granted_at', 'DESC');

    if (filters.entity_type) qb.andWhere('b.entity_type = :et', { et: filters.entity_type });
    if (filters.badge_type) qb.andWhere('b.badge_type = :bt', { bt: filters.badge_type });
    if (filters.revoked !== undefined) {
      qb.andWhere('b.revoked = :revoked', { revoked: filters.revoked === 'true' });
    }

    const page = filters.page ?? 1;
    const limit = filters.limit ?? 20;
    qb.skip((page - 1) * limit).take(limit);

    const [items, total] = await qb.getManyAndCount();
    return { items, total, page, limit };
  }

  /* ───── Internal helper ───── */

  private async grantBadgeInternal(params: {
    entityType: string;
    entityId: string;
    badgeType: 'verified' | 'official' | 'trusted';
    grantedBy: string | null;
    expiresAt?: Date;
  }): Promise<VerificationBadge> {
    const badge = this.badgeRepo.create({
      entityType: params.entityType,
      entityId: params.entityId,
      badgeType: params.badgeType,
      grantedBy: params.grantedBy,
      grantedAt: new Date(),
      expiresAt: params.expiresAt ?? null,
    });
    return this.badgeRepo.save(badge);
  }
}
