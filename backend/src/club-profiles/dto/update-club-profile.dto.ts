import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsLatitude,
  IsLongitude,
  IsOptional,
  IsString,
  IsUrl,
} from 'class-validator';

export class UpdateClubProfileDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  club_name?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  league_name?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  competition_level?: string;

  @ApiProperty({ required: false, type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  age_groups?: string[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUrl()
  website_url?: string;

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
}
