import { Type } from 'class-transformer';
import {
  IsArray,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';

export class CreateScoutingRatingDto {
  @IsOptional() @IsUUID() categoryId?: string;
  @IsOptional() @IsString() categorySlug?: string;

  @IsInt() @Min(1) @Max(10) score!: number;

  @IsOptional() @IsNumber() @Min(0) @Max(1) confidence?: number;
  @IsOptional() @IsString() notes?: string;
}

export class BulkCreateScoutingRatingsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateScoutingRatingDto)
  ratings!: CreateScoutingRatingDto[];
}
