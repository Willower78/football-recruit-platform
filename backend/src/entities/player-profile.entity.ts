import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';

export type DominantFoot = 'left' | 'right' | 'both';
export type AvailabilityStatus = 'available' | 'open_to_offers' | 'not_available';
export type VisibilityLevel = 'public' | 'clubs_only' | 'private';

@Entity({ name: 'player_profiles' })
export class PlayerProfile {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @OneToOne(() => User, (user) => user.playerProfile, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Column({ name: 'user_id', type: 'uuid', unique: true })
  userId!: string;

  @Column({ name: 'full_name', type: 'varchar', length: 160, nullable: true })
  fullName!: string | null;

  @Column({ name: 'date_of_birth', type: 'date', nullable: true })
  dateOfBirth!: string | null;

  @Column({ type: 'varchar', length: 80, nullable: true })
  nationality!: string | null;

  @Column({ type: 'varchar', length: 120, nullable: true })
  city!: string | null;

  @Column({ type: 'varchar', length: 80, nullable: true })
  country!: string | null;

  // Stored as PostGIS geography(Point, 4326). TypeORM treats it as a raw string
  // on the TS side; helpers convert lat/lng pairs on read/write.
  @Column({ name: 'geo_point', type: 'geography', spatialFeatureType: 'Point', srid: 4326, nullable: true })
  geoPoint!: unknown | null;

  @Index()
  @Column({ name: 'dominant_foot', type: 'varchar', length: 10, nullable: true })
  dominantFoot!: DominantFoot | null;

  @Index()
  @Column({ name: 'primary_position', type: 'varchar', length: 30, nullable: true })
  primaryPosition!: string | null;

  @Column({ name: 'secondary_positions', type: 'jsonb', default: () => "'[]'::jsonb" })
  secondaryPositions!: string[];

  @Column({ name: 'height_cm', type: 'int', nullable: true })
  heightCm!: number | null;

  @Column({ name: 'weight_kg', type: 'int', nullable: true })
  weightKg!: number | null;

  @Column({ name: 'current_club', type: 'varchar', length: 160, nullable: true })
  currentClub!: string | null;

  @Column({ name: 'free_agent', type: 'boolean', default: true })
  freeAgent!: boolean;

  @Column({ name: 'availability_status', type: 'varchar', length: 30, default: 'available' })
  availabilityStatus!: AvailabilityStatus;

  @Column({ type: 'text', nullable: true })
  bio!: string | null;

  @Column({ name: 'visibility_level', type: 'varchar', length: 20, default: 'public' })
  visibilityLevel!: VisibilityLevel;

  @Column({ name: 'guardian_required', type: 'boolean', default: false })
  guardianRequired!: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}
