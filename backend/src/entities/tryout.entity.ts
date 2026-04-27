import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ClubProfile } from './club-profile.entity';

export type TryoutStatus = 'draft' | 'open' | 'closed' | 'cancelled';

@Entity({ name: 'tryouts' })
export class Tryout {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => ClubProfile, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'club_id' })
  club!: ClubProfile;

  @Column({ name: 'club_id', type: 'uuid' })
  clubId!: string;

  @Column({ type: 'varchar', length: 300 })
  title!: string;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({ type: 'varchar', length: 60, default: 'football' })
  sport!: string;

  @Column({ type: 'varchar', length: 30, nullable: true })
  position!: string | null;

  @Column({ name: 'age_group', type: 'varchar', length: 40, nullable: true })
  ageGroup!: string | null;

  @Column({ type: 'varchar', length: 300, nullable: true })
  location!: string | null;

  @Column({ type: 'varchar', length: 120, nullable: true })
  city!: string | null;

  @Column({ type: 'varchar', length: 80, nullable: true })
  country!: string | null;

  @Column({ name: 'tryout_date', type: 'timestamptz', nullable: true })
  tryoutDate!: Date | null;

  @Column({ name: 'end_date', type: 'timestamptz', nullable: true })
  endDate!: Date | null;

  @Column({ name: 'max_participants', type: 'int', nullable: true })
  maxParticipants!: number | null;

  @Column({ type: 'text', nullable: true })
  requirements!: string | null;

  @Column({ type: 'varchar', length: 20, default: 'open' })
  status!: TryoutStatus;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}
