import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';

export type VideoPlatform = 'veo' | 'hudl' | 'trace' | 'pixellot';
export type IntegrationStatus = 'active' | 'expired' | 'revoked';

@Entity({ name: 'video_integrations' })
@Unique(['userId', 'platform'])
export class VideoIntegration {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Column({ name: 'user_id', type: 'uuid' })
  userId!: string;

  @Column({ type: 'text' })
  platform!: VideoPlatform;

  @Column({ name: 'platform_user_id', type: 'text', nullable: true })
  platformUserId!: string | null;

  @Column({ name: 'access_token', type: 'text' })
  accessToken!: string;

  @Column({ name: 'refresh_token', type: 'text', nullable: true })
  refreshToken!: string | null;

  @Column({ name: 'token_expires_at', type: 'timestamptz', nullable: true })
  tokenExpiresAt!: Date | null;

  @Column({ type: 'text', default: 'active' })
  status!: IntegrationStatus;

  @Column({ type: 'jsonb', default: () => "'{}'" })
  metadata!: Record<string, unknown>;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}
