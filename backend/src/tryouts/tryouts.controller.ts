import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { TryoutsService } from './tryouts.service';
import { CreateTryoutDto } from './dto/create-tryout.dto';
import { ApplyTryoutDto } from './dto/apply-tryout.dto';
import { UpdateApplicationStatusDto } from './dto/update-application-status.dto';
import { Public } from '../auth/decorators/public.decorator';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard';
import { CurrentUser, JwtUser } from '../auth/decorators/current-user.decorator';

@ApiTags('tryouts')
@Controller('tryouts')
export class TryoutsController {
  constructor(private readonly service: TryoutsService) {}

  @ApiBearerAuth()
  @Post()
  create(@CurrentUser() user: JwtUser, @Body() dto: CreateTryoutDto) {
    return this.service.create(user.sub, dto);
  }

  @Public()
  @UseGuards(OptionalJwtAuthGuard)
  @Get()
  findAll(
    @Query('sport') sport?: string,
    @Query('position') position?: string,
    @Query('city') city?: string,
    @Query('country') country?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.service.findAll({
      sport,
      position,
      city,
      country,
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 20,
    });
  }

  @ApiBearerAuth()
  @Get('me/created')
  getMyTryouts(@CurrentUser() user: JwtUser) {
    return this.service.getMyTryouts(user.sub);
  }

  @ApiBearerAuth()
  @Get('me/applications')
  getMyApplications(@CurrentUser() user: JwtUser) {
    return this.service.getMyApplications(user.sub);
  }

  @ApiBearerAuth()
  @Patch('applications/:appId/status')
  updateApplicationStatus(
    @Param('appId') appId: string,
    @CurrentUser() user: JwtUser,
    @Body() dto: UpdateApplicationStatusDto,
  ) {
    return this.service.updateApplicationStatus(appId, user.sub, dto.status);
  }

  @Public()
  @UseGuards(OptionalJwtAuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @ApiBearerAuth()
  @Post(':id/apply')
  apply(
    @Param('id') id: string,
    @CurrentUser() user: JwtUser,
    @Body() dto: ApplyTryoutDto,
  ) {
    return this.service.apply(id, user.sub, dto);
  }

  @ApiBearerAuth()
  @Delete(':id/apply')
  withdraw(@Param('id') id: string, @CurrentUser() user: JwtUser) {
    return this.service.withdrawApplication(id, user.sub);
  }

  @ApiBearerAuth()
  @Get(':id/applications')
  getApplications(@Param('id') id: string, @CurrentUser() user: JwtUser) {
    return this.service.getApplicationsForTryout(id, user.sub);
  }

  @ApiBearerAuth()
  @Patch(':id/close')
  closeTryout(@Param('id') id: string, @CurrentUser() user: JwtUser) {
    return this.service.closeTryout(id, user.sub);
  }
}
