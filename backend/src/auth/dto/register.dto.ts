import { IsBoolean, IsEmail, IsIn, IsOptional, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: 'player@example.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'StrongPass123!' })
  @IsString()
  @MinLength(8)
  password!: string;

  @ApiProperty({ enum: ['player', 'club'] })
  @IsIn(['player', 'club'])
  role!: 'player' | 'club';

  @ApiProperty({ example: 'Jane Doe' })
  @IsString()
  name!: string;

  @ApiProperty({ required: false, description: 'Whether the user has accepted terms + privacy.' })
  @IsOptional()
  @IsBoolean()
  acceptTerms?: boolean;
}
