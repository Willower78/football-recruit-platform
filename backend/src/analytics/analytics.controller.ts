import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from '../auth/decorators/roles.decorator';
import { AnalyticsService } from './analytics.service';

@ApiTags('analytics')
@ApiBearerAuth()
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly service: AnalyticsService) {}

  @Roles('admin')
  @Get('overview')
  getOverview() {
    return this.service.getOverview();
  }

  @Roles('admin')
  @Get('registrations')
  getRegistrationTrend(@Query('days') days?: string) {
    return this.service.getRegistrationTrend(days ? Number(days) : 30);
  }

  @Roles('admin')
  @Get('users/recent')
  getRecentUsers(@Query('limit') limit?: string) {
    return this.service.getRecentUsers(limit ? Number(limit) : 10);
  }

  @Roles('admin')
  @Get('positions')
  getPositionBreakdown() {
    return this.service.getPositionBreakdown();
  }

  @Roles('admin')
  @Get('countries')
  getCountryBreakdown() {
    return this.service.getCountryBreakdown();
  }
}
