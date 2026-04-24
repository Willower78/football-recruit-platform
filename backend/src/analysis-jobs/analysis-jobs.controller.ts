import { Body, Controller, Delete, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser, JwtUser } from '../auth/decorators/current-user.decorator';
import { AnalysisJobsService } from './analysis-jobs.service';
import { CreateAnalysisJobDto } from './dto/create-analysis-job.dto';
import { ListAnalysisJobsDto } from './dto/list-analysis-jobs.dto';

@ApiTags('analysis-jobs')
@Controller('analysis-jobs')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class AnalysisJobsController {
  constructor(private readonly service: AnalysisJobsService) {}

  @Post()
  @Roles('player')
  create(@CurrentUser() user: JwtUser, @Body() dto: CreateAnalysisJobDto) {
    return this.service.create(user.sub, dto);
  }

  @Get()
  @Roles('player')
  list(@CurrentUser() user: JwtUser, @Query() dto: ListAnalysisJobsDto) {
    return this.service.list(user.sub, dto);
  }

  @Get(':id')
  @Roles('player')
  findOne(@CurrentUser() user: JwtUser, @Param('id') id: string) {
    return this.service.findOne(user.sub, id);
  }

  @Get(':id/progress')
  @Roles('player')
  progress(@CurrentUser() user: JwtUser, @Param('id') id: string) {
    return this.service.getProgress(user.sub, id);
  }

  @Delete(':id')
  @Roles('player')
  cancel(@CurrentUser() user: JwtUser, @Param('id') id: string) {
    return this.service.cancel(user.sub, id);
  }
}
