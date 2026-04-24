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

export type RequestStatus = 'pending' | 'sent' | 'completed' | 'expired';

@Entity({ name: 'recommendation_requests' })
export class RecommendationRequest {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => PlayerProfile, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'player_id' })
  player!: PlayerProfile;

  @Column({ name: 'player_id', type: 'uuid' })
  playerId!: string;

  @Column({ name: 'coach_email', type: 'varchar', length: 320 })
  coachEmail!: string;

  @Column({ name: 'coach_name', type: 'varchar', length: 160, nullable: true })
  coachName!: string | null;

  @Column({ type: 'varchar', length: 20, default: 'pending' })
  status!: RequestStatus;

  @Column({ type: 'varchar', length: 120, unique: true })
  token!: string;

  @Column({ name: 'expires_at', type: 'timestamptz' })
  expiresAt!: Date;

  @Column({ name: 'sent_at', type: 'timestamptz', nullable: true })
  sentAt!: Date | null;

  @Column({ name: 'reminded_at', type: 'timestamptz', nullable: true })
  remindedAt!: Date | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}
