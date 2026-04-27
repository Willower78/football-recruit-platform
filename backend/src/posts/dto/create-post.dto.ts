import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreatePostDto {
  @ApiProperty({ maxLength: 2000 })
  @IsString()
  @MaxLength(2000)
  content!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  mediaUrl?: string;

  @ApiPropertyOptional({ enum: ['video', 'image'] })
  @IsOptional()
  @IsIn(['video', 'image'])
  mediaType?: 'video' | 'image';

  @ApiPropertyOptional({ enum: ['public', 'followers', 'private'], default: 'public' })
  @IsOptional()
  @IsIn(['public', 'followers', 'private'])
  visibility?: 'public' | 'followers' | 'private';
}
