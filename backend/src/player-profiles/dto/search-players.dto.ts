import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsIn,
  IsInt,
  IsLatitude,
  IsLongitude,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class SearchPlayersDto {
  // --- Basic Profile Filters ---
  @IsOptional() @IsString() position?: string;
  @IsOptional() @IsString() positions?: string; // comma-separated

  @IsOptional() @Type(() => Number) @IsInt() @Min(10) @Max(60) ageMin?: number;
  @IsOptional() @Type(() => Number) @IsInt() @Min(10) @Max(60) ageMax?: number;

  @IsOptional() @IsString() nationality?: string;
  @IsOptional() @IsString() country?: string;
  @IsOptional() @IsString() city?: string;

  @IsOptional() @Type(() => Number) @IsLatitude() lat?: number;
  @IsOptional() @Type(() => Number) @IsLongitude() lng?: number;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(20000) radiusKm?: number;

  @IsOptional() @IsIn(['left', 'right', 'both']) dominantFoot?: 'left' | 'right' | 'both';

  @IsOptional() @Type(() => Number) @IsInt() @Min(100) @Max(250) heightMin?: number;
  @IsOptional() @Type(() => Number) @IsInt() @Min(100) @Max(250) heightMax?: number;
  @IsOptional() @Type(() => Number) @IsInt() @Min(30) @Max(200) weightMin?: number;
  @IsOptional() @Type(() => Number) @IsInt() @Min(30) @Max(200) weightMax?: number;

  // --- Status Filters ---
  @IsOptional() @Type(() => Boolean) @IsBoolean() freeAgent?: boolean;
  @IsOptional() @IsIn(['available', 'open_to_offers', 'not_available']) availabilityStatus?: string;
  @IsOptional() @IsString() competitionLevel?: string;

  // --- Scouting Rating Filters (1-10 against player_aggregate_ratings) ---
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(10) minFirstTouch?: number;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(10) minPassing?: number;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(10) minDribbling?: number;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(10) minShooting?: number;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(10) minPositionTechnique?: number;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(10) minOffBallMovement?: number;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(10) minGameReading?: number;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(10) minTacticalUnderstanding?: number;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(10) minSpeedAgility?: number;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(10) minStrengthStamina?: number;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(10) minDecisionMaking?: number;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(10) minMentality?: number;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(10) minBodyLanguage?: number;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(10) minOverallScouting?: number;

  // --- Assessment Filters (0-100 against psych_scores) ---
  @IsOptional() @Type(() => Number) @IsInt() @Min(0) @Max(100) minReadinessScore?: number;
  @IsOptional() @Type(() => Number) @IsInt() @Min(0) @Max(100) minSelfRegulation?: number;
  @IsOptional() @Type(() => Number) @IsInt() @Min(0) @Max(100) minResilience?: number;
  @IsOptional() @Type(() => Number) @IsInt() @Min(0) @Max(100) minCommitment?: number;
  @IsOptional() @Type(() => Number) @IsInt() @Min(0) @Max(100) minAchievementMotivation?: number;
  @IsOptional() @Type(() => Number) @IsInt() @Min(0) @Max(100) minEmotionalControl?: number;
  @IsOptional() @Type(() => Number) @IsInt() @Min(0) @Max(100) minConfidence?: number;
  @IsOptional() @Type(() => Number) @IsInt() @Min(0) @Max(100) minCoachability?: number;
  @IsOptional() @Type(() => Number) @IsInt() @Min(0) @Max(100) minTeamCommunication?: number;
  @IsOptional() @Type(() => Number) @IsInt() @Min(0) @Max(100) minFocusUnderPressure?: number;
  @IsOptional() @Type(() => Number) @IsInt() @Min(0) @Max(100) minProfessionalHabits?: number;

  // --- Stats Filters ---
  @IsOptional() @Type(() => Number) @IsInt() @Min(0) minGoals?: number;
  @IsOptional() @Type(() => Number) @IsInt() @Min(0) minAssists?: number;
  @IsOptional() @Type(() => Number) @IsInt() @Min(0) minMatches?: number;
  @IsOptional() @Type(() => Number) @IsInt() @Min(0) minMinutes?: number;

  // --- Recommendation Filters ---
  @IsOptional() @Type(() => Boolean) @IsBoolean() hasRecommendations?: boolean;
  @IsOptional() @Type(() => Boolean) @IsBoolean() hasVerifiedRecommendations?: boolean;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(5) minCoachRating?: number;

  // --- Scouting Report Filters ---
  @IsOptional() @Type(() => Boolean) @IsBoolean() hasScoutingReport?: boolean;
  @IsOptional() @Type(() => Number) @IsNumber() minScoutingScore?: number;

  // --- Sorting ---
  @IsOptional()
  @IsIn(['name', 'age', 'position', 'created_at', 'overall_scouting_score', 'readiness_score'])
  sortBy?: string;

  @IsOptional() @IsIn(['asc', 'desc']) sortOrder?: 'asc' | 'desc';

  // --- Pagination ---
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) page: number = 1;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(100) limit: number = 20;
}
