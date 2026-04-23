import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from '../entities/audit-log.entity';

export interface AuditEntry {
  actorUserId?: string | null;
  actionType: string;
  entityType?: string | null;
  entityId?: string | null;
  metadata?: Record<string, unknown>;
}

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(
    @InjectRepository(AuditLog)
    private readonly repo: Repository<AuditLog>,
  ) {}

  async log(entry: AuditEntry): Promise<void> {
    try {
      await this.repo.save(
        this.repo.create({
          actorUserId: entry.actorUserId ?? null,
          actionType: entry.actionType,
          entityType: entry.entityType ?? null,
          entityId: entry.entityId ?? null,
          metadata: entry.metadata ?? {},
        }),
      );
    } catch (err) {
      // Never let audit logging break the request path.
      this.logger.warn(`Failed to write audit log: ${(err as Error).message}`);
    }
  }
}
