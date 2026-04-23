import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface JwtUser {
  sub: string;
  email: string;
  role: 'player' | 'club' | 'scout' | 'admin';
}

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): JwtUser | null => {
    const request = ctx
      .switchToHttp()
      .getRequest<{ user?: JwtUser | null }>();
    return request.user ?? null;
  },
);
