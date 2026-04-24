import { Body, Controller, Get, Param, Patch, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { PlayerProfilesService } from './player-profiles.service';
import { UpdatePlayerProfileDto } from './dto/update-player-profile.dto';
import { SearchPlayersDto } from './dto/search-players.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard';
import { CurrentUser, JwtUser } from '../auth/decorators/current-user.decorator';

@ApiTags('players')
@Controller('players')
export class PlayerProfilesController {
  constructor(private readonly service: PlayerProfilesService) {}

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('me')
  me(@CurrentUser() user: JwtUser) {
    return this.service.findForUser(user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Patch('me')
  updateMe(@CurrentUser() user: JwtUser, @Body() dto: UpdatePlayerProfileDto) {
    return this.service.updateForUser(user.sub, dto);
  }

  @UseGuards(OptionalJwtAuthGuard)
  @Get()
  search(@Query() dto: SearchPlayersDto) {
    return this.service.search(dto);
  }

  @UseGuards(OptionalJwtAuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user?: JwtUser) {
    return this.service.findById(id, user?.role);
  }
}
