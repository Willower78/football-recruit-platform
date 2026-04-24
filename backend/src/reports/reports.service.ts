import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ContentReport } from '../entities/content-report.entity';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(ContentReport)
    private readonly repo: Repository<ContentReport>,
  ) {}

  async create(
    userId: string,
    dto: {
      reported_entity_type: string;
      reported_entity_id: string;
      reason: string;
      description?: string;
    },
  ): Promise<ContentReport> {
    const existing = await this.repo.findOne({
      where: {
        reporterUserId: userId,
        reportedEntityType: dto.reported_entity_type,
        reportedEntityId: dto.reported_entity_id,
      },
    });
    if (existing) {
      throw new ConflictException('You have already reported this content');
    }

    const report = this.repo.create({
      reporterUserId: userId,
      reportedEntityType: dto.reported_entity_type,
      reportedEntityId: dto.reported_entity_id,
      reason: dto.reason,
      description: dto.description ?? null,
    });
    return this.repo.save(report);
  }

  async listMine(userId: string) {
    return this.repo.find({
      where: { reporterUserId: userId },
      order: { createdAt: 'DESC' },
    });
  }
}
