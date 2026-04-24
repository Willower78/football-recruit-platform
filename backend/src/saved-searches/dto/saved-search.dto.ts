import { IsObject, IsOptional, IsString } from 'class-validator';

export class CreateSavedSearchDto {
  @IsString() name!: string;
  @IsObject() filters!: Record<string, unknown>;
  @IsOptional() @IsString() sortBy?: string;
  @IsOptional() @IsString() sortOrder?: string;
}

export class UpdateSavedSearchDto {
  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsObject() filters?: Record<string, unknown>;
  @IsOptional() @IsString() sortBy?: string;
  @IsOptional() @IsString() sortOrder?: string;
}
