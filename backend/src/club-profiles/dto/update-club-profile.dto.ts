import {
  IsArray,
  IsLatitude,
  IsLongitude,
  IsOptional,
  IsString,
  IsUrl,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateClubProfileDto {
  @ApiProperty({ required: false }) @IsOptional() @IsString() clubName?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() country?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() city?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsLatitude() latitude?: number;
  @ApiProperty({ required: false }) @IsOptional() @IsLongitude() longitude?: number;
  @ApiProperty({ required: false }) @IsOptional() @IsString() leagueName?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() competitionLevel?: string;
  @ApiProperty({ type: [String], required: false }) @IsOptional() @IsArray() ageGroups?: string[];
  @ApiProperty({ required: false }) @IsOptional() @IsString() description?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsUrl({ require_tld: false }) websiteUrl?: string;
}
