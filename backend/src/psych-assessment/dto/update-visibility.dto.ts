import { IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateVisibilityDto {
  @ApiProperty({ enum: ['private', 'summary_only', 'full'] })
  @IsIn(['private', 'summary_only', 'full'])
  visibility!: 'private' | 'summary_only' | 'full';
}
