import { IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class DeleteUserDto {
  @ApiProperty({ enum: ['soft', 'gdpr_full'] })
  @IsIn(['soft', 'gdpr_full'])
  type!: string;
}
