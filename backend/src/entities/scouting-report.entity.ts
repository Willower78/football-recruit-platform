import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { PlayerProfile } from './player-profile.entity';

export type ReportGeneratedBy = 'ai' | 'scout' | 'hybrid';
export type ReportStatus = 'draft' | 'reviewed' | 'published';

@Entity({ name: 'scouting_reports' })
export class ScoutingReport {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => PlayerProfile, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'player_id' })
  player!: PlayerProfile;

  @Column({ name: 'player_id', type: 'uuid' })
  playerId!: string;

  @Column({ name: 'video_id', type: 'uuid', nullable: true })
  videoId!: string | null;

  @Column({ name: 'generated_by', type: 'varchar', length: 20 })
  generatedBy!: ReportGeneratedBy;

  @Column({ type: 'jsonb', default: () => "'{}'" })
  scores!: Record<string, unknown>;

  @Column({ type: 'jsonb', default: () => "'[]'" })
  strengths!: string[];

  @Column({ type: 'jsonb', default: () => "'[]'" })
  weaknesses!: string[];

  @Column({ name: 'summary_text', type: 'text', nullable: true })
  summaryText!: string | null;

  @Column({ type: 'varchar', length: 20, default: 'draft' })
  status!: ReportStatus;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}
