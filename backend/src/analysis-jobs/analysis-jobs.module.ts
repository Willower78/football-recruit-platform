import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AnalysisJob } from '../entities/analysis-job.entity';
import { User } from '../entities/user.entity';
import { AnalysisJobsController } from './analysis-jobs.controller';
import { AnalysisJobsService } from './analysis-jobs.service';

@Module({
  imports: [TypeOrmModule.forFeature([AnalysisJob, User])],
  controllers: [AnalysisJobsController],
  providers: [AnalysisJobsService],
  exports: [AnalysisJobsService],
})
export class AnalysisJobsModule {}
