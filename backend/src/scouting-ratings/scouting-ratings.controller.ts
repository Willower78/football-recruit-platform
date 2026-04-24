import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser, JwtUser } from '../auth/decorators/current-user.decorator';
import { ScoutingRatingsService } from './scouting-ratings.service';
import { BulkCreateScoutingRatingsDto } from './dto/create-scouting-rating.dto';

@ApiTags('scouting-ratings')
@Controller()
export class ScoutingRatingsController {
  constructor(private readonly service: ScoutingRatingsService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('scout', 'admin', 'club')
  @ApiBearerAuth()
  @Post('scouting-reports/:reportId/ratings')
  createRatings(
    @Param('reportId') reportId: string,
    @CurrentUser() user: JwtUser,
    @Body() dto: BulkCreateScoutingRatingsDto,
  ) {
    return this.service.createBulk(reportId, dto, user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('scouting-reports/:reportId/ratings')
  getReportRatings(@Param('reportId') reportId: string) {
    return this.service.findByReport(reportId);
  }

  @UseGuards(OptionalJwtAuthGuard)
  @Get('players/:playerId/ratings')
  getPlayerAggregateRatings(@Param('playerId') playerId: string) {
    return this.service.findAggregateByPlayer(playerId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('scout', 'admin', 'club')
  @ApiBearerAuth()
  @Get('players/:playerId/ratings/history')
  getPlayerRatingHistory(@Param('playerId') playerId: string) {
    return this.service.findRatingHistoryByPlayer(playerId);
  }
}
