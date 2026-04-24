import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';

export type VerificationMethod = 'email_domain' | 'document' | 'manual_review' | 'api_check';
export type VerificationRequestStatus = 'pending' | 'approved' | 'rejected' | 'expired';

@Entity({ name: 'verification_requests' })
export class VerificationRequest {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId!: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Column({ name: 'entity_type', type: 'varchar', length: 40 })
  entityType!: string;

  @Column({ name: 'entity_id', type: 'uuid' })
  entityId!: string;

  @Column({ name: 'verification_method', type: 'varchar', length: 40 })
  verificationMethod!: VerificationMethod;

  @Column({ type: 'jsonb', default: () => "'{}'::jsonb" })
  evidence!: Record<string, unknown>;

  @Column({ type: 'varchar', length: 20, default: 'pending' })
  status!: VerificationRequestStatus;

  @Column({ name: 'reviewed_by', type: 'uuid', nullable: true })
  reviewedBy!: string | null;

  @Column({ name: 'reviewed_at', type: 'timestamptz', nullable: true })
  reviewedAt!: Date | null;

  @Column({ name: 'rejection_reason', type: 'text', nullable: true })
  rejectionReason!: string | null;

  @Column({ name: 'verification_code', type: 'varchar', length: 10, nullable: true })
  verificationCode!: string | null;

  @Column({ name: 'code_expires_at', type: 'timestamptz', nullable: true })
  codeExpiresAt!: Date | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}
