import { IsIn, IsOptional, IsString, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateVerificationRequestDto {
  @ApiProperty({ enum: ['club', 'coach_recommendation'] })
  @IsIn(['club', 'coach_recommendation'])
  entity_type!: string;

  @ApiProperty()
  @IsUUID()
  entity_id!: string;

  @ApiProperty({ enum: ['email_domain', 'document', 'manual_review', 'api_check'] })
  @IsIn(['email_domain', 'document', 'manual_review', 'api_check'])
  verification_method!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  evidence_notes?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  evidence_url?: string;
}
