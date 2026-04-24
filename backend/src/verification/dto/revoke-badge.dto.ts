import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RevokeBadgeDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  revoke_reason!: string;
}
