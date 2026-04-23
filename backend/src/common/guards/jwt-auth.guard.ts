import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private readonly reflector: Reflector) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    try {
      const result = super.canActivate(context);
      if (typeof result === 'boolean') {
        return isPublic ? true : result;
      }
      if (result instanceof Promise) {
        const value = await result;
        return isPublic ? true : value;
      }
      const value = await new Promise<boolean>((resolve, reject) => {
        result.subscribe({
          next: (v) => resolve(Boolean(v)),
          error: (err) => reject(err),
        });
      });
      return isPublic ? true : value;
    } catch (err) {
      if (isPublic) {
        return true;
      }
      throw err;
    }
  }

  handleRequest<TUser = unknown>(
    err: unknown,
    user: TUser,
    _info: unknown,
    context: ExecutionContext,
  ): TUser {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return user ?? (null as unknown as TUser);
    }
    if (err || !user) {
      throw (err as Error) ?? new UnauthorizedException();
    }
    return user;
  }
}
