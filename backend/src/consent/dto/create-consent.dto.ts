import { IsBoolean, IsDateString, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateConsentDto {
  @ApiProperty({ example: 'marketing_emails' })
  @IsString()
  consentType!: string;

  @ApiProperty({ example: true })
  @IsBoolean()
  granted!: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  expiresAt?: string;
}
