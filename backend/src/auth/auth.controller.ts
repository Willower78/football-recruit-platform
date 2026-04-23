import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PlayerProfile } from '../entities/player-profile.entity';
import { ClubProfile } from '../entities/club-profile.entity';
import {
  CurrentUser,
  JwtUser,
} from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';
import { AuthResponseDto } from './dto/auth-response.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshDto } from './dto/refresh.dto';
import { RegisterDto } from './dto/register.dto';

@ApiTags('auth')
@UseGuards(RolesGuard)
@Controller('auth')
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    private readonly users: UsersService,
    @InjectRepository(PlayerProfile)
    private readonly players: Repository<PlayerProfile>,
    @InjectRepository(ClubProfile)
    private readonly clubs: Repository<ClubProfile>,
  ) {}

  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a new player or club user.' })
  @ApiOkResponse({ type: AuthResponseDto })
  register(@Body() dto: RegisterDto): Promise<AuthResponseDto> {
    return this.auth.register(dto);
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Log in with email and password.' })
  @ApiOkResponse({ type: AuthResponseDto })
  login(@Body() dto: LoginDto): Promise<AuthResponseDto> {
    return this.auth.login(dto);
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Exchange a refresh token for a fresh JWT pair.' })
  @ApiOkResponse({ type: AuthResponseDto })
  refresh(@Body() dto: RefreshDto): Promise<AuthResponseDto> {
    return this.auth.refresh(dto.refresh_token);
  }

  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get the currently authenticated user + profile.' })
  async me(@CurrentUser() user: JwtUser): Promise<{
    id: string;
    email: string;
    role: string;
    status: string;
    subscription_plan: string;
    player_profile: PlayerProfile | null;
    club_profile: ClubProfile | null;
  }> {
    const record = await this.users.findById(user.sub);
    if (!record) {
      throw new NotFoundException('User not found');
    }
    const [playerProfile, clubProfile] = await Promise.all([
      user.role === 'player'
        ? this.players.findOne({ where: { userId: record.id } })
        : Promise.resolve(null),
      user.role === 'club'
        ? this.clubs.findOne({ where: { userId: record.id } })
        : Promise.resolve(null),
    ]);

    return {
      id: record.id,
      email: record.email,
      role: record.role,
      status: record.status,
      subscription_plan: record.subscriptionPlan,
      player_profile: playerProfile ?? null,
      club_profile: clubProfile ?? null,
    };
  }
}
