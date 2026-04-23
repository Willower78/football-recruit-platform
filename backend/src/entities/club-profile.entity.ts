import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export type VerificationTier =
  | 'unverified'
  | 'pending'
  | 'verified'
  | 'official';

@Entity({ name: 'club_profiles' })
export class ClubProfile {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index({ unique: true })
  @Column({ type: 'uuid', name: 'user_id', nullable: true })
  userId!: string | null;

  @Column({ type: 'text', name: 'club_name' })
  clubName!: string;

  @Column({ type: 'text', nullable: true })
  country!: string | null;

  @Column({ type: 'text', nullable: true })
  city!: string | null;

  @Column({
    type: 'geography',
    spatialFeatureType: 'Point',
    srid: 4326,
    name: 'geo_point',
    nullable: true,
    select: false,
  })
  geoPoint!: unknown;

  @Column({ type: 'text', name: 'league_name', nullable: true })
  leagueName!: string | null;

  @Column({ type: 'text', name: 'competition_level', nullable: true })
  competitionLevel!: string | null;

  @Column({ type: 'jsonb', name: 'age_groups', default: () => `'[]'::jsonb` })
  ageGroups!: string[];

  @Column({ type: 'boolean', default: false })
  verified!: boolean;

  @Column({ type: 'text', name: 'verification_tier', default: 'unverified' })
  verificationTier!: VerificationTier;

  @Column({ type: 'timestamptz', name: 'verified_at', nullable: true })
  verifiedAt!: Date | null;

  @Column({ type: 'text', name: 'official_website_domain', nullable: true })
  officialWebsiteDomain!: string | null;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({ type: 'text', name: 'website_url', nullable: true })
  websiteUrl!: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}
