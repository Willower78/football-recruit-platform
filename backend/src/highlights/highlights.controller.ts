import { Controller, Get, Param, Patch, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser, JwtUser } from '../auth/decorators/current-user.decorator';
import { HighlightsService } from './highlights.service';
import { ListHighlightsDto } from './dto/list-highlights.dto';

@ApiTags('highlights')
@Controller('highlights')
export class HighlightsController {
  constructor(private readonly service: HighlightsService) {}

  @UseGuards(OptionalJwtAuthGuard)
  @Get('player/:playerId')
  listForPlayer(@Param('playerId') playerId: string, @Query() dto: ListHighlightsDto) {
    return this.service.listForPlayer(playerId, dto);
  }

  @UseGuards(OptionalJwtAuthGuard)
  @Get('player/:playerId/reel')
  reel(@Param('playerId') playerId: string) {
    return this.service.getReel(playerId);
  }

  @UseGuards(OptionalJwtAuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles('player')
  @Patch(':id/feature')
  toggleFeatured(@CurrentUser() user: JwtUser, @Param('id') id: string) {
    return this.service.toggleFeatured(user.sub, id);
  }
}
