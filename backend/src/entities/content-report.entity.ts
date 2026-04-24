import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './user.entity';

export type ReportStatus = 'pending' | 'reviewing' | 'resolved' | 'dismissed';

@Entity({ name: 'content_reports' })
export class ContentReport {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'reporter_user_id', type: 'uuid' })
  reporterUserId!: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'reporter_user_id' })
  reporter!: User;

  @Column({ name: 'reported_entity_type', type: 'text' })
  reportedEntityType!: string;

  @Column({ name: 'reported_entity_id', type: 'uuid' })
  reportedEntityId!: string;

  @Column({ type: 'text' })
  reason!: string;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({ type: 'text', default: 'pending' })
  status!: ReportStatus;

  @Column({ name: 'reviewed_by', type: 'uuid', nullable: true })
  reviewedBy!: string | null;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'reviewed_by' })
  reviewer!: User | null;

  @Column({ name: 'reviewed_at', type: 'timestamptz', nullable: true })
  reviewedAt!: Date | null;

  @Column({ name: 'resolution_notes', type: 'text', nullable: true })
  resolutionNotes!: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;
}
