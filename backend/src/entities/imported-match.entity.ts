import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { User } from './user.entity';
import { VideoIntegration } from './video-integration.entity';

export type ImportStatus = 'listed' | 'downloading' | 'downloaded' | 'failed';

@Entity({ name: 'imported_matches' })
@Unique(['integrationId', 'platformMatchId'])
export class ImportedMatch {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Column({ name: 'user_id', type: 'uuid' })
  userId!: string;

  @ManyToOne(() => VideoIntegration, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'integration_id' })
  integration!: VideoIntegration;

  @Column({ name: 'integration_id', type: 'uuid' })
  integrationId!: string;

  @Column({ type: 'text' })
  platform!: string;

  @Column({ name: 'platform_match_id', type: 'text' })
  platformMatchId!: string;

  @Column({ name: 'match_date', type: 'date', nullable: true })
  matchDate!: string | null;

  @Column({ name: 'match_title', type: 'text', nullable: true })
  matchTitle!: string | null;

  @Column({ name: 'home_team', type: 'text', nullable: true })
  homeTeam!: string | null;

  @Column({ name: 'away_team', type: 'text', nullable: true })
  awayTeam!: string | null;

  @Column({ name: 'duration_sec', type: 'int', nullable: true })
  durationSec!: number | null;

  @Column({ name: 'platform_thumbnail_url', type: 'text', nullable: true })
  platformThumbnailUrl!: string | null;

  @Column({ name: 'platform_video_url', type: 'text', nullable: true })
  platformVideoUrl!: string | null;

  @Column({ name: 'platform_tags', type: 'jsonb', default: () => "'[]'" })
  platformTags!: unknown[];

  @Column({ name: 'import_status', type: 'text', default: 'listed' })
  importStatus!: ImportStatus;

  @Column({ name: 'local_storage_url', type: 'text', nullable: true })
  localStorageUrl!: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;
}
