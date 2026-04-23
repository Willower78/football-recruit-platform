import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { PlayerProfile } from './player-profile.entity';
import { ClubProfile } from './club-profile.entity';

export type UserRole = 'player' | 'club' | 'scout' | 'admin';
export type UserStatus = 'active' | 'pending_verification' | 'suspended';
export type SubscriptionPlan = 'free' | 'premium';

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column({ type: 'varchar', length: 320, unique: true })
  email!: string;

  @Column({ name: 'password_hash', type: 'varchar', length: 255 })
  passwordHash!: string;

  @Index()
  @Column({ type: 'varchar', length: 20 })
  role!: UserRole;

  @Column({ type: 'varchar', length: 30, default: 'active' })
  status!: UserStatus;

  @Column({ name: 'subscription_plan', type: 'varchar', length: 20, default: 'free' })
  subscriptionPlan!: SubscriptionPlan;

  @Column({ name: 'last_login_at', type: 'timestamptz', nullable: true })
  lastLoginAt!: Date | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;

  @OneToOne(() => PlayerProfile, (p) => p.user)
  playerProfile?: PlayerProfile;

  @OneToOne(() => ClubProfile, (c) => c.user)
  clubProfile?: ClubProfile;
}
