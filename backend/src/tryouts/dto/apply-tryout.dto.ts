import { IsOptional, IsString, MaxLength } from 'class-validator';

export class ApplyTryoutDto {
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  message?: string;
}
