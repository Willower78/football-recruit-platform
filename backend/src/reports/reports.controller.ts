import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CurrentUser, JwtUser } from '../auth/decorators/current-user.decorator';
import { ReportsService } from './reports.service';
import { CreateReportDto } from './dto/create-report.dto';

@ApiTags('reports')
@Controller('reports')
export class ReportsController {
  constructor(private readonly service: ReportsService) {}

  @Post()
  create(@CurrentUser() user: JwtUser, @Body() dto: CreateReportDto) {
    return this.service.create(user.sub, dto);
  }

  @Get('mine')
  listMine(@CurrentUser() user: JwtUser) {
    return this.service.listMine(user.sub);
  }
}
