import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'psych_questions' })
export class PsychQuestion {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 16, default: 'v1' })
  version!: string;

  @Column({ type: 'varchar', length: 60 })
  domain!: string;

  @Column({ name: 'question_text', type: 'text' })
  questionText!: string;

  @Column({ name: 'reverse_scored', type: 'boolean', default: false })
  reverseScored!: boolean;

  @Column({ type: 'boolean', default: true })
  active!: boolean;

  @Column({ name: 'sort_order', type: 'int', default: 0 })
  sortOrder!: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;
}
