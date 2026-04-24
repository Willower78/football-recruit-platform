import { IsIn, IsOptional, IsString, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateReportDto {
  @ApiProperty({ enum: ['user', 'video', 'recommendation', 'scouting_report'] })
  @IsIn(['user', 'video', 'recommendation', 'scouting_report'])
  reported_entity_type!: string;

  @ApiProperty()
  @IsUUID()
  reported_entity_id!: string;

  @ApiProperty({
    enum: ['inappropriate', 'fake', 'spam', 'harassment', 'underage_concern', 'other'],
  })
  @IsIn(['inappropriate', 'fake', 'spam', 'harassment', 'underage_concern', 'other'])
  reason!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;
}
