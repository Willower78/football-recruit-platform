import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

export type ScoutingDomain = 'technical' | 'tactical' | 'physical' | 'mental' | 'intangibles';

@Entity({ name: 'scouting_categories' })
export class ScoutingCategory {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'text' })
  domain!: ScoutingDomain;

  @Column({ type: 'text' })
  name!: string;

  @Column({ type: 'text', unique: true })
  slug!: string;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({ name: 'ai_detectable', type: 'boolean', default: false })
  aiDetectable!: boolean;

  @Column({ name: 'sort_order', type: 'int' })
  sortOrder!: number;

  @Column({ type: 'boolean', default: true })
  active!: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;
}
