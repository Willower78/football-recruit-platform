import { Type } from 'class-transformer';
import { ArrayMinSize, IsArray, ValidateNested } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { SubmitResponseDto } from './submit-response.dto';

export class SubmitBatchResponsesDto {
  @ApiProperty({ type: [SubmitResponseDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => SubmitResponseDto)
  responses!: SubmitResponseDto[];
}
