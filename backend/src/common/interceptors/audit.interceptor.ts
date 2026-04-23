import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { AuditService } from '../../audit/audit.service';
import { JwtUser } from '../decorators/current-user.decorator';

interface RequestWithUser {
  method: string;
  originalUrl?: string;
  url?: string;
  params?: Record<string, string>;
  user?: JwtUser;
}

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(private readonly audit: AuditService) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler<unknown>,
  ): Observable<unknown> {
    const req = context
      .switchToHttp()
      .getRequest<RequestWithUser>();
    const method = req.method.toUpperCase();
    const mutating = method === 'POST' || method === 'PATCH' || method === 'DELETE';

    return next.handle().pipe(
      tap(() => {
        if (!mutating) {
          return;
        }
        const actor = req.user?.sub;
        void this.audit.log(
          actor ?? null,
          method,
          'http',
          req.params?.id,
          {
            path: req.originalUrl ?? req.url,
          },
        );
      }),
    );
  }
}
