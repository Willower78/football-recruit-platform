import { IsIn, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ReviewVerificationRequestDto {
  @ApiProperty({ enum: ['approved', 'rejected'] })
  @IsIn(['approved', 'rejected'])
  status!: 'approved' | 'rejected';

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  rejection_reason?: string;

  @ApiPropertyOptional({ enum: ['verified', 'official'] })
  @IsOptional()
  @IsIn(['verified', 'official'])
  badge_type?: 'verified' | 'official';
}
