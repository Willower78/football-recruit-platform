import { Body, Controller, Get, Param, Patch, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { ClubProfilesService } from './club-profiles.service';
import { UpdateClubProfileDto } from './dto/update-club-profile.dto';
import { SearchClubsDto } from './dto/search-clubs.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser, JwtUser } from '../auth/decorators/current-user.decorator';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('clubs')
@Controller('clubs')
export class ClubProfilesController {
  constructor(private readonly service: ClubProfilesService) {}

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('me')
  me(@CurrentUser() user: JwtUser) {
    return this.service.findForUser(user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Patch('me')
  updateMe(@CurrentUser() user: JwtUser, @Body() dto: UpdateClubProfileDto) {
    return this.service.updateForUser(user.sub, dto);
  }

  @Public()
  @Get()
  search(@Query() dto: SearchClubsDto) {
    return this.service.search(dto);
  }

  @Public()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findById(id);
  }
}
