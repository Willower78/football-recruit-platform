import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsIn,
  IsInt,
  IsLatitude,
  IsLongitude,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class UpdatePlayerProfileDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  full_name?: string;

  @ApiProperty({ required: false, type: String, format: 'date' })
  @IsOptional()
  @IsDateString()
  date_of_birth?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  nationality?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsLatitude()
  @Type(() => Number)
  latitude?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsLongitude()
  @Type(() => Number)
  longitude?: number;

  @ApiProperty({ required: false, enum: ['left', 'right', 'both'] })
  @IsOptional()
  @IsIn(['left', 'right', 'both'])
  dominant_foot?: 'left' | 'right' | 'both';

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  primary_position?: string;

  @ApiProperty({ required: false, type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  secondary_positions?: string[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  height_cm?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  weight_kg?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  current_club?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  free_agent?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  availability_status?: string;

  @ApiProperty({ required: false, maxLength: 500 })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  bio?: string;

  @ApiProperty({
    required: false,
    enum: ['public', 'clubs_only', 'private'],
  })
  @IsOptional()
  @IsIn(['public', 'clubs_only', 'private'])
  visibility_level?: 'public' | 'clubs_only' | 'private';

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  guardian_required?: boolean;

  @ApiProperty({ required: false, description: 'Competition level label' })
  @IsOptional()
  @IsString()
  competition_level?: string;
}
