import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Highlight } from '../entities/highlight.entity';
import { PlayerProfile } from '../entities/player-profile.entity';
import { ListHighlightsDto } from './dto/list-highlights.dto';

@Injectable()
export class HighlightsService {
  constructor(
    @InjectRepository(Highlight)
    private readonly repo: Repository<Highlight>,
    @InjectRepository(PlayerProfile)
    private readonly playerRepo: Repository<PlayerProfile>,
  ) {}

  async listForPlayer(playerId: string, dto: ListHighlightsDto) {
    const qb = this.repo.createQueryBuilder('h').where('h.player_id = :playerId', { playerId });

    if (dto.eventType) {
      qb.andWhere('h.event_type = :eventType', { eventType: dto.eventType });
    }
    if (dto.featured !== undefined) {
      qb.andWhere('h.featured = :featured', { featured: dto.featured });
    }

    const page = dto.page ?? 1;
    const limit = dto.limit ?? 20;
    qb.skip((page - 1) * limit).take(limit);
    qb.orderBy('h.created_at', 'DESC');

    const [items, total] = await qb.getManyAndCount();
    return { items, total, page, limit };
  }

  async getReel(playerId: string) {
    const highlights = await this.repo.find({
      where: { playerId, featured: true },
      order: { createdAt: 'DESC' },
    });
    return highlights;
  }

  async findOne(id: string): Promise<Highlight> {
    const highlight = await this.repo.findOne({ where: { id } });
    if (!highlight) throw new NotFoundException('Highlight not found');
    return highlight;
  }

  async toggleFeatured(userId: string, highlightId: string): Promise<Highlight> {
    const highlight = await this.repo.findOne({
      where: { id: highlightId },
      relations: ['player'],
    });
    if (!highlight) throw new NotFoundException('Highlight not found');
    if (highlight.player.userId !== userId) {
      throw new ForbiddenException('Not your highlight');
    }

    highlight.featured = !highlight.featured;
    return this.repo.save(highlight);
  }
}
