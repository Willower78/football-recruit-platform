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
import { RecommendationRequest } from './recommendation-request.entity';
import { User } from './user.entity';

export type VerificationStatus = 'unverified' | 'pending' | 'verified' | 'rejected';
export type RecommendationVisibility = 'public' | 'clubs_only' | 'private';

@Entity({ name: 'recommendations' })
export class Recommendation {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => RecommendationRequest, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'request_id' })
  request!: RecommendationRequest | null;

  @Column({ name: 'request_id', type: 'uuid', nullable: true })
  requestId!: string | null;

  @ManyToOne(() => PlayerProfile, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'player_id' })
  player!: PlayerProfile;

  @Column({ name: 'player_id', type: 'uuid' })
  playerId!: string;

  @Column({ name: 'coach_name', type: 'varchar', length: 160, nullable: true })
  coachName!: string | null;

  @Column({ name: 'coach_role', type: 'varchar', length: 80, nullable: true })
  coachRole!: string | null;

  @Column({ name: 'coach_email', type: 'varchar', length: 320, nullable: true })
  coachEmail!: string | null;

  @Column({ name: 'coach_organization', type: 'varchar', length: 200, nullable: true })
  coachOrganization!: string | null;

  @Column({ name: 'coach_club', type: 'varchar', length: 200, nullable: true })
  coachClub!: string | null;

  @Column({ name: 'relationship_duration', type: 'varchar', length: 60, nullable: true })
  relationshipDuration!: string | null;

  @Column({ name: 'overall_rating', type: 'int', nullable: true })
  overallRating!: number | null;

  @Column({ name: 'strengths_text', type: 'text', nullable: true })
  strengthsText!: string | null;

  @Column({ name: 'development_text', type: 'text', nullable: true })
  developmentText!: string | null;

  @Column({ name: 'domain_ratings', type: 'jsonb', default: () => "'{}'" })
  domainRatings!: Record<string, number>;

  @Column({ name: 'would_recommend', type: 'boolean', default: true })
  wouldRecommend!: boolean;

  @Column({ name: 'additional_notes', type: 'text', nullable: true })
  additionalNotes!: string | null;

  @Column({ type: 'boolean', default: false })
  verified!: boolean;

  @Column({ name: 'verification_status', type: 'varchar', length: 20, default: 'unverified' })
  verificationStatus!: VerificationStatus;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'verified_by' })
  verifiedBy!: User | null;

  @Column({ name: 'verified_at', type: 'timestamptz', nullable: true })
  verifiedAt!: Date | null;

  @Column({ type: 'varchar', length: 20, default: 'public' })
  visibility!: RecommendationVisibility;

  @Column({ name: 'deleted_at', type: 'timestamptz', nullable: true })
  deletedAt!: Date | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}
