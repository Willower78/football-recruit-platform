import { IsString, IsOptional, IsDateString, IsInt, Min, MaxLength } from 'class-validator';

export class CreateTryoutDto {
  @IsString()
  @MaxLength(300)
  title!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  @MaxLength(60)
  sport?: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  position?: string;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  ageGroup?: string;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  location?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  city?: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  country?: string;

  @IsOptional()
  @IsDateString()
  tryoutDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  maxParticipants?: number;

  @IsOptional()
  @IsString()
  requirements?: string;
}
