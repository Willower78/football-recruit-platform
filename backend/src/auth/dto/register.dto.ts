import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEmail,
  IsIn,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export type RegisterRole = 'player' | 'club';

export class RegisterDto {
  @ApiProperty({ example: 'player@example.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ minLength: 8 })
  @IsString()
  @MinLength(8)
  password!: string;

  @ApiProperty({ enum: ['player', 'club'] })
  @IsIn(['player', 'club'])
  role!: RegisterRole;

  @ApiProperty({ required: false, description: 'Required when role=player' })
  @IsOptional()
  @IsString()
  full_name?: string;

  @ApiProperty({ required: false, description: 'Required when role=club' })
  @IsOptional()
  @IsString()
  club_name?: string;

  @ApiProperty({ required: false, description: 'User accepted Terms of Service' })
  @IsOptional()
  @IsBoolean()
  accept_terms?: boolean;

  @ApiProperty({ required: false, description: 'User accepted Privacy Policy' })
  @IsOptional()
  @IsBoolean()
  accept_privacy?: boolean;
}
