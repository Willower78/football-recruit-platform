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

export type AssessmentStatus = 'draft' | 'submitted' | 'reviewed';
export type AssessmentVisibility = 'private' | 'summary_only' | 'full';

@Entity({ name: 'psych_assessments' })
export class PsychAssessment {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Column({ name: 'user_id', type: 'uuid' })
  userId!: string;

  @Column({ type: 'varchar', length: 16, default: 'v1' })
  version!: string;

  @Column({ type: 'varchar', length: 20, default: 'draft' })
  status!: AssessmentStatus;

  @Column({ type: 'varchar', length: 20, default: 'private' })
  visibility!: AssessmentVisibility;

  @Column({ name: 'completed_at', type: 'timestamptz', nullable: true })
  completedAt!: Date | null;

  @Column({ name: 'consent_id', type: 'uuid', nullable: true })
  consentId!: string | null;

  @Column({ type: 'jsonb', default: () => "'{}'" })
  metadata!: Record<string, unknown>;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}
