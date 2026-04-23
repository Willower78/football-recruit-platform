import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsIn,
  IsInt,
  IsLatitude,
  IsLongitude,
  IsOptional,
  IsPositive,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class SearchClubsDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  competition_level?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  age_group?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  verified?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsLatitude()
  @Type(() => Number)
  lat?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsLongitude()
  @Type(() => Number)
  lng?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsPositive()
  @Type(() => Number)
  radius_km?: number;

  @ApiProperty({ required: false, default: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page?: number = 1;

  @ApiProperty({ required: false, default: 20 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  limit?: number = 20;

  @ApiProperty({ required: false, enum: ['created_at', 'club_name'] })
  @IsOptional()
  @IsIn(['created_at', 'club_name'])
  sort_by?: 'created_at' | 'club_name' = 'created_at';

  @ApiProperty({ required: false, enum: ['asc', 'desc'] })
  @IsOptional()
  @IsIn(['asc', 'desc'])
  sort_order?: 'asc' | 'desc' = 'desc';
}
