import { IsNotEmpty, IsString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ConfirmEmailDto {
  @ApiProperty()
  @IsUUID()
  request_id!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  code!: string;
}
