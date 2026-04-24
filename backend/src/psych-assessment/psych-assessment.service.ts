import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PsychAssessment } from '../entities/psych-assessment.entity';
import { PsychQuestion } from '../entities/psych-question.entity';
import { PsychResponse } from '../entities/psych-response.entity';
import { PsychScore } from '../entities/psych-score.entity';
import { Consent } from '../entities/consent.entity';
import { ScoringService } from './scoring.service';
import { SubmitResponseDto } from './dto/submit-response.dto';

@Injectable()
export class PsychAssessmentService {
  constructor(
    @InjectRepository(PsychAssessment)
    private readonly assessmentRepo: Repository<PsychAssessment>,
    @InjectRepository(PsychQuestion)
    private readonly questionRepo: Repository<PsychQuestion>,
    @InjectRepository(PsychResponse)
    private readonly responseRepo: Repository<PsychResponse>,
    @InjectRepository(PsychScore)
    private readonly scoreRepo: Repository<PsychScore>,
    @InjectRepository(Consent)
    private readonly consentRepo: Repository<Consent>,
    private readonly scoringService: ScoringService,
  ) {}

  async getQuestions() {
    const questions = await this.questionRepo.find({
      where: { active: true },
      order: { domain: 'ASC', sortOrder: 'ASC' },
    });

    const grouped: Record<string, { id: string; questionText: string; sortOrder: number }[]> = {};
    for (const q of questions) {
      if (!grouped[q.domain]) grouped[q.domain] = [];
      grouped[q.domain].push({
        id: q.id,
        questionText: q.questionText,
        sortOrder: q.sortOrder,
      });
    }
    return grouped;
  }

  async startAssessment(userId: string, consentId: string) {
    const consent = await this.consentRepo.findOneBy({ id: consentId, userId });
    if (!consent || !consent.granted) {
      throw new BadRequestException('Valid consent is required before starting the assessment');
    }

    const existing = await this.assessmentRepo.findOne({
      where: { userId, status: 'draft' },
      order: { createdAt: 'DESC' },
    });
    if (existing) return existing;

    const assessment = this.assessmentRepo.create({
      userId,
      consentId,
      status: 'draft',
      version: 'v1',
    });
    return this.assessmentRepo.save(assessment);
  }

  async submitResponses(assessmentId: string, userId: string, responses: SubmitResponseDto[]) {
    const assessment = await this.assessmentRepo.findOneBy({ id: assessmentId });
    if (!assessment) throw new NotFoundException('Assessment not found');
    if (assessment.userId !== userId) throw new ForbiddenException('Not your assessment');
    if (assessment.status !== 'draft') {
      throw new BadRequestException('Assessment already submitted');
    }

    const questionIds = responses.map((r) => r.question_id);
    const questions = await this.questionRepo.findByIds(questionIds);
    const validIds = new Set(questions.filter((q) => q.active).map((q) => q.id));

    for (const resp of responses) {
      if (!validIds.has(resp.question_id)) {
        throw new BadRequestException(`Invalid or inactive question: ${resp.question_id}`);
      }
      if (resp.score_int < 1 || resp.score_int > 5) {
        throw new BadRequestException('Score must be between 1 and 5');
      }
    }

    // Upsert responses
    for (const resp of responses) {
      const existing = await this.responseRepo.findOne({
        where: { assessmentId, questionId: resp.question_id },
      });
      if (existing) {
        existing.scoreInt = resp.score_int;
        existing.answeredAt = new Date();
        await this.responseRepo.save(existing);
      } else {
        await this.responseRepo.save(
          this.responseRepo.create({
            assessmentId,
            questionId: resp.question_id,
            scoreInt: resp.score_int,
            answeredAt: new Date(),
          }),
        );
      }
    }

    const totalResponses = await this.responseRepo.count({ where: { assessmentId } });
    return { saved: responses.length, totalResponses };
  }

  async submitAssessment(assessmentId: string, userId: string) {
    const assessment = await this.assessmentRepo.findOneBy({ id: assessmentId });
    if (!assessment) throw new NotFoundException('Assessment not found');
    if (assessment.userId !== userId) throw new ForbiddenException('Not your assessment');
    if (assessment.status !== 'draft') {
      throw new BadRequestException('Assessment already submitted');
    }

    const totalResponses = await this.responseRepo.count({ where: { assessmentId } });
    const totalQuestions = await this.questionRepo.count({ where: { active: true } });
    if (totalResponses < totalQuestions) {
      throw new BadRequestException(
        `All ${totalQuestions} questions must be answered. Currently ${totalResponses} answered.`,
      );
    }

    return this.scoringService.scoreAssessment(assessmentId);
  }

  async listMine(userId: string) {
    const assessments = await this.assessmentRepo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });

    const result = [];
    for (const a of assessments) {
      const responseCount = await this.responseRepo.count({ where: { assessmentId: a.id } });
      let scores: PsychScore[] = [];
      if (a.status === 'submitted' || a.status === 'reviewed') {
        scores = await this.scoreRepo.find({ where: { assessmentId: a.id } });
      }
      result.push({
        ...a,
        responseCount,
        scores: scores.map((s) => ({
          domain: s.domain,
          rawScore: s.rawScore,
          normalizedScore: s.normalizedScore,
          percentileBand: s.percentileBand,
          interpretationText: s.interpretationText,
        })),
      });
    }
    return result;
  }

  async getAssessment(assessmentId: string, requesterId: string, requesterRole: string) {
    const assessment = await this.assessmentRepo.findOneBy({ id: assessmentId });
    if (!assessment) throw new NotFoundException('Assessment not found');

    const isOwner = assessment.userId === requesterId;
    const isAdmin = requesterRole === 'admin';
    const isClubOrScout = requesterRole === 'club' || requesterRole === 'scout';

    if (!isOwner && !isAdmin) {
      if (isClubOrScout && assessment.visibility === 'private') {
        throw new ForbiddenException('This assessment is private');
      }
      if (!isClubOrScout) {
        throw new ForbiddenException('Access denied');
      }
    }

    const responses = await this.responseRepo.find({ where: { assessmentId } });
    const scores = await this.scoreRepo.find({ where: { assessmentId } });

    if (isClubOrScout && !isOwner && assessment.visibility === 'summary_only') {
      return {
        ...assessment,
        responses: [],
        scores: scores.map((s) => ({
          domain: s.domain,
          normalizedScore: s.normalizedScore,
          percentileBand: s.percentileBand,
        })),
      };
    }

    return {
      ...assessment,
      responses: responses.map((r) => ({
        questionId: r.questionId,
        scoreInt: r.scoreInt,
        answeredAt: r.answeredAt,
      })),
      scores: scores.map((s) => ({
        domain: s.domain,
        rawScore: s.rawScore,
        normalizedScore: s.normalizedScore,
        percentileBand: s.percentileBand,
        interpretationText: s.interpretationText,
      })),
    };
  }

  async getResults(assessmentId: string, requesterId: string, requesterRole: string) {
    const assessment = await this.assessmentRepo.findOneBy({ id: assessmentId });
    if (!assessment) throw new NotFoundException('Assessment not found');

    const isOwner = assessment.userId === requesterId;
    const isAdmin = requesterRole === 'admin';
    const isClubOrScout = requesterRole === 'club' || requesterRole === 'scout';

    if (!isOwner && !isAdmin) {
      if (isClubOrScout && assessment.visibility === 'private') {
        throw new ForbiddenException('This assessment is private');
      }
      if (!isClubOrScout) {
        throw new ForbiddenException('Access denied');
      }
    }

    const scores = await this.scoreRepo.find({ where: { assessmentId } });
    const metadata = assessment.metadata as Record<string, unknown>;

    if (isClubOrScout && !isOwner && assessment.visibility === 'summary_only') {
      return {
        assessmentId: assessment.id,
        status: assessment.status,
        domains: scores.map((s) => ({
          domain: s.domain,
          normalizedScore: s.normalizedScore,
          percentileBand: s.percentileBand,
        })),
        overallScore: metadata.overall_score ?? null,
        confidenceBand: null,
        riskFlags: [],
        developmentSuggestions: [],
      };
    }

    return {
      assessmentId: assessment.id,
      status: assessment.status,
      domains: scores.map((s) => ({
        domain: s.domain,
        rawScore: s.rawScore,
        normalizedScore: s.normalizedScore,
        percentileBand: s.percentileBand,
        interpretationText: s.interpretationText,
      })),
      overallScore: metadata.overall_score ?? null,
      confidenceBand: metadata.confidence_band ?? null,
      riskFlags: (metadata.risk_flags as string[]) ?? [],
      developmentSuggestions: (metadata.development_suggestions as string[]) ?? [],
    };
  }

  async updateVisibility(assessmentId: string, userId: string, visibility: string) {
    const assessment = await this.assessmentRepo.findOneBy({ id: assessmentId });
    if (!assessment) throw new NotFoundException('Assessment not found');
    if (assessment.userId !== userId) throw new ForbiddenException('Not your assessment');

    assessment.visibility = visibility as 'private' | 'summary_only' | 'full';
    return this.assessmentRepo.save(assessment);
  }
}
