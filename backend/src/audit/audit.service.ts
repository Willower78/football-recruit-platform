import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from '../entities/audit-log.entity';

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(
    @InjectRepository(AuditLog)
    private readonly logs: Repository<AuditLog>,
  ) {}

  async log(
    actorUserId: string | null,
    actionType: string,
    entityType: string,
    entityId: string | null | undefined,
    metadata: Record<string, unknown> = {},
  ): Promise<void> {
    try {
      const entity = this.logs.create({
        actorUserId,
        actionType,
        entityType,
        entityId: entityId ?? null,
        metadata,
      });
      await this.logs.save(entity);
    } catch (err) {
      this.logger.warn(
        `Failed to write audit log: ${(err as Error).message}`,
      );
    }
  }
}
