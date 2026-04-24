import { Column, Entity, PrimaryGeneratedColumn, Unique } from 'typeorm';

@Entity({ name: 'player_aggregate_ratings' })
@Unique(['playerId', 'categorySlug'])
export class PlayerAggregateRating {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'player_id', type: 'uuid' })
  playerId!: string;

  @Column({ name: 'category_slug', type: 'text' })
  categorySlug!: string;

  @Column({ name: 'avg_score', type: 'numeric', precision: 4, scale: 2, nullable: true })
  avgScore!: number | null;

  @Column({ name: 'max_score', type: 'numeric', precision: 4, scale: 2, nullable: true })
  maxScore!: number | null;

  @Column({ name: 'latest_score', type: 'numeric', precision: 4, scale: 2, nullable: true })
  latestScore!: number | null;

  @Column({ name: 'report_count', type: 'int', default: 0 })
  reportCount!: number;

  @Column({ name: 'last_updated', type: 'timestamptz' })
  lastUpdated!: Date;
}
