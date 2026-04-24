import { IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateRecommendationVisibilityDto {
  @ApiProperty({ enum: ['public', 'clubs_only', 'private'] })
  @IsIn(['public', 'clubs_only', 'private'])
  visibility!: 'public' | 'clubs_only' | 'private';
}
