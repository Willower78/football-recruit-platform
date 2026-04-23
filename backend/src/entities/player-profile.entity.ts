import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export type DominantFoot = 'left' | 'right' | 'both';
export type VisibilityLevel = 'public' | 'clubs_only' | 'private';

@Entity({ name: 'player_profiles' })
export class PlayerProfile {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index({ unique: true })
  @Column({ type: 'uuid', name: 'user_id', nullable: true })
  userId!: string | null;

  @Column({ type: 'text', name: 'full_name', nullable: true })
  fullName!: string | null;

  @Column({ type: 'date', name: 'date_of_birth', nullable: true })
  dateOfBirth!: string | null;

  @Column({ type: 'text', nullable: true })
  nationality!: string | null;

  @Column({ type: 'text', nullable: true })
  city!: string | null;

  @Column({ type: 'text', nullable: true })
  country!: string | null;

  // PostGIS geography(Point,4326). We leave it as text/unknown on the TypeORM
  // side and write raw SQL expressions for updates.
  @Column({
    type: 'geography',
    spatialFeatureType: 'Point',
    srid: 4326,
    name: 'geo_point',
    nullable: true,
    select: false,
  })
  geoPoint!: unknown;

  @Column({ type: 'text', name: 'dominant_foot', nullable: true })
  dominantFoot!: DominantFoot | null;

  @Column({ type: 'text', name: 'primary_position', nullable: true })
  primaryPosition!: string | null;

  @Column({ type: 'jsonb', name: 'secondary_positions', default: () => `'[]'::jsonb` })
  secondaryPositions!: string[];

  @Column({ type: 'integer', name: 'height_cm', nullable: true })
  heightCm!: number | null;

  @Column({ type: 'integer', name: 'weight_kg', nullable: true })
  weightKg!: number | null;

  @Column({ type: 'text', name: 'current_club', nullable: true })
  currentClub!: string | null;

  @Column({ type: 'boolean', name: 'free_agent', default: true })
  freeAgent!: boolean;

  @Column({ type: 'text', name: 'availability_status', default: 'available' })
  availabilityStatus!: string;

  @Column({ type: 'text', nullable: true })
  bio!: string | null;

  @Column({ type: 'text', name: 'visibility_level', default: 'public' })
  visibilityLevel!: VisibilityLevel;

  @Column({ type: 'boolean', name: 'guardian_required', default: false })
  guardianRequired!: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}
