import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { AuditService } from './audit.service';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(private readonly audit: AuditService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const req = context.switchToHttp().getRequest();
    const method: string = req.method;

    // Only audit mutating requests.
    if (!['POST', 'PATCH', 'PUT', 'DELETE'].includes(method)) {
      return next.handle();
    }

    const actorUserId: string | null = req.user?.sub ?? null;
    const route: string = req.route?.path ?? req.url;

    return next.handle().pipe(
      tap(() => {
        void this.audit.log({
          actorUserId,
          actionType: `${method} ${route}`,
          metadata: {
            query: req.query,
            params: req.params,
            ip: req.ip,
            userAgent: req.get?.('user-agent'),
          },
        });
      }),
    );
  }
}
