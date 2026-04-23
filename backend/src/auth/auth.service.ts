import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { PlayerProfile } from '../entities/player-profile.entity';
import { ClubProfile } from '../entities/club-profile.entity';
import { Consent } from '../entities/consent.entity';
import { User } from '../entities/user.entity';
import { UsersService } from '../users/users.service';
import { AuthResponseDto } from './dto/auth-response.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

const BCRYPT_ROUNDS = 10;

interface JwtPayload {
  sub: string;
  email: string;
  role: User['role'];
  type: 'access' | 'refresh';
}

@Injectable()
export class AuthService {
  constructor(
    private readonly users: UsersService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    @InjectRepository(PlayerProfile)
    private readonly players: Repository<PlayerProfile>,
    @InjectRepository(ClubProfile)
    private readonly clubs: Repository<ClubProfile>,
    @InjectRepository(Consent)
    private readonly consents: Repository<Consent>,
  ) {}

  async register(dto: RegisterDto): Promise<AuthResponseDto> {
    const existing = await this.users.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException('Email already registered');
    }
    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);
    const user = await this.users.create({
      email: dto.email,
      passwordHash,
      role: dto.role,
    });

    if (dto.role === 'player') {
      const profile = this.players.create({
        userId: user.id,
        fullName: dto.full_name ?? null,
      });
      await this.players.save(profile);
    } else {
      const clubName = dto.club_name ?? dto.email.split('@')[0];
      const profile = this.clubs.create({
        userId: user.id,
        clubName,
      });
      await this.clubs.save(profile);
    }

    const now = new Date();
    await this.consents.insert([
      {
        userId: user.id,
        consentType: 'terms',
        granted: dto.accept_terms !== false,
        grantedAt: now,
      },
      {
        userId: user.id,
        consentType: 'privacy',
        granted: dto.accept_privacy !== false,
        grantedAt: now,
      },
    ]);

    return this.buildAuthResponse(user);
  }

  async login(dto: LoginDto): Promise<AuthResponseDto> {
    const user = await this.users.findByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const match = await bcrypt.compare(dto.password, user.passwordHash);
    if (!match) {
      throw new UnauthorizedException('Invalid credentials');
    }
    if (user.status === 'suspended') {
      throw new UnauthorizedException('Account suspended');
    }
    return this.buildAuthResponse(user);
  }

  async refresh(refreshToken: string): Promise<AuthResponseDto> {
    let payload: JwtPayload;
    try {
      payload = await this.jwt.verifyAsync<JwtPayload>(refreshToken);
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
    if (payload.type !== 'refresh') {
      throw new UnauthorizedException('Not a refresh token');
    }
    const user = await this.users.findById(payload.sub);
    if (!user) {
      throw new UnauthorizedException('User no longer exists');
    }
    return this.buildAuthResponse(user);
  }

  private async buildAuthResponse(user: User): Promise<AuthResponseDto> {
    const accessPayload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      type: 'access',
    };
    const refreshPayload: JwtPayload = { ...accessPayload, type: 'refresh' };

    const access_token = await this.jwt.signAsync(accessPayload, {
      expiresIn: this.config.get<string>('JWT_EXPIRY', '15m'),
    });
    const refresh_token = await this.jwt.signAsync(refreshPayload, {
      expiresIn: this.config.get<string>('JWT_REFRESH_EXPIRY', '7d'),
    });

    return {
      access_token,
      refresh_token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        status: user.status,
        subscription_plan: user.subscriptionPlan,
      },
    };
  }
}
