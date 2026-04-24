import {
  BadRequestException,
  ForbiddenException,
  GoneException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { randomUUID } from 'crypto';
import { RecommendationRequest } from '../entities/recommendation-request.entity';
import { Recommendation } from '../entities/recommendation.entity';
import { CoachRating } from '../entities/coach-rating.entity';
import { PlayerProfile } from '../entities/player-profile.entity';
import { User } from '../entities/user.entity';
import { EmailService } from '../email/email.service';
import { CreateRecommendationRequestDto } from './dto/create-recommendation-request.dto';
import { SubmitRecommendationDto } from './dto/submit-recommendation.dto';

@Injectable()
export class RecommendationsService {
  constructor(
    @InjectRepository(RecommendationRequest)
    private readonly requestRepo: Repository<RecommendationRequest>,
    @InjectRepository(Recommendation)
    private readonly recRepo: Repository<Recommendation>,
    @InjectRepository(CoachRating)
    private readonly coachRatingRepo: Repository<CoachRating>,
    @InjectRepository(PlayerProfile)
    private readonly playerRepo: Repository<PlayerProfile>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly emailService: EmailService,
  ) {}

  async createRequest(userId: string, dto: CreateRecommendationRequestDto) {
    const player = await this.playerRepo.findOneBy({ userId });
    if (!player) throw new NotFoundException('Player profile not found');

    const pendingCount = await this.requestRepo.count({
      where: { playerId: player.id, status: 'pending' },
    });
    if (pendingCount >= 10) {
      throw new BadRequestException('Maximum 10 pending requests allowed');
    }

    const token = randomUUID();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    const req = this.requestRepo.create({
      playerId: player.id,
      coachName: dto.coach_name,
      coachEmail: dto.coach_email,
      token,
      status: 'pending',
      expiresAt,
      sentAt: new Date(),
    });
    const saved = await this.requestRepo.save(req);

    await this.emailService.sendRecommendationRequest(
      dto.coach_email,
      dto.coach_name,
      player.fullName ?? 'A player',
      token,
      expiresAt,
    );

    return saved;
  }

  async listMyRequests(userId: string) {
    const player = await this.playerRepo.findOneBy({ userId });
    if (!player) return [];
    return this.requestRepo.find({
      where: { playerId: player.id },
      order: { createdAt: 'DESC' },
    });
  }

  async cancelRequest(requestId: string, userId: string) {
    const player = await this.playerRepo.findOneBy({ userId });
    if (!player) throw new NotFoundException('Player profile not found');

    const req = await this.requestRepo.findOneBy({ id: requestId });
    if (!req) throw new NotFoundException('Request not found');
    if (req.playerId !== player.id) throw new ForbiddenException('Not your request');
    if (req.status !== 'pending')
      throw new BadRequestException('Only pending requests can be cancelled');

    req.status = 'expired';
    return this.requestRepo.save(req);
  }

  async sendReminder(requestId: string, userId: string) {
    const player = await this.playerRepo.findOneBy({ userId });
    if (!player) throw new NotFoundException('Player profile not found');

    const req = await this.requestRepo.findOneBy({ id: requestId });
    if (!req) throw new NotFoundException('Request not found');
    if (req.playerId !== player.id) throw new ForbiddenException('Not your request');
    if (req.status !== 'pending')
      throw new BadRequestException('Only pending requests can receive reminders');
    if (req.remindedAt) throw new BadRequestException('Reminder already sent');

    const sentDate = req.sentAt ?? req.createdAt;
    const daysSinceSent = (Date.now() - sentDate.getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceSent < 7) {
      throw new BadRequestException('Must wait at least 7 days after the original send to remind');
    }

    req.remindedAt = new Date();
    await this.requestRepo.save(req);

    await this.emailService.sendRecommendationReminder(
      req.coachEmail,
      req.coachName ?? 'Coach',
      player.fullName ?? 'A player',
      req.token,
      req.expiresAt,
    );

    return { message: 'Reminder sent' };
  }

  async getSubmitForm(token: string) {
    const req = await this.requestRepo.findOne({
      where: { token },
      relations: ['player'],
    });
    if (!req) throw new NotFoundException('Invalid recommendation link');
    if (req.status !== 'pending') {
      if (req.status === 'completed') {
        throw new GoneException('A recommendation has already been submitted using this link');
      }
      throw new GoneException('This recommendation link has expired or is invalid');
    }
    if (new Date() > req.expiresAt) {
      throw new GoneException('This recommendation link has expired');
    }

    return {
      playerName: req.player?.fullName ?? 'Player',
      playerPosition: req.player?.primaryPosition ?? null,
      playerCity: req.player?.city ?? null,
      playerCountry: req.player?.country ?? null,
      playerCurrentClub: req.player?.currentClub ?? null,
      coachName: req.coachName,
      domains: [
        'self_regulation',
        'resilience',
        'commitment_discipline',
        'achievement_motivation',
        'emotional_control',
        'confidence_self_belief',
        'coachability',
        'team_communication',
        'focus_under_pressure',
        'professional_habits',
      ],
    };
  }

  async submitRecommendation(token: string, dto: SubmitRecommendationDto) {
    const req = await this.requestRepo.findOne({
      where: { token },
      relations: ['player'],
    });
    if (!req) throw new NotFoundException('Invalid recommendation link');
    if (req.status !== 'pending') {
      if (req.status === 'completed') {
        throw new GoneException('A recommendation has already been submitted using this link');
      }
      throw new GoneException('This recommendation link has expired or is invalid');
    }
    if (new Date() > req.expiresAt) {
      throw new GoneException('This recommendation link has expired');
    }

    const rec = this.recRepo.create({
      requestId: req.id,
      playerId: req.playerId,
      coachName: dto.coach_name,
      coachRole: dto.coach_role ?? null,
      coachEmail: req.coachEmail,
      coachClub: dto.coach_club ?? null,
      coachOrganization: dto.coach_club ?? null,
      relationshipDuration: dto.relationship_duration ?? null,
      overallRating: dto.overall_rating,
      strengthsText: dto.strengths_text,
      developmentText: dto.development_text ?? null,
      domainRatings: dto.domain_ratings ?? {},
      wouldRecommend: dto.would_recommend ?? true,
      additionalNotes: dto.additional_notes ?? null,
    });
    const saved = await this.recRepo.save(rec);

    // Insert domain ratings into coach_ratings table
    if (dto.domain_ratings) {
      for (const [domain, score] of Object.entries(dto.domain_ratings)) {
        if (typeof score === 'number' && score >= 1 && score <= 5) {
          await this.coachRatingRepo.save(
            this.coachRatingRepo.create({
              playerId: req.playerId,
              coachName: dto.coach_name,
              coachRole: dto.coach_role ?? null,
              domain,
              scoreInt: score,
            }),
          );
        }
      }
    }

    req.status = 'completed';
    await this.requestRepo.save(req);

    // Notify the player
    const user = await this.userRepo.findOneBy({ id: req.player?.userId });
    if (user) {
      await this.emailService.sendRecommendationReceived(
        user.email,
        req.player?.fullName ?? 'Player',
        dto.coach_name,
      );
    }

    return { id: saved.id, message: 'Recommendation submitted successfully' };
  }

  async listForPlayer(playerId: string, requesterId: string | null, requesterRole: string | null) {
    const player = await this.playerRepo.findOneBy({ id: playerId });
    if (!player) throw new NotFoundException('Player not found');

    const isOwner = requesterId && player.userId === requesterId;
    const isClubOrScout = requesterRole === 'club' || requesterRole === 'scout';

    let query = this.recRepo
      .createQueryBuilder('r')
      .where('r.player_id = :playerId', { playerId })
      .andWhere('r.deleted_at IS NULL');

    if (isOwner) {
      // show all
    } else if (isClubOrScout) {
      query = query.andWhere("r.visibility IN ('public', 'clubs_only')");
    } else {
      query = query.andWhere("r.visibility = 'public'");
    }

    query = query.orderBy('r.created_at', 'DESC');
    const recs = await query.getMany();

    return recs.map((r) => ({
      id: r.id,
      coachName: r.coachName,
      coachRole: r.coachRole,
      coachClub: r.coachClub ?? r.coachOrganization,
      overallRating: r.overallRating,
      strengthsText: r.strengthsText,
      developmentText: r.developmentText,
      relationshipDuration: r.relationshipDuration,
      wouldRecommend: r.wouldRecommend,
      verified: r.verified,
      verificationStatus: r.verificationStatus,
      domainRatings: isOwner || r.visibility === 'public' ? r.domainRatings : {},
      visibility: isOwner ? r.visibility : undefined,
      createdAt: r.createdAt,
    }));
  }

  async updateVisibility(recId: string, userId: string, visibility: string) {
    const rec = await this.recRepo.findOne({ where: { id: recId }, relations: ['player'] });
    if (!rec) throw new NotFoundException('Recommendation not found');
    if (rec.player?.userId !== userId) throw new ForbiddenException('Not your recommendation');

    rec.visibility = visibility as 'public' | 'clubs_only' | 'private';
    return this.recRepo.save(rec);
  }

  async deleteRecommendation(recId: string, userId: string) {
    const rec = await this.recRepo.findOne({ where: { id: recId }, relations: ['player'] });
    if (!rec) throw new NotFoundException('Recommendation not found');
    if (rec.player?.userId !== userId) throw new ForbiddenException('Not your recommendation');

    rec.deletedAt = new Date();
    await this.recRepo.save(rec);
    return { message: 'Recommendation removed' };
  }

  async verifyRecommendation(recId: string, adminUserId: string) {
    const rec = await this.recRepo.findOneBy({ id: recId });
    if (!rec) throw new NotFoundException('Recommendation not found');

    await this.recRepo
      .createQueryBuilder()
      .update(Recommendation)
      .set({
        verified: true,
        verificationStatus: 'verified' as const,
        verifiedAt: new Date(),
      })
      .where('id = :id', { id: recId })
      .execute();

    // Set verified_by via raw query to avoid deep-partial type issues
    await this.recRepo.query('UPDATE recommendations SET verified_by = $1 WHERE id = $2', [
      adminUserId,
      recId,
    ]);

    return { message: 'Recommendation verified' };
  }

  async listUnverified() {
    return this.recRepo.find({
      where: { verificationStatus: 'unverified', deletedAt: IsNull() },
      order: { createdAt: 'DESC' },
    });
  }

  async getCoachRatingsForPlayer(playerId: string) {
    const ratings = await this.coachRatingRepo.find({ where: { playerId } });
    const byDomain: Record<string, { total: number; count: number }> = {};
    for (const r of ratings) {
      if (!byDomain[r.domain]) byDomain[r.domain] = { total: 0, count: 0 };
      byDomain[r.domain].total += r.scoreInt;
      byDomain[r.domain].count += 1;
    }
    return Object.entries(byDomain).map(([domain, data]) => ({
      domain,
      averageRating: Math.round((data.total / data.count) * 100) / 100,
      count: data.count,
    }));
  }
}
