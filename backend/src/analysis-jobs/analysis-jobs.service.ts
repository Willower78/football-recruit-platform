import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, In, Repository } from 'typeorm';

import { AnalysisJob } from '../entities/analysis-job.entity';
import { User } from '../entities/user.entity';
import { CreateAnalysisJobDto } from './dto/create-analysis-job.dto';
import { ListAnalysisJobsDto } from './dto/list-analysis-jobs.dto';

@Injectable()
export class AnalysisJobsService {
  constructor(
    @InjectRepository(AnalysisJob)
    private readonly repo: Repository<AnalysisJob>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async create(userId: string, dto: CreateAnalysisJobDto): Promise<AnalysisJob> {
    if (!dto.videoId && !dto.importedMatchId) {
      throw new BadRequestException('Provide either videoId or importedMatchId');
    }

    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    if (user.subscriptionPlan === 'free') {
      const activeCount = await this.repo.count({
        where: {
          userId,
          status: Not(In(['completed', 'failed'])),
        },
      });
      if (activeCount > 0) {
        throw new ForbiddenException(
          'Free plan allows only 1 active analysis at a time. Upgrade to Premium for unlimited.',
        );
      }
    }

    const job = this.repo.create({
      userId,
      videoId: dto.videoId ?? null,
      importedMatchId: dto.importedMatchId ?? null,
      status: 'queued',
      progressPct: 0,
    });

    return this.repo.save(job);
  }

  async list(userId: string, dto: ListAnalysisJobsDto) {
    const page = dto.page ?? 1;
    const limit = dto.limit ?? 20;

    const [items, total] = await this.repo.findAndCount({
      where: { userId },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { items, total, page, limit };
  }

  async findOne(userId: string, id: string): Promise<AnalysisJob> {
    const job = await this.repo.findOne({ where: { id } });
    if (!job) throw new NotFoundException('Analysis job not found');
    if (job.userId !== userId) throw new ForbiddenException('Not your analysis job');
    return job;
  }

  async getProgress(
    userId: string,
    id: string,
  ): Promise<{ status: string; progressPct: number; currentStage: string | null }> {
    const job = await this.findOne(userId, id);
    return {
      status: job.status,
      progressPct: job.progressPct,
      currentStage: job.currentStage,
    };
  }

  async cancel(userId: string, id: string): Promise<{ success: boolean }> {
    const job = await this.findOne(userId, id);

    if (job.status === 'completed' || job.status === 'failed') {
      throw new BadRequestException('Cannot cancel a finished job');
    }

    job.status = 'failed';
    job.errorMessage = 'Cancelled by user';
    job.completedAt = new Date();
    await this.repo.save(job);

    return { success: true };
  }
}
