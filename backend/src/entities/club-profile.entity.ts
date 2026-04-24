import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';

export type VerificationTier = 'unverified' | 'pending' | 'verified' | 'official';

@Entity({ name: 'club_profiles' })
export class ClubProfile {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @OneToOne(() => User, (user) => user.clubProfile, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Column({ name: 'user_id', type: 'uuid', unique: true })
  userId!: string;

  @Column({ name: 'club_name', type: 'varchar', length: 200, nullable: true })
  clubName!: string | null;

  @Column({ type: 'varchar', length: 80, nullable: true })
  country!: string | null;

  @Column({ type: 'varchar', length: 120, nullable: true })
  city!: string | null;

  @Column({
    name: 'geo_point',
    type: 'geography',
    spatialFeatureType: 'Point',
    srid: 4326,
    nullable: true,
  })
  geoPoint!: unknown | null;

  @Column({ name: 'league_name', type: 'varchar', length: 160, nullable: true })
  leagueName!: string | null;

  @Column({ name: 'competition_level', type: 'varchar', length: 60, nullable: true })
  competitionLevel!: string | null;

  @Column({ name: 'age_groups', type: 'jsonb', default: () => "'[]'::jsonb" })
  ageGroups!: string[];

  @Column({ type: 'boolean', default: false })
  verified!: boolean;

  @Column({ name: 'verification_tier', type: 'varchar', length: 20, default: 'unverified' })
  verificationTier!: VerificationTier;

  @Column({ name: 'verified_at', type: 'timestamptz', nullable: true })
  verifiedAt!: Date | null;

  @Column({ name: 'official_website_domain', type: 'varchar', length: 200, nullable: true })
  officialWebsiteDomain!: string | null;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({ name: 'website_url', type: 'varchar', length: 300, nullable: true })
  websiteUrl!: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}
