import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsIn,
  IsInt,
  IsLatitude,
  IsLongitude,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class SearchPlayersDto {
  @IsOptional() @IsString() position?: string;

  @IsOptional() @Type(() => Number) @IsInt() @Min(10) @Max(60) ageMin?: number;
  @IsOptional() @Type(() => Number) @IsInt() @Min(10) @Max(60) ageMax?: number;

  @IsOptional() @IsString() country?: string;

  @IsOptional() @Type(() => Number) @IsLatitude() lat?: number;
  @IsOptional() @Type(() => Number) @IsLongitude() lng?: number;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(20000) radiusKm?: number;

  @IsOptional() @IsIn(['left', 'right', 'both']) dominantFoot?: 'left' | 'right' | 'both';

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  freeAgent?: boolean;

  @IsOptional() @IsIn(['available', 'open_to_offers', 'not_available']) availabilityStatus?: string;

  @IsOptional() @Type(() => Number) @IsInt() @Min(1) page: number = 1;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(100) limit: number = 20;
}
