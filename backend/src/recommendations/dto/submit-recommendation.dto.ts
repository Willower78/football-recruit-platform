import {
  IsBoolean,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  Max,
  Min,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SubmitRecommendationDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  coach_name!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  coach_role?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  coach_club?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  relationship_duration?: string;

  @ApiProperty({ minimum: 1, maximum: 5 })
  @IsInt()
  @Min(1)
  @Max(5)
  overall_rating!: number;

  @ApiProperty({ minLength: 50 })
  @IsString()
  @MinLength(50)
  strengths_text!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  development_text?: string;

  @ApiPropertyOptional({ description: 'Domain ratings object: { domain_key: 1-5 }' })
  @IsOptional()
  @IsObject()
  domain_ratings?: Record<string, number>;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  would_recommend?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  additional_notes?: string;
}
