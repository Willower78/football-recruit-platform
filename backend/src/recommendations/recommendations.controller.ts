import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RecommendationsService } from './recommendations.service';
import { CreateRecommendationRequestDto } from './dto/create-recommendation-request.dto';
import { SubmitRecommendationDto } from './dto/submit-recommendation.dto';
import { UpdateRecommendationVisibilityDto } from './dto/update-recommendation-visibility.dto';
import { CurrentUser, JwtUser } from '../auth/decorators/current-user.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard';

@ApiTags('recommendations')
@Controller()
export class RecommendationsController {
  constructor(private readonly service: RecommendationsService) {}

  // --- Player endpoints ---

  @ApiBearerAuth()
  @Post('recommendations/request')
  createRequest(@CurrentUser() user: JwtUser, @Body() dto: CreateRecommendationRequestDto) {
    return this.service.createRequest(user.sub, dto);
  }

  @ApiBearerAuth()
  @Get('recommendations/requests/mine')
  listMyRequests(@CurrentUser() user: JwtUser) {
    return this.service.listMyRequests(user.sub);
  }

  @ApiBearerAuth()
  @Delete('recommendations/requests/:id')
  cancelRequest(@Param('id') id: string, @CurrentUser() user: JwtUser) {
    return this.service.cancelRequest(id, user.sub);
  }

  @ApiBearerAuth()
  @Post('recommendations/requests/:id/remind')
  sendReminder(@Param('id') id: string, @CurrentUser() user: JwtUser) {
    return this.service.sendReminder(id, user.sub);
  }

  // --- Public coach endpoints ---

  @Public()
  @Get('recommendations/submit/:token')
  getSubmitForm(@Param('token') token: string) {
    return this.service.getSubmitForm(token);
  }

  @Public()
  @Post('recommendations/submit/:token')
  submitRecommendation(@Param('token') token: string, @Body() dto: SubmitRecommendationDto) {
    return this.service.submitRecommendation(token, dto);
  }

  // --- Player profile recommendations ---

  @Public()
  @UseGuards(OptionalJwtAuthGuard)
  @Get('players/:playerId/recommendations')
  listForPlayer(@Param('playerId') playerId: string, @CurrentUser() user: JwtUser | undefined) {
    return this.service.listForPlayer(playerId, user?.sub ?? null, user?.role ?? null);
  }

  @Public()
  @UseGuards(OptionalJwtAuthGuard)
  @Get('players/:playerId/coach-ratings')
  getCoachRatings(@Param('playerId') playerId: string) {
    return this.service.getCoachRatingsForPlayer(playerId);
  }

  // --- Player controls ---

  @ApiBearerAuth()
  @Patch('recommendations/:id/visibility')
  updateVisibility(
    @Param('id') id: string,
    @CurrentUser() user: JwtUser,
    @Body() dto: UpdateRecommendationVisibilityDto,
  ) {
    return this.service.updateVisibility(id, user.sub, dto.visibility);
  }

  @ApiBearerAuth()
  @Delete('recommendations/:id')
  deleteRecommendation(@Param('id') id: string, @CurrentUser() user: JwtUser) {
    return this.service.deleteRecommendation(id, user.sub);
  }

  // --- Admin endpoints ---

  @ApiBearerAuth()
  @Roles('admin')
  @UseGuards(RolesGuard)
  @Get('admin/recommendations/unverified')
  listUnverified() {
    return this.service.listUnverified();
  }

  @ApiBearerAuth()
  @Roles('admin')
  @UseGuards(RolesGuard)
  @Patch('admin/recommendations/:id/verify')
  verify(@Param('id') id: string, @CurrentUser() user: JwtUser) {
    return this.service.verifyRecommendation(id, user.sub);
  }
}
