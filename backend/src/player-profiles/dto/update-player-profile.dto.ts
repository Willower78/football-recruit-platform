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
  Max,
  Min,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdatePlayerProfileDto {
  @ApiProperty({ required: false }) @IsOptional() @IsString() fullName?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsDateString() dateOfBirth?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() nationality?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() city?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() country?: string;

  @ApiProperty({ required: false }) @IsOptional() @IsLatitude() latitude?: number;
  @ApiProperty({ required: false }) @IsOptional() @IsLongitude() longitude?: number;

  @ApiProperty({ enum: ['left', 'right', 'both'], required: false })
  @IsOptional()
  @IsIn(['left', 'right', 'both'])
  dominantFoot?: 'left' | 'right' | 'both';

  @ApiProperty({ required: false }) @IsOptional() @IsString() primaryPosition?: string;

  @ApiProperty({ type: [String], required: false })
  @IsOptional()
  @IsArray()
  secondaryPositions?: string[];

  @ApiProperty({ required: false }) @IsOptional() @IsInt() @Min(100) @Max(250) heightCm?: number;
  @ApiProperty({ required: false }) @IsOptional() @IsInt() @Min(30)  @Max(200) weightKg?: number;

  @ApiProperty({ required: false }) @IsOptional() @IsString() currentClub?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsBoolean() freeAgent?: boolean;

  @ApiProperty({ enum: ['available', 'open_to_offers', 'not_available'], required: false })
  @IsOptional()
  @IsIn(['available', 'open_to_offers', 'not_available'])
  availabilityStatus?: 'available' | 'open_to_offers' | 'not_available';

  @ApiProperty({ required: false }) @IsOptional() @IsString() bio?: string;

  @ApiProperty({ enum: ['public', 'clubs_only', 'private'], required: false })
  @IsOptional()
  @IsIn(['public', 'clubs_only', 'private'])
  visibilityLevel?: 'public' | 'clubs_only' | 'private';

  @ApiProperty({ required: false }) @IsOptional() @IsBoolean() guardianRequired?: boolean;
}
