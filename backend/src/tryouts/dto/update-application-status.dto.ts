import { IsIn, IsString } from 'class-validator';

export class UpdateApplicationStatusDto {
  @IsString()
  @IsIn(['accepted', 'rejected'])
  status!: 'accepted' | 'rejected';
}
