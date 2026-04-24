import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser, JwtUser } from '../auth/decorators/current-user.decorator';
import { SavedSearchesService } from './saved-searches.service';
import { CreateSavedSearchDto, UpdateSavedSearchDto } from './dto/saved-search.dto';

@ApiTags('saved-searches')
@Controller('saved-searches')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class SavedSearchesController {
  constructor(private readonly service: SavedSearchesService) {}

  @Roles('club', 'scout', 'admin')
  @Post()
  create(@CurrentUser() user: JwtUser, @Body() dto: CreateSavedSearchDto) {
    return this.service.create(user.sub, dto);
  }

  @Get()
  findAll(@CurrentUser() user: JwtUser) {
    return this.service.findAllForUser(user.sub);
  }

  @Patch(':id')
  update(@Param('id') id: string, @CurrentUser() user: JwtUser, @Body() dto: UpdateSavedSearchDto) {
    return this.service.update(id, user.sub, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: JwtUser) {
    return this.service.remove(id, user.sub);
  }
}
