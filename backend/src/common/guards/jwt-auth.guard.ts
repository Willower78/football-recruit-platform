import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private readonly reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext): boolean | Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }
    const result = super.canActivate(context);
    if (typeof result === 'boolean') {
      return result;
    }
    if (result instanceof Promise) {
      return result;
    }
    return new Promise<boolean>((resolve, reject) => {
      result.subscribe({
        next: (value) => resolve(Boolean(value)),
        error: (err) => reject(err),
      });
    });
  }
}
