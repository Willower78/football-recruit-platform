import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PsychAssessment } from '../entities/psych-assessment.entity';
import { PsychQuestion } from '../entities/psych-question.entity';
import { PsychResponse } from '../entities/psych-response.entity';
import { PsychScore } from '../entities/psych-score.entity';

const DOMAIN_LABELS: Record<string, string> = {
  self_regulation: 'Self-Regulation',
  resilience: 'Resilience',
  commitment_discipline: 'Commitment & Discipline',
  achievement_motivation: 'Achievement Motivation',
  emotional_control: 'Emotional Control',
  confidence_self_belief: 'Confidence & Self-Belief',
  coachability: 'Coachability',
  team_communication: 'Team Communication',
  focus_under_pressure: 'Focus Under Pressure',
  professional_habits: 'Professional Habits',
};

const DOMAIN_DESCRIPTIONS: Record<string, string> = {
  self_regulation: 'planning, monitoring, and managing training and lifestyle habits',
  resilience: 'bouncing back from setbacks, maintaining composure after adversity',
  commitment_discipline: 'consistency, work ethic, and dedication to improvement',
  achievement_motivation: 'drive to set and pursue ambitious performance goals',
  emotional_control: 'managing emotions, staying composed under frustration or pressure',
  confidence_self_belief: 'trust in own ability and willingness to take responsibility',
  coachability: 'openness to feedback, willingness to learn and adapt',
  team_communication: 'verbal leadership, encouragement, and collaboration with teammates',
  focus_under_pressure: 'concentration, decision-making, and execution in high-stakes moments',
  professional_habits: 'off-field discipline, nutrition, recovery, and career management',
};

interface DomainResult {
  domain: string;
  rawScore: number;
  normalizedScore: number;
  percentileBand: string;
  interpretationText: string;
}

export interface ScoringResult {
  domains: DomainResult[];
  overallScore: number;
  confidenceBand: 'high' | 'medium' | 'low';
  riskFlags: string[];
  developmentSuggestions: string[];
}

@Injectable()
export class ScoringService {
  constructor(
    @InjectRepository(PsychResponse)
    private readonly responseRepo: Repository<PsychResponse>,
    @InjectRepository(PsychQuestion)
    private readonly questionRepo: Repository<PsychQuestion>,
    @InjectRepository(PsychScore)
    private readonly scoreRepo: Repository<PsychScore>,
    @InjectRepository(PsychAssessment)
    private readonly assessmentRepo: Repository<PsychAssessment>,
  ) {}

  async scoreAssessment(assessmentId: string): Promise<ScoringResult> {
    const responses = await this.responseRepo.find({
      where: { assessmentId },
      relations: ['question'],
    });

    const byDomain = new Map<string, { score: number; rawScores: number[] }[]>();
    for (const resp of responses) {
      const q = resp.question;
      const adjusted = q.reverseScored ? 6 - resp.scoreInt : resp.scoreInt;
      if (!byDomain.has(q.domain)) {
        byDomain.set(q.domain, []);
      }
      byDomain.get(q.domain)!.push({ score: adjusted, rawScores: [resp.scoreInt] });
    }

    const domainResults: DomainResult[] = [];
    const riskFlags: string[] = [];
    const developmentSuggestions: string[] = [];
    let allMaxCount = 0;
    const totalResponses = responses.length;

    for (const [domain, items] of byDomain) {
      const scores = items.map((i) => i.score);
      const rawScore = scores.reduce((a, b) => a + b, 0);
      const normalizedScore = ((rawScore - 10) / 40) * 100;

      const mean = rawScore / scores.length;
      const variance = scores.reduce((acc, s) => acc + (s - mean) ** 2, 0) / scores.length;
      const stdDev = Math.sqrt(variance);

      if (stdDev > 1.5) {
        const label = DOMAIN_LABELS[domain] ?? domain;
        riskFlags.push(`Inconsistent responses in ${label} domain`);
      }

      const maxAnswers = items.filter((i) => i.rawScores[0] === 5).length;
      allMaxCount += maxAnswers;

      const percentileBand = this.getBand(normalizedScore);
      const interpretationText = this.getInterpretation(domain, percentileBand);

      if (percentileBand === 'Mixed' || percentileBand === 'Development area') {
        const label = DOMAIN_LABELS[domain] ?? domain;
        const desc = DOMAIN_DESCRIPTIONS[domain] ?? domain;
        developmentSuggestions.push(...this.getSuggestions(label, desc, percentileBand));
      }

      domainResults.push({
        domain,
        rawScore,
        normalizedScore: Math.round(normalizedScore * 100) / 100,
        percentileBand,
        interpretationText,
      });
    }

    if (totalResponses > 0 && allMaxCount / totalResponses > 0.8) {
      riskFlags.push('Possible impression management detected');
    }

    const overallScore =
      domainResults.length > 0
        ? Math.round(
            (domainResults.reduce((a, d) => a + d.normalizedScore, 0) / domainResults.length) * 100,
          ) / 100
        : 0;

    const flagCount = riskFlags.length;
    const confidenceBand: 'high' | 'medium' | 'low' =
      flagCount === 0 ? 'high' : flagCount === 1 ? 'medium' : 'low';

    // Persist scores
    for (const dr of domainResults) {
      await this.scoreRepo.upsert(
        {
          assessmentId,
          domain: dr.domain,
          rawScore: dr.rawScore,
          normalizedScore: dr.normalizedScore,
          percentileBand: dr.percentileBand,
          interpretationText: dr.interpretationText,
        },
        ['assessmentId', 'domain'],
      );
    }

    // Save metadata on the assessment
    await this.assessmentRepo.update(assessmentId, {
      status: 'submitted',
      completedAt: new Date(),
      metadata: {
        overall_score: overallScore,
        confidence_band: confidenceBand,
        risk_flags: riskFlags,
        development_suggestions: developmentSuggestions,
      },
    });

    return {
      domains: domainResults,
      overallScore,
      confidenceBand,
      riskFlags,
      developmentSuggestions,
    };
  }

  private getBand(normalizedScore: number): string {
    if (normalizedScore >= 85) return 'Clear strength';
    if (normalizedScore >= 70) return 'Solid';
    if (normalizedScore >= 55) return 'Mixed';
    return 'Development area';
  }

  private getInterpretation(domain: string, band: string): string {
    const label = DOMAIN_LABELS[domain] ?? domain;
    const desc = DOMAIN_DESCRIPTIONS[domain] ?? domain;
    switch (band) {
      case 'Clear strength':
        return `${label} is a clear strength. This suggests strong ${desc}.`;
      case 'Solid':
        return `${label} is solid. There is a good foundation in ${desc}, with room for refinement.`;
      case 'Mixed':
        return `${label} shows mixed signals. Some aspects of ${desc} are developing, while others need attention.`;
      case 'Development area':
        return `${label} is a development area. Focused work on ${desc} could significantly improve overall readiness.`;
      default:
        return '';
    }
  }

  private getSuggestions(label: string, desc: string, band: string): string[] {
    if (band === 'Development area') {
      return [
        `Prioritise structured work on ${label.toLowerCase()}: set specific weekly targets related to ${desc}.`,
        `Consider working with a sports psychologist or mentor to develop strategies for ${desc}.`,
      ];
    }
    return [
      `Continue building on ${label.toLowerCase()}: identify the specific aspects of ${desc} that need the most attention and create a focused plan.`,
    ];
  }
}
