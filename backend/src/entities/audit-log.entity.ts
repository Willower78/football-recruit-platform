import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'audit_logs' })
export class AuditLog {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id!: string;

  @Column({ type: 'uuid', name: 'actor_user_id', nullable: true })
  actorUserId!: string | null;

  @Column({ type: 'text', name: 'action_type', nullable: true })
  actionType!: string | null;

  @Column({ type: 'text', name: 'entity_type', nullable: true })
  entityType!: string | null;

  @Column({ type: 'uuid', name: 'entity_id', nullable: true })
  entityId!: string | null;

  @Column({ type: 'jsonb', nullable: true })
  metadata!: Record<string, unknown> | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;
}
