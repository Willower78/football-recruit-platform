import { Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser, JwtUser } from '../auth/decorators/current-user.decorator';
import { ImportedMatchesService } from './imported-matches.service';
import { ListImportedMatchesDto } from './dto/list-imported-matches.dto';

@ApiTags('imported-matches')
@Controller('imported-matches')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ImportedMatchesController {
  constructor(private readonly service: ImportedMatchesService) {}

  @Post('sync/:integrationId')
  @Roles('player')
  sync(@CurrentUser() user: JwtUser, @Param('integrationId') integrationId: string) {
    return this.service.syncMatches(user.sub, integrationId);
  }

  @Get()
  @Roles('player')
  list(@CurrentUser() user: JwtUser, @Query() dto: ListImportedMatchesDto) {
    return this.service.list(user.sub, dto);
  }

  @Get(':id')
  @Roles('player')
  findOne(@CurrentUser() user: JwtUser, @Param('id') id: string) {
    return this.service.findOne(user.sub, id);
  }

  @Post(':id/download')
  @Roles('player')
  download(@CurrentUser() user: JwtUser, @Param('id') id: string) {
    return this.service.triggerDownload(user.sub, id);
  }
}
