import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export type UserRole = 'player' | 'club' | 'scout' | 'admin';
export type UserStatus = 'active' | 'pending_verification' | 'suspended';
export type SubscriptionPlan = 'free' | 'premium';

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'text', unique: true })
  email!: string;

  @Column({ type: 'text', name: 'password_hash' })
  passwordHash!: string;

  @Column({ type: 'text' })
  role!: UserRole;

  @Column({ type: 'text', default: 'active' })
  status!: UserStatus;

  @Column({ type: 'text', name: 'subscription_plan', default: 'free' })
  subscriptionPlan!: SubscriptionPlan;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}
