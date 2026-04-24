import { IsIn, IsOptional, IsString, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class GrantBadgeDto {
  @ApiProperty({ enum: ['club', 'coach_recommendation', 'player'] })
  @IsIn(['club', 'coach_recommendation', 'player'])
  entity_type!: string;

  @ApiProperty()
  @IsUUID()
  entity_id!: string;

  @ApiProperty({ enum: ['verified', 'official', 'trusted'] })
  @IsIn(['verified', 'official', 'trusted'])
  badge_type!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  expires_at?: string;
}
