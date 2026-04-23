import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtUser } from '../../common/decorators/current-user.decorator';

interface JwtPayload {
  sub: string;
  email: string;
  role: JwtUser['role'];
  type?: 'access' | 'refresh';
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(config: ConfigService) {
    const secret = config.get<string>('JWT_SECRET');
    if (!secret) {
      throw new Error('JWT_SECRET is not configured');
    }
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  validate(payload: JwtPayload): JwtUser {
    if (payload.type === 'refresh') {
      // Refresh tokens cannot be used to access protected routes directly.
      throw new UnauthorizedException('Refresh token cannot be used for access');
    }
    return {
      sub: payload.sub,
      email: payload.email,
      role: payload.role,
    };
  }
}
