import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { PsychAssessment } from './psych-assessment.entity';
import { PsychQuestion } from './psych-question.entity';

@Entity({ name: 'psych_responses' })
export class PsychResponse {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => PsychAssessment, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'assessment_id' })
  assessment!: PsychAssessment;

  @Column({ name: 'assessment_id', type: 'uuid' })
  assessmentId!: string;

  @ManyToOne(() => PsychQuestion, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'question_id' })
  question!: PsychQuestion;

  @Column({ name: 'question_id', type: 'uuid' })
  questionId!: string;

  @Column({ name: 'score_int', type: 'int' })
  scoreInt!: number;

  @Column({ name: 'answered_at', type: 'timestamptz', default: () => 'NOW()' })
  answeredAt!: Date;
}
