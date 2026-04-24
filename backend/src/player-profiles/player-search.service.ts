import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

import { SearchPlayersDto } from './dto/search-players.dto';

const SCOUTING_SLUG_MAP: Record<string, string> = {
  minFirstTouch: 'first_touch_composure',
  minPassing: 'passing_accuracy_range',
  minDribbling: 'dribbling_ball_carrying',
  minShooting: 'shooting_finishing',
  minPositionTechnique: 'position_specific_technique',
  minOffBallMovement: 'off_ball_movement',
  minGameReading: 'game_reading_anticipation',
  minTacticalUnderstanding: 'tactical_role_understanding',
  minSpeedAgility: 'speed_agility',
  minStrengthStamina: 'strength_stamina',
  minDecisionMaking: 'decision_making',
  minMentality: 'mentality_discipline',
  minBodyLanguage: 'body_language_consistency',
};

const PSYCH_DOMAIN_MAP: Record<string, string> = {
  minSelfRegulation: 'self_regulation',
  minResilience: 'resilience',
  minCommitment: 'commitment',
  minAchievementMotivation: 'achievement_motivation',
  minEmotionalControl: 'emotional_control',
  minConfidence: 'confidence',
  minCoachability: 'coachability',
  minTeamCommunication: 'team_communication',
  minFocusUnderPressure: 'focus_under_pressure',
  minProfessionalHabits: 'professional_habits',
};

export interface SearchResultItem {
  id: string;
  fullName: string | null;
  dateOfBirth: string | null;
  age: number | null;
  nationality: string | null;
  city: string | null;
  country: string | null;
  primaryPosition: string | null;
  secondaryPositions: string[];
  dominantFoot: string | null;
  heightCm: number | null;
  weightKg: number | null;
  freeAgent: boolean;
  availabilityStatus: string;
  currentClub: string | null;
  scoutingRatings: Record<string, Record<string, number | null>>;
  readinessScore: number | null;
  recommendationCount: number;
  avgCoachRating: number | null;
  hasScoutingReport: boolean;
  overallScoutingScore: number | null;
}

@Injectable()
export class PlayerSearchService {
  constructor(private readonly dataSource: DataSource) {}

  async search(
    dto: SearchPlayersDto,
  ): Promise<{ items: SearchResultItem[]; total: number; page: number; limit: number }> {
    const params: unknown[] = [];
    let paramIdx = 0;
    const nextParam = (val: unknown) => {
      params.push(val);
      paramIdx++;
      return `$${paramIdx}`;
    };

    // SELECT columns
    const selectParts: string[] = [
      'pp.id',
      'pp.full_name AS "fullName"',
      'pp.date_of_birth AS "dateOfBirth"',
      'pp.nationality',
      'pp.city',
      'pp.country',
      'pp.primary_position AS "primaryPosition"',
      'pp.secondary_positions AS "secondaryPositions"',
      'pp.dominant_foot AS "dominantFoot"',
      'pp.height_cm AS "heightCm"',
      'pp.weight_kg AS "weightKg"',
      'pp.free_agent AS "freeAgent"',
      'pp.availability_status AS "availabilityStatus"',
      'pp.current_club AS "currentClub"',
      'pp.created_at AS "createdAt"',
    ];

    const joinParts: string[] = [];
    const whereParts: string[] = [`pp.visibility_level != 'private'`];

    // --- Basic profile filters ---
    if (dto.position) {
      whereParts.push(`pp.primary_position = ${nextParam(dto.position)}`);
    }
    if (dto.positions) {
      const posList = dto.positions.split(',').map((p) => p.trim());
      whereParts.push(
        `(pp.primary_position = ANY(${nextParam(posList)}) OR pp.secondary_positions ?| ${nextParam(posList)})`,
      );
    }
    if (dto.ageMin !== undefined) {
      whereParts.push(
        `pp.date_of_birth <= (CURRENT_DATE - INTERVAL '1 year' * ${nextParam(dto.ageMin)})`,
      );
    }
    if (dto.ageMax !== undefined) {
      whereParts.push(
        `pp.date_of_birth >= (CURRENT_DATE - INTERVAL '1 year' * ${nextParam(dto.ageMax)})`,
      );
    }
    if (dto.nationality) {
      whereParts.push(`pp.nationality ILIKE ${nextParam(`%${dto.nationality}%`)}`);
    }
    if (dto.country) {
      whereParts.push(`pp.country ILIKE ${nextParam(`%${dto.country}%`)}`);
    }
    if (dto.city) {
      whereParts.push(`pp.city ILIKE ${nextParam(`%${dto.city}%`)}`);
    }
    if (dto.lat !== undefined && dto.lng !== undefined && dto.radiusKm !== undefined) {
      whereParts.push(
        `ST_DWithin(pp.geo_point, ST_SetSRID(ST_MakePoint(${nextParam(dto.lng)}, ${nextParam(dto.lat)}), 4326)::geography, ${nextParam(dto.radiusKm * 1000)})`,
      );
    }
    if (dto.dominantFoot) {
      whereParts.push(`pp.dominant_foot = ${nextParam(dto.dominantFoot)}`);
    }
    if (dto.heightMin !== undefined) {
      whereParts.push(`pp.height_cm >= ${nextParam(dto.heightMin)}`);
    }
    if (dto.heightMax !== undefined) {
      whereParts.push(`pp.height_cm <= ${nextParam(dto.heightMax)}`);
    }
    if (dto.weightMin !== undefined) {
      whereParts.push(`pp.weight_kg >= ${nextParam(dto.weightMin)}`);
    }
    if (dto.weightMax !== undefined) {
      whereParts.push(`pp.weight_kg <= ${nextParam(dto.weightMax)}`);
    }

    // --- Status filters ---
    if (dto.freeAgent !== undefined) {
      whereParts.push(`pp.free_agent = ${nextParam(dto.freeAgent)}`);
    }
    if (dto.availabilityStatus) {
      whereParts.push(`pp.availability_status = ${nextParam(dto.availabilityStatus)}`);
    }

    // --- Scouting rating filters (LEFT JOIN player_aggregate_ratings per needed slug) ---
    const scoutingJoinAliases: Record<string, string> = {};
    let scoutJoinIdx = 0;

    for (const [dtoKey, slug] of Object.entries(SCOUTING_SLUG_MAP)) {
      const val = (dto as unknown as Record<string, unknown>)[dtoKey];
      if (val !== undefined) {
        const alias = `par_${scoutJoinIdx++}`;
        scoutingJoinAliases[slug] = alias;
        joinParts.push(
          `LEFT JOIN player_aggregate_ratings ${alias} ON ${alias}.player_id = pp.id AND ${alias}.category_slug = ${nextParam(slug)}`,
        );
        whereParts.push(`${alias}.avg_score >= ${nextParam(val)}`);
      }
    }

    // Overall scouting filter — average across all 13 categories
    if (dto.minOverallScouting !== undefined) {
      joinParts.push(
        `LEFT JOIN (
          SELECT player_id, AVG(avg_score) AS overall_avg
          FROM player_aggregate_ratings
          GROUP BY player_id
        ) par_overall ON par_overall.player_id = pp.id`,
      );
      whereParts.push(`par_overall.overall_avg >= ${nextParam(dto.minOverallScouting)}`);
      selectParts.push('par_overall.overall_avg AS "overallScoutingAvg"');
    }

    // Always select aggregate ratings for response enrichment
    joinParts.push(
      `LEFT JOIN (
        SELECT player_id,
          jsonb_object_agg(category_slug, jsonb_build_object('avg', avg_score, 'max', max_score, 'latest', latest_score)) AS ratings_json
        FROM player_aggregate_ratings
        GROUP BY player_id
      ) par_all ON par_all.player_id = pp.id`,
    );
    selectParts.push(`COALESCE(par_all.ratings_json, '{}'::jsonb) AS "ratingsJson"`);

    // --- Psych assessment filters ---
    const psychFilters: Array<{ domain: string; min: number }> = [];
    if (dto.minReadinessScore !== undefined) {
      psychFilters.push({ domain: 'overall', min: dto.minReadinessScore });
    }
    for (const [dtoKey, domain] of Object.entries(PSYCH_DOMAIN_MAP)) {
      const val = (dto as unknown as Record<string, unknown>)[dtoKey];
      if (val !== undefined) {
        psychFilters.push({ domain, min: val as number });
      }
    }

    if (psychFilters.length > 0) {
      joinParts.push(
        `LEFT JOIN psych_assessments pa ON pa.user_id = pp.user_id AND pa.status = 'submitted'`,
      );
      for (let i = 0; i < psychFilters.length; i++) {
        const alias = `ps_${i}`;
        joinParts.push(
          `LEFT JOIN psych_scores ${alias} ON ${alias}.assessment_id = pa.id AND ${alias}.domain = ${nextParam(psychFilters[i].domain)}`,
        );
        whereParts.push(`${alias}.normalized_score >= ${nextParam(psychFilters[i].min)}`);
      }
    }

    // Select readiness score
    joinParts.push(
      `LEFT JOIN psych_assessments pa_r ON pa_r.user_id = pp.user_id AND pa_r.status = 'submitted'`,
    );
    joinParts.push(
      `LEFT JOIN psych_scores ps_readiness ON ps_readiness.assessment_id = pa_r.id AND ps_readiness.domain = 'overall'`,
    );
    selectParts.push('ps_readiness.normalized_score AS "readinessScore"');

    // --- Stats filters ---
    const statsFilters: Array<{ col: string; min: number }> = [];
    if (dto.minGoals !== undefined) statsFilters.push({ col: 'goals', min: dto.minGoals });
    if (dto.minAssists !== undefined) statsFilters.push({ col: 'assists', min: dto.minAssists });
    if (dto.minMatches !== undefined) statsFilters.push({ col: 'matches', min: dto.minMatches });
    if (dto.minMinutes !== undefined)
      statsFilters.push({ col: 'minutes_played', min: dto.minMinutes });

    if (statsFilters.length > 0) {
      const statsSumCols = statsFilters.map((f) => `SUM(${f.col}) AS total_${f.col}`).join(', ');
      joinParts.push(
        `LEFT JOIN (
          SELECT player_id, ${statsSumCols}
          FROM player_stats
          GROUP BY player_id
        ) pst ON pst.player_id = pp.id`,
      );
      for (const f of statsFilters) {
        whereParts.push(`pst.total_${f.col} >= ${nextParam(f.min)}`);
      }
    }

    // --- Recommendation filters ---
    const needsRecJoin =
      dto.hasRecommendations !== undefined ||
      dto.hasVerifiedRecommendations !== undefined ||
      dto.minCoachRating !== undefined;

    if (needsRecJoin) {
      joinParts.push(
        `LEFT JOIN (
          SELECT player_id,
            COUNT(*) AS rec_count,
            COUNT(*) FILTER (WHERE verified = true) AS verified_count,
            AVG(overall_rating) AS avg_rating
          FROM recommendations
          GROUP BY player_id
        ) rec ON rec.player_id = pp.id`,
      );
      if (dto.hasRecommendations === true) {
        whereParts.push('rec.rec_count > 0');
      }
      if (dto.hasVerifiedRecommendations === true) {
        whereParts.push('rec.verified_count > 0');
      }
      if (dto.minCoachRating !== undefined) {
        whereParts.push(`rec.avg_rating >= ${nextParam(dto.minCoachRating)}`);
      }
      selectParts.push('COALESCE(rec.rec_count, 0)::int AS "recommendationCount"');
      selectParts.push('rec.avg_rating AS "avgCoachRating"');
    } else {
      // Always provide recommendation data in response
      joinParts.push(
        `LEFT JOIN (
          SELECT player_id, COUNT(*) AS rec_count, AVG(overall_rating) AS avg_rating
          FROM recommendations
          GROUP BY player_id
        ) rec ON rec.player_id = pp.id`,
      );
      selectParts.push('COALESCE(rec.rec_count, 0)::int AS "recommendationCount"');
      selectParts.push('rec.avg_rating AS "avgCoachRating"');
    }

    // --- Scouting report filters ---
    if (dto.hasScoutingReport !== undefined || dto.minScoutingScore !== undefined) {
      joinParts.push(
        `LEFT JOIN (
          SELECT player_id,
            COUNT(*) AS report_count,
            AVG((scores->>'overall')::numeric) AS avg_overall_score
          FROM scouting_reports
          WHERE status = 'published'
          GROUP BY player_id
        ) srep ON srep.player_id = pp.id`,
      );
      if (dto.hasScoutingReport === true) {
        whereParts.push('srep.report_count > 0');
      }
      if (dto.minScoutingScore !== undefined) {
        whereParts.push(`srep.avg_overall_score >= ${nextParam(dto.minScoutingScore)}`);
      }
      selectParts.push('(srep.report_count > 0) AS "hasScoutingReport"');
      selectParts.push('srep.avg_overall_score AS "overallScoutingScore"');
    } else {
      joinParts.push(
        `LEFT JOIN (
          SELECT player_id, COUNT(*) AS report_count,
            AVG((scores->>'overall')::numeric) AS avg_overall_score
          FROM scouting_reports WHERE status = 'published'
          GROUP BY player_id
        ) srep ON srep.player_id = pp.id`,
      );
      selectParts.push('(COALESCE(srep.report_count, 0) > 0) AS "hasScoutingReport"');
      selectParts.push('srep.avg_overall_score AS "overallScoutingScore"');
    }

    // --- Sorting ---
    let orderClause = 'pp.updated_at DESC';
    const sortDir = dto.sortOrder === 'asc' ? 'ASC' : 'DESC';
    switch (dto.sortBy) {
      case 'name':
        orderClause = `pp.full_name ${sortDir} NULLS LAST`;
        break;
      case 'age':
        orderClause = `pp.date_of_birth ${sortDir === 'ASC' ? 'DESC' : 'ASC'} NULLS LAST`;
        break;
      case 'position':
        orderClause = `pp.primary_position ${sortDir} NULLS LAST`;
        break;
      case 'created_at':
        orderClause = `pp.created_at ${sortDir}`;
        break;
      case 'overall_scouting_score':
        orderClause = `srep.avg_overall_score ${sortDir} NULLS LAST`;
        break;
      case 'readiness_score':
        orderClause = `ps_readiness.normalized_score ${sortDir} NULLS LAST`;
        break;
    }

    // --- Build final query ---
    const page = dto.page ?? 1;
    const limit = dto.limit ?? 20;
    const offset = (page - 1) * limit;

    const whereSQL = whereParts.join(' AND ');
    const joinSQL = joinParts.join('\n');

    const countQuery = `SELECT COUNT(DISTINCT pp.id) AS total FROM player_profiles pp ${joinSQL} WHERE ${whereSQL}`;
    const dataQuery = `SELECT DISTINCT ON (pp.id) ${selectParts.join(', ')} FROM player_profiles pp ${joinSQL} WHERE ${whereSQL} ORDER BY pp.id`;

    // Execute count
    const countResult = await this.dataSource.query(countQuery, params);
    const total = parseInt(countResult[0]?.total ?? '0', 10);

    // Wrap with ordering and pagination
    const finalQuery = `SELECT * FROM (${dataQuery}) sub ORDER BY ${orderClause
      .replace(/pp\./g, 'sub.')
      .replace(/srep\./g, 'sub.')
      .replace(/ps_readiness\./g, 'sub.')} LIMIT ${nextParam(limit)} OFFSET ${nextParam(offset)}`;
    const rows = await this.dataSource.query(finalQuery, params);

    const items: SearchResultItem[] = rows.map((row: Record<string, unknown>) => this.mapRow(row));

    return { items, total, page, limit };
  }

  private mapRow(row: Record<string, unknown>): SearchResultItem {
    const ratingsJson = (row.ratingsJson as Record<string, Record<string, number>>) ?? {};

    const scoutingRatings: Record<string, Record<string, number | null>> = {
      technical: {
        firstTouch: ratingsJson.first_touch_composure?.avg ?? null,
        passing: ratingsJson.passing_accuracy_range?.avg ?? null,
        dribbling: ratingsJson.dribbling_ball_carrying?.avg ?? null,
        shooting: ratingsJson.shooting_finishing?.avg ?? null,
        positionTechnique: ratingsJson.position_specific_technique?.avg ?? null,
      },
      tactical: {
        offBallMovement: ratingsJson.off_ball_movement?.avg ?? null,
        gameReading: ratingsJson.game_reading_anticipation?.avg ?? null,
        tacticalUnderstanding: ratingsJson.tactical_role_understanding?.avg ?? null,
      },
      physical: {
        speedAgility: ratingsJson.speed_agility?.avg ?? null,
        strengthStamina: ratingsJson.strength_stamina?.avg ?? null,
      },
      mental: {
        decisionMaking: ratingsJson.decision_making?.avg ?? null,
        mentalityDiscipline: ratingsJson.mentality_discipline?.avg ?? null,
      },
      intangibles: {
        bodyLanguageConsistency: ratingsJson.body_language_consistency?.avg ?? null,
      },
    };

    const dob = row.dateOfBirth as string | null;
    let age: number | null = null;
    if (dob) {
      const birth = new Date(dob);
      const today = new Date();
      age = today.getFullYear() - birth.getFullYear();
      const m = today.getMonth() - birth.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    }

    return {
      id: row.id as string,
      fullName: row.fullName as string | null,
      dateOfBirth: dob,
      nationality: row.nationality as string | null,
      city: row.city as string | null,
      country: row.country as string | null,
      primaryPosition: row.primaryPosition as string | null,
      secondaryPositions: (row.secondaryPositions as string[]) ?? [],
      dominantFoot: row.dominantFoot as string | null,
      heightCm: row.heightCm as number | null,
      weightKg: row.weightKg as number | null,
      freeAgent: row.freeAgent as boolean,
      availabilityStatus: row.availabilityStatus as string,
      currentClub: row.currentClub as string | null,
      scoutingRatings,
      age,
      readinessScore: row.readinessScore != null ? Number(row.readinessScore) : null,
      recommendationCount: Number(row.recommendationCount ?? 0),
      avgCoachRating: row.avgCoachRating != null ? Number(row.avgCoachRating) : null,
      hasScoutingReport: Boolean(row.hasScoutingReport),
      overallScoutingScore:
        row.overallScoutingScore != null ? Number(row.overallScoutingScore) : null,
    };
  }
}
