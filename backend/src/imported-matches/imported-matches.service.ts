import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ImportedMatch } from '../entities/imported-match.entity';
import { VideoIntegrationsService } from '../video-integrations/video-integrations.service';
import { ListImportedMatchesDto } from './dto/list-imported-matches.dto';

@Injectable()
export class ImportedMatchesService {
  constructor(
    @InjectRepository(ImportedMatch)
    private readonly repo: Repository<ImportedMatch>,
    private readonly integrations: VideoIntegrationsService,
  ) {}

  async syncMatches(userId: string, integrationId: string): Promise<{ synced: number }> {
    const integration = await this.integrations.findOwned(userId, integrationId);
    const matches = await this.integrations.listVeoMatches(integration);

    let synced = 0;
    for (const m of matches) {
      const existing = await this.repo.findOne({
        where: { integrationId, platformMatchId: m.platformMatchId },
      });

      if (!existing) {
        await this.repo.save(
          this.repo.create({
            userId,
            integrationId,
            platform: integration.platform,
            platformMatchId: m.platformMatchId,
            matchDate: m.matchDate,
            matchTitle: m.matchTitle,
            homeTeam: m.homeTeam,
            awayTeam: m.awayTeam,
            durationSec: m.durationSec,
            platformThumbnailUrl: m.thumbnailUrl,
            platformVideoUrl: m.videoUrl,
            platformTags: m.tags,
          }),
        );
        synced++;
      }
    }

    return { synced };
  }

  async list(userId: string, dto: ListImportedMatchesDto) {
    const qb = this.repo.createQueryBuilder('m').where('m.user_id = :userId', { userId });

    if (dto.platform) {
      qb.andWhere('m.platform = :platform', { platform: dto.platform });
    }
    if (dto.importStatus) {
      qb.andWhere('m.import_status = :status', { status: dto.importStatus });
    }
    if (dto.dateFrom) {
      qb.andWhere('m.match_date >= :from', { from: dto.dateFrom });
    }
    if (dto.dateTo) {
      qb.andWhere('m.match_date <= :to', { to: dto.dateTo });
    }

    const page = dto.page ?? 1;
    const limit = dto.limit ?? 20;
    qb.skip((page - 1) * limit).take(limit);
    qb.orderBy('m.created_at', 'DESC');

    const [items, total] = await qb.getManyAndCount();
    return { items, total, page, limit };
  }

  async findOne(userId: string, id: string): Promise<ImportedMatch> {
    const match = await this.repo.findOne({ where: { id } });
    if (!match) throw new NotFoundException('Imported match not found');
    if (match.userId !== userId) throw new ForbiddenException('Not your match');
    return match;
  }

  async triggerDownload(userId: string, id: string): Promise<{ status: string }> {
    const match = await this.findOne(userId, id);

    if (match.importStatus === 'downloaded') {
      return { status: 'already_downloaded' };
    }

    match.importStatus = 'downloading';
    await this.repo.save(match);

    // In production this would enqueue a BullMQ job.
    // For now we just mark as downloading; the AI worker will handle actual download.
    return { status: 'downloading' };
  }
}
