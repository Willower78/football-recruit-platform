import { IsOptional, IsUUID } from 'class-validator';

export class CreateAnalysisJobDto {
  @IsOptional()
  @IsUUID()
  videoId?: string;

  @IsOptional()
  @IsUUID()
  importedMatchId?: string;
}
