import { IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class StartAssessmentDto {
  @ApiProperty({ description: 'Consent record ID — player must consent before starting' })
  @IsUUID()
  consent_id!: string;
}
