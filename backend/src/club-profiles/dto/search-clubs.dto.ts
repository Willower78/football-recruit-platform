import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsInt,
  IsLatitude,
  IsLongitude,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class SearchClubsDto {
  @IsOptional() @IsString() country?: string;
  @IsOptional() @IsString() competitionLevel?: string;
  @IsOptional() @IsString() ageGroup?: string;

  @IsOptional() @Type(() => Boolean) @IsBoolean() verified?: boolean;

  @IsOptional() @Type(() => Number) @IsLatitude() lat?: number;
  @IsOptional() @Type(() => Number) @IsLongitude() lng?: number;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(20000) radiusKm?: number;

  @IsOptional() @Type(() => Number) @IsInt() @Min(1) page: number = 1;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(100) limit: number = 20;
}
