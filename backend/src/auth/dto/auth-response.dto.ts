import { ApiProperty } from '@nestjs/swagger';

export class AuthUserDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  email!: string;

  @ApiProperty()
  role!: string;

  @ApiProperty()
  status!: string;

  @ApiProperty()
  subscription_plan!: string;
}

export class AuthResponseDto {
  @ApiProperty()
  access_token!: string;

  @ApiProperty()
  refresh_token!: string;

  @ApiProperty({ type: () => AuthUserDto })
  user!: AuthUserDto;
}
