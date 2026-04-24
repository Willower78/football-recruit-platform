import { IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserRoleDto {
  @ApiProperty({ enum: ['player', 'club', 'scout', 'admin'] })
  @IsIn(['player', 'club', 'scout', 'admin'])
  role!: string;
}
