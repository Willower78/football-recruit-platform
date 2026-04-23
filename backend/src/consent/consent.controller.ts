import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import {
  CurrentUser,
  JwtUser,
} from '../common/decorators/current-user.decorator';
import { Consent } from '../entities/consent.entity';
import { ConsentService } from './consent.service';
import { RecordConsentDto } from './dto/record-consent.dto';

@ApiTags('consents')
@Controller('consents')
export class ConsentController {
  constructor(private readonly service: ConsentService) {}

  @Post()
  @ApiBearerAuth()
  record(
    @CurrentUser() user: JwtUser,
    @Body() dto: RecordConsentDto,
  ): Promise<Consent> {
    return this.service.record(user.sub, dto);
  }

  @Get('me')
  @ApiBearerAuth()
  listMine(@CurrentUser() user: JwtUser): Promise<Consent[]> {
    return this.service.listForUser(user.sub);
  }
}
