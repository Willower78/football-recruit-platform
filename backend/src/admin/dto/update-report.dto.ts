import { IsIn, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateReportDto {
  @ApiProperty({ enum: ['reviewing', 'resolved', 'dismissed'] })
  @IsIn(['reviewing', 'resolved', 'dismissed'])
  status!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  resolution_notes?: string;
}
