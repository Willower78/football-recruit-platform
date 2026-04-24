import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { PsychAssessment } from './psych-assessment.entity';

@Entity({ name: 'psych_scores' })
export class PsychScore {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => PsychAssessment, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'assessment_id' })
  assessment!: PsychAssessment;

  @Column({ name: 'assessment_id', type: 'uuid' })
  assessmentId!: string;

  @Column({ type: 'varchar', length: 60 })
  domain!: string;

  @Column({ name: 'raw_score', type: 'numeric', precision: 10, scale: 4, nullable: true })
  rawScore!: number | null;

  @Column({ name: 'normalized_score', type: 'numeric', precision: 10, scale: 4, nullable: true })
  normalizedScore!: number | null;

  @Column({ name: 'percentile_band', type: 'varchar', length: 20, nullable: true })
  percentileBand!: string | null;

  @Column({ name: 'interpretation_text', type: 'text', nullable: true })
  interpretationText!: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;
}
