import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsIn } from 'class-validator';

export class RecordConsentDto {
  @ApiProperty({
    enum: ['terms', 'privacy', 'scouting_ai', 'marketing', 'guardian_approval'],
  })
  @IsIn(['terms', 'privacy', 'scouting_ai', 'marketing', 'guardian_approval'])
  consent_type!:
    | 'terms'
    | 'privacy'
    | 'scouting_ai'
    | 'marketing'
    | 'guardian_approval';

  @ApiProperty()
  @IsBoolean()
  granted!: boolean;
}
