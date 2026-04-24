import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { ScoutingCategory } from './scouting-category.entity';

@Entity({ name: 'scouting_ratings' })
@Unique(['reportId', 'categoryId', 'source'])
export class ScoutingRating {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'report_id', type: 'uuid' })
  reportId!: string;

  @Column({ name: 'category_id', type: 'uuid' })
  categoryId!: string;

  @ManyToOne(() => ScoutingCategory, { eager: true })
  @JoinColumn({ name: 'category_id' })
  category!: ScoutingCategory;

  @Column({ type: 'int' })
  score!: number;

  @Column({ type: 'text' })
  source!: 'ai' | 'scout' | 'hybrid';

  @Column({ type: 'numeric', precision: 3, scale: 2, nullable: true })
  confidence!: number | null;

  @Column({ type: 'text', nullable: true })
  notes!: string | null;

  @Column({ name: 'rated_by', type: 'uuid', nullable: true })
  ratedBy!: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;
}
