import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';

import { ScoutingRating } from '../entities/scouting-rating.entity';
import { ScoutingCategory } from '../entities/scouting-category.entity';
import { PlayerAggregateRating } from '../entities/player-aggregate-rating.entity';
import { BulkCreateScoutingRatingsDto } from './dto/create-scouting-rating.dto';

@Injectable()
export class ScoutingRatingsService {
  constructor(
    @InjectRepository(ScoutingRating)
    private readonly ratingRepo: Repository<ScoutingRating>,
    @InjectRepository(ScoutingCategory)
    private readonly categoryRepo: Repository<ScoutingCategory>,
    @InjectRepository(PlayerAggregateRating)
    private readonly aggregateRepo: Repository<PlayerAggregateRating>,
    private readonly dataSource: DataSource,
  ) {}

  async createBulk(
    reportId: string,
    dto: BulkCreateScoutingRatingsDto,
    userId: string,
  ): Promise<ScoutingRating[]> {
    // Look up the report to get the player_id
    const report = await this.dataSource.query(
      'SELECT id, player_id FROM scouting_reports WHERE id = $1',
      [reportId],
    );
    if (!report.length) throw new NotFoundException('Scouting report not found');
    const playerId: string = report[0].player_id;

    const allCategories = await this.categoryRepo.find({ where: { active: true } });
    const catBySlug = new Map(allCategories.map((c) => [c.slug, c]));
    const catById = new Map(allCategories.map((c) => [c.id, c]));

    const saved: ScoutingRating[] = [];
    for (const item of dto.ratings) {
      let category: ScoutingCategory | undefined;
      if (item.categoryId) {
        category = catById.get(item.categoryId);
      } else if (item.categorySlug) {
        category = catBySlug.get(item.categorySlug);
      }
      if (!category) {
        throw new BadRequestException(`Unknown category: ${item.categoryId ?? item.categorySlug}`);
      }

      const rating = this.ratingRepo.create({
        reportId,
        categoryId: category.id,
        score: item.score,
        source: 'scout',
        confidence: item.confidence ?? null,
        notes: item.notes ?? null,
        ratedBy: userId,
      });
      saved.push(await this.ratingRepo.save(rating));
    }

    // Recalculate aggregates for affected categories
    const slugs = new Set(
      saved
        .map((r) => {
          const cat = catById.get(r.categoryId);
          return cat?.slug;
        })
        .filter(Boolean) as string[],
    );

    for (const slug of slugs) {
      await this.recalculateAggregate(playerId, slug);
    }

    return saved;
  }

  async findByReport(reportId: string): Promise<Record<string, ScoutingRating[]>> {
    const ratings = await this.ratingRepo.find({
      where: { reportId },
      relations: ['category'],
      order: { category: { sortOrder: 'ASC' } },
    });

    const grouped: Record<string, ScoutingRating[]> = {};
    for (const r of ratings) {
      const domain = r.category.domain;
      if (!grouped[domain]) grouped[domain] = [];
      grouped[domain].push(r);
    }
    return grouped;
  }

  async findAggregateByPlayer(playerId: string): Promise<PlayerAggregateRating[]> {
    return this.aggregateRepo.find({
      where: { playerId },
      order: { categorySlug: 'ASC' },
    });
  }

  async findRatingHistoryByPlayer(playerId: string): Promise<ScoutingRating[]> {
    return this.ratingRepo
      .createQueryBuilder('sr')
      .innerJoin('scouting_reports', 'rep', 'rep.id = sr.report_id')
      .where('rep.player_id = :playerId', { playerId })
      .leftJoinAndSelect('sr.category', 'cat')
      .orderBy('sr.created_at', 'DESC')
      .getMany();
  }

  private async recalculateAggregate(playerId: string, categorySlug: string): Promise<void> {
    await this.dataSource.query(
      `INSERT INTO player_aggregate_ratings (player_id, category_slug, avg_score, max_score, latest_score, report_count, last_updated)
       SELECT
         sr.player_id,
         sc.slug,
         AVG(sra.score),
         MAX(sra.score),
         (
           SELECT sra2.score
           FROM scouting_ratings sra2
           JOIN scouting_reports sr2 ON sr2.id = sra2.report_id
           JOIN scouting_categories sc2 ON sc2.id = sra2.category_id
           WHERE sr2.player_id = $1 AND sc2.slug = $2
           ORDER BY sra2.created_at DESC
           LIMIT 1
         ),
         COUNT(*),
         NOW()
       FROM scouting_reports sr
       JOIN scouting_ratings sra ON sra.report_id = sr.id
       JOIN scouting_categories sc ON sc.id = sra.category_id
       WHERE sr.player_id = $1 AND sc.slug = $2
       GROUP BY sr.player_id, sc.slug
       ON CONFLICT (player_id, category_slug) DO UPDATE SET
         avg_score = EXCLUDED.avg_score,
         max_score = EXCLUDED.max_score,
         latest_score = EXCLUDED.latest_score,
         report_count = EXCLUDED.report_count,
         last_updated = NOW()`,
      [playerId, categorySlug],
    );
  }
}
