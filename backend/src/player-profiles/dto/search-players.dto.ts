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

export class SearchPlayersDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  position?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  @Min(5)
  @Max(80)
  @Type(() => Number)
  age_min?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  @Min(5)
  @Max(80)
  @Type(() => Number)
  age_max?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  country?: string;

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

  @ApiProperty({ required: false, enum: ['left', 'right', 'both'] })
  @IsOptional()
  @IsIn(['left', 'right', 'both'])
  dominant_foot?: 'left' | 'right' | 'both';

  @ApiProperty({ required: false })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  free_agent?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  availability_status?: string;

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

  @ApiProperty({ required: false, enum: ['created_at', 'full_name'] })
  @IsOptional()
  @IsIn(['created_at', 'full_name'])
  sort_by?: 'created_at' | 'full_name' = 'created_at';

  @ApiProperty({ required: false, enum: ['asc', 'desc'] })
  @IsOptional()
  @IsIn(['asc', 'desc'])
  sort_order?: 'asc' | 'desc' = 'desc';
}
