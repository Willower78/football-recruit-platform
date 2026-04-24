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

export type AnalysisJobStatus =
  | 'queued'
  | 'downloading'
  | 'preprocessing'
  | 'detecting'
  | 'tracking'
  | 'calibrating'
  | 'event_detection'
  | 'aggregating'
  | 'generating_report'
  | 'clipping_highlights'
  | 'completed'
  | 'failed';

@Entity({ name: 'analysis_jobs' })
export class AnalysisJob {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Column({ name: 'user_id', type: 'uuid' })
  userId!: string;

  @Column({ name: 'video_id', type: 'uuid', nullable: true })
  videoId!: string | null;

  @Column({ name: 'imported_match_id', type: 'uuid', nullable: true })
  importedMatchId!: string | null;

  @Column({ name: 'scouting_report_id', type: 'uuid', nullable: true })
  scoutingReportId!: string | null;

  @Column({ type: 'text', default: 'queued' })
  status!: AnalysisJobStatus;

  @Column({ name: 'progress_pct', type: 'int', default: 0 })
  progressPct!: number;

  @Column({ name: 'current_stage', type: 'text', nullable: true })
  currentStage!: string | null;

  @Column({ name: 'error_message', type: 'text', nullable: true })
  errorMessage!: string | null;

  @Column({ name: 'started_at', type: 'timestamptz', nullable: true })
  startedAt!: Date | null;

  @Column({ name: 'completed_at', type: 'timestamptz', nullable: true })
  completedAt!: Date | null;

  @Column({ name: 'processing_time_sec', type: 'int', nullable: true })
  processingTimeSec!: number | null;

  @Column({ type: 'jsonb', default: () => "'{}'" })
  metadata!: Record<string, unknown>;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}
