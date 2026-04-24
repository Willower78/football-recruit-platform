import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { ConsentService } from './consent.service';
import { CreateConsentDto } from './dto/create-consent.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser, JwtUser } from '../auth/decorators/current-user.decorator';

@ApiTags('consents')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@Controller('consents')
export class ConsentController {
  constructor(private readonly service: ConsentService) {}

  @Post()
  create(@CurrentUser() user: JwtUser, @Body() dto: CreateConsentDto) {
    return this.service.record(user.sub, dto);
  }

  @Get('me')
  listMine(@CurrentUser() user: JwtUser) {
    return this.service.listForUser(user.sub);
  }
}
