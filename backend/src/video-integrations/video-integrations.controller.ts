import { Controller, Delete, Get, Param, Post, Query, Res, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser, JwtUser } from '../auth/decorators/current-user.decorator';
import { VideoIntegrationsService } from './video-integrations.service';

@ApiTags('video-integrations')
@Controller('video-integrations')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class VideoIntegrationsController {
  constructor(private readonly service: VideoIntegrationsService) {}

  @Get('veo/connect')
  @Roles('player')
  veoConnect(@CurrentUser() user: JwtUser, @Res() res: Response) {
    const url = this.service.getVeoAuthUrl(user.sub);
    res.redirect(url);
  }

  @Get('veo/callback')
  @Roles('player')
  async veoCallback(
    @CurrentUser() user: JwtUser,
    @Query('code') code: string,
    @Query('state') state: string,
    @Res() res: Response,
  ) {
    await this.service.handleVeoCallback(user.sub, code, state);
    res.redirect('/dashboard/player?integration=veo&status=success');
  }

  @Get()
  @Roles('player')
  list(@CurrentUser() user: JwtUser) {
    return this.service.listForUser(user.sub);
  }

  @Delete(':id')
  @Roles('player')
  disconnect(@CurrentUser() user: JwtUser, @Param('id') id: string) {
    return this.service.disconnect(user.sub, id);
  }

  @Post(':id/refresh')
  @Roles('player')
  refreshToken(@CurrentUser() user: JwtUser, @Param('id') id: string) {
    return this.service.refreshIntegrationToken(user.sub, id);
  }
}
