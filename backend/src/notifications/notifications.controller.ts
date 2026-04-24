import { Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CurrentUser, JwtUser } from '../auth/decorators/current-user.decorator';
import { NotificationsService } from './notifications.service';

@ApiTags('notifications')
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly service: NotificationsService) {}

  @Get()
  list(
    @CurrentUser() user: JwtUser,
    @Query('read') read?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.service.list(user.sub, {
      read,
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined,
    });
  }

  @Patch(':id/read')
  markRead(@Param('id') id: string, @CurrentUser() user: JwtUser) {
    return this.service.markRead(id, user.sub);
  }

  @Post('read-all')
  markAllRead(@CurrentUser() user: JwtUser) {
    return this.service.markAllRead(user.sub);
  }

  @Get('unread-count')
  async unreadCount(@CurrentUser() user: JwtUser) {
    const count = await this.service.unreadCount(user.sub);
    return { count };
  }
}
