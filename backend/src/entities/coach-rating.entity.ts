import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { PlayerProfile } from './player-profile.entity';

@Entity({ name: 'coach_ratings' })
export class CoachRating {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => PlayerProfile, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'player_id' })
  player!: PlayerProfile;

  @Column({ name: 'player_id', type: 'uuid' })
  playerId!: string;

  @Column({ name: 'coach_name', type: 'varchar', length: 160, nullable: true })
  coachName!: string | null;

  @Column({ name: 'coach_role', type: 'varchar', length: 80, nullable: true })
  coachRole!: string | null;

  @Column({ type: 'varchar', length: 60 })
  domain!: string;

  @Column({ name: 'score_int', type: 'int' })
  scoreInt!: number;

  @Column({ type: 'text', nullable: true })
  notes!: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;
}
