import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { PlayerProfile } from './player-profile.entity';

@Entity({ name: 'highlights' })
export class Highlight {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'scouting_report_id', type: 'uuid' })
  scoutingReportId!: string;

  @ManyToOne(() => PlayerProfile, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'player_id' })
  player!: PlayerProfile;

  @Column({ name: 'player_id', type: 'uuid' })
  playerId!: string;

  @Column({ type: 'text' })
  title!: string;

  @Column({ name: 'event_type', type: 'text' })
  eventType!: string;

  @Column({ name: 'start_time_sec', type: 'numeric' })
  startTimeSec!: number;

  @Column({ name: 'end_time_sec', type: 'numeric' })
  endTimeSec!: number;

  @Column({ name: 'duration_sec', type: 'numeric' })
  durationSec!: number;

  @Column({ name: 'clip_storage_url', type: 'text', nullable: true })
  clipStorageUrl!: string | null;

  @Column({ name: 'thumbnail_url', type: 'text', nullable: true })
  thumbnailUrl!: string | null;

  @Column({ type: 'numeric', nullable: true })
  confidence!: number | null;

  @Column({ type: 'jsonb', default: () => "'[]'" })
  tags!: string[];

  @Column({ type: 'boolean', default: false })
  featured!: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;
}
