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
import { Tryout } from './tryout.entity';
import { User } from './user.entity';

export type TryoutAppStatus = 'applied' | 'accepted' | 'rejected' | 'withdrawn';

@Entity({ name: 'tryout_applications' })
@Unique(['tryoutId', 'playerId'])
export class TryoutApplication {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Tryout, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tryout_id' })
  tryout!: Tryout;

  @Column({ name: 'tryout_id', type: 'uuid' })
  tryoutId!: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'player_id' })
  player!: User;

  @Column({ name: 'player_id', type: 'uuid' })
  playerId!: string;

  @Column({ type: 'text', nullable: true })
  message!: string | null;

  @Column({ type: 'varchar', length: 20, default: 'applied' })
  status!: TryoutAppStatus;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}
