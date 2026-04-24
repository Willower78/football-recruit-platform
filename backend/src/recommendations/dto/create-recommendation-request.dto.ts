import { IsEmail, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateRecommendationRequestDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  coach_name!: string;

  @ApiProperty()
  @IsEmail()
  coach_email!: string;
}
