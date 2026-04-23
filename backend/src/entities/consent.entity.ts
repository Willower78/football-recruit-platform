import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

export type ConsentType =
  | 'terms'
  | 'privacy'
  | 'scouting_ai'
  | 'marketing'
  | 'guardian_approval';

@Entity({ name: 'consents' })
export class Consent {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', name: 'user_id' })
  userId!: string;

  @Column({ type: 'text', name: 'consent_type' })
  consentType!: ConsentType;

  @Column({ type: 'boolean' })
  granted!: boolean;

  @Column({ type: 'timestamptz', name: 'granted_at', nullable: true })
  grantedAt!: Date | null;

  @Column({ type: 'timestamptz', name: 'expires_at', nullable: true })
  expiresAt!: Date | null;
}
