import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ChatService } from './chat.service';
import { CurrentUser, JwtUser } from '../auth/decorators/current-user.decorator';

@ApiTags('chat')
@ApiBearerAuth()
@Controller('chat')
export class ChatController {
  constructor(private readonly service: ChatService) {}

  @Get('conversations')
  getConversations(@CurrentUser() user: JwtUser) {
    return this.service.getConversations(user.sub);
  }

  @Get('messages/:userId')
  getMessages(
    @CurrentUser() user: JwtUser,
    @Param('userId') otherUserId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.service.getConversation(
      user.sub,
      otherUserId,
      page ? Number(page) : 1,
      limit ? Number(limit) : 50,
    );
  }
}
