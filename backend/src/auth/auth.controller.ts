import { Body, Controller, Get, HttpCode, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshDto } from './dto/refresh.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { Public } from './decorators/public.decorator';
import { CurrentUser, JwtUser } from './decorators/current-user.decorator';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Public()
  @Post('register')
  @ApiOperation({ summary: 'Create a new user + empty profile and return JWTs' })
  async register(@Body() dto: RegisterDto) {
    const { user, tokens } = await this.auth.register(dto);
    return { user: sanitize(user), ...tokens };
  }

  @Public()
  @Post('login')
  @HttpCode(200)
  @ApiOperation({ summary: 'Exchange credentials for an access + refresh token' })
  async login(@Body() dto: LoginDto) {
    const { user, tokens } = await this.auth.login(dto);
    return { user: sanitize(user), ...tokens };
  }

  @Public()
  @Post('refresh')
  @HttpCode(200)
  @ApiOperation({ summary: 'Rotate refresh token for a fresh access + refresh pair' })
  async refresh(@Body() dto: RefreshDto) {
    return this.auth.refresh(dto.refreshToken);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('me')
  @ApiOperation({ summary: 'Return the authenticated user + profile' })
  async me(@CurrentUser() user: JwtUser) {
    return this.auth.me(user.sub);
  }
}

function sanitize<T extends { passwordHash?: string }>(entity: T) {
  const { passwordHash: _passwordHash, ...safe } = entity as T & { passwordHash?: string };
  return safe;
}
