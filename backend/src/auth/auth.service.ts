import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { DataSource, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { User, UserRole } from '../entities/user.entity';
import { PlayerProfile } from '../entities/player-profile.entity';
import { ClubProfile } from '../entities/club-profile.entity';
import { Consent } from '../entities/consent.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtPayload } from './strategies/jwt.strategy';

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
    @InjectRepository(PlayerProfile) private readonly playerProfiles: Repository<PlayerProfile>,
    @InjectRepository(ClubProfile) private readonly clubProfiles: Repository<ClubProfile>,
    @InjectRepository(Consent) private readonly consents: Repository<Consent>,
    private readonly jwt: JwtService,
    private readonly dataSource: DataSource,
  ) {}

  async register(dto: RegisterDto): Promise<{ user: User; tokens: TokenPair }> {
    const existing = await this.users.findOne({ where: { email: dto.email.toLowerCase() } });
    if (existing) throw new ConflictException('Email already in use');

    const rounds = Number(process.env.BCRYPT_ROUNDS ?? 10);
    const passwordHash = await bcrypt.hash(dto.password, rounds);

    const user = await this.dataSource.transaction(async (manager) => {
      const saved = await manager.getRepository(User).save(
        manager.getRepository(User).create({
          email: dto.email.toLowerCase(),
          passwordHash,
          role: dto.role,
          status: 'active',
        }),
      );

      if (dto.role === 'player') {
        await manager.getRepository(PlayerProfile).save(
          manager.getRepository(PlayerProfile).create({
            userId: saved.id,
            fullName: dto.name,
          }),
        );
      } else if (dto.role === 'club') {
        await manager.getRepository(ClubProfile).save(
          manager.getRepository(ClubProfile).create({
            userId: saved.id,
            clubName: dto.name,
          }),
        );
      }

      if (dto.acceptTerms) {
        await manager.getRepository(Consent).save([
          manager.getRepository(Consent).create({
            userId: saved.id,
            consentType: 'terms_of_service',
            granted: true,
            grantedAt: new Date(),
          }),
          manager.getRepository(Consent).create({
            userId: saved.id,
            consentType: 'privacy_policy',
            granted: true,
            grantedAt: new Date(),
          }),
        ]);
      }

      return saved;
    });

    const tokens = await this.issueTokens(user);
    return { user, tokens };
  }

  async login(dto: LoginDto): Promise<{ user: User; tokens: TokenPair }> {
    const user = await this.users.findOne({ where: { email: dto.email.toLowerCase() } });
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const ok = await bcrypt.compare(dto.password, user.passwordHash);
    if (!ok) throw new UnauthorizedException('Invalid credentials');

    if (user.status === 'suspended') {
      throw new UnauthorizedException('Account suspended');
    }

    user.lastLoginAt = new Date();
    await this.users.save(user);

    const tokens = await this.issueTokens(user);
    return { user, tokens };
  }

  async refresh(token: string): Promise<TokenPair> {
    try {
      const payload = await this.jwt.verifyAsync<JwtPayload>(token, {
        secret: process.env.JWT_REFRESH_SECRET ?? 'dev_refresh_secret_change_me',
      });
      if (payload.type !== 'refresh') throw new Error('Not a refresh token');
      const user = await this.users.findOne({ where: { id: payload.sub } });
      if (!user) throw new Error('User not found');
      return this.issueTokens(user);
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async me(userId: string) {
    const user = await this.users.findOne({
      where: { id: userId },
      relations: ['playerProfile', 'clubProfile'],
    });
    if (!user) throw new UnauthorizedException('User not found');

    const { passwordHash: _passwordHash, ...safe } = user;
    return safe;
  }

  private async issueTokens(user: User): Promise<TokenPair> {
    const basePayload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role as UserRole,
    };
    const accessToken = await this.jwt.signAsync(
      { ...basePayload, type: 'access' },
      {
        secret: process.env.JWT_ACCESS_SECRET ?? 'dev_access_secret_change_me',
        expiresIn: process.env.JWT_ACCESS_TTL ?? '15m',
      },
    );
    const refreshToken = await this.jwt.signAsync(
      { ...basePayload, type: 'refresh' },
      {
        secret: process.env.JWT_REFRESH_SECRET ?? 'dev_refresh_secret_change_me',
        expiresIn: process.env.JWT_REFRESH_TTL ?? '7d',
      },
    );
    return { accessToken, refreshToken };
  }
}
