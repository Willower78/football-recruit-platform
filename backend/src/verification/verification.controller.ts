import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CurrentUser, JwtUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { VerificationService } from './verification.service';
import { CreateVerificationRequestDto } from './dto/create-verification-request.dto';
import { ReviewVerificationRequestDto } from './dto/review-verification-request.dto';
import { ConfirmEmailDto } from './dto/confirm-email.dto';
import { GrantBadgeDto } from './dto/grant-badge.dto';
import { RevokeBadgeDto } from './dto/revoke-badge.dto';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('verification')
@Controller()
export class VerificationController {
  constructor(private readonly service: VerificationService) {}

  /* ───── Club / User-facing ───── */

  @Post('verification/request')
  @Roles('club')
  createRequest(@CurrentUser() user: JwtUser, @Body() dto: CreateVerificationRequestDto) {
    return this.service.createRequest(user.sub, dto);
  }

  @Post('verification/confirm-email')
  confirmEmail(@CurrentUser() user: JwtUser, @Body() dto: ConfirmEmailDto) {
    return this.service.confirmEmail(user.sub, dto.request_id, dto.code);
  }

  @Get('verification/status')
  getStatus(@CurrentUser() user: JwtUser) {
    return this.service.getStatus(user.sub);
  }

  @Get('verification/badges/:entityType/:entityId')
  @Public()
  getBadges(@Param('entityType') entityType: string, @Param('entityId') entityId: string) {
    return this.service.getBadges(entityType, entityId);
  }

  /* ───── Admin-facing ───── */

  @Get('admin/verification/queue')
  @Roles('admin')
  getQueue(
    @Query('entity_type') entityType?: string,
    @Query('verification_method') verificationMethod?: string,
    @Query('status') status?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.service.getQueue({
      entity_type: entityType,
      verification_method: verificationMethod,
      status,
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined,
    });
  }

  @Get('admin/verification/queue/:id')
  @Roles('admin')
  getQueueItem(@Param('id') id: string) {
    return this.service.getQueueItem(id);
  }

  @Patch('admin/verification/queue/:id/review')
  @Roles('admin')
  reviewRequest(
    @Param('id') id: string,
    @CurrentUser() user: JwtUser,
    @Body() dto: ReviewVerificationRequestDto,
  ) {
    return this.service.reviewRequest(id, user.sub, dto);
  }

  @Post('admin/verification/badges')
  @Roles('admin')
  grantBadge(@CurrentUser() user: JwtUser, @Body() dto: GrantBadgeDto) {
    return this.service.grantBadge(user.sub, dto);
  }

  @Delete('admin/verification/badges/:id')
  @Roles('admin')
  revokeBadge(@Param('id') id: string, @CurrentUser() user: JwtUser, @Body() dto: RevokeBadgeDto) {
    return this.service.revokeBadge(id, user.sub, dto.revoke_reason);
  }

  @Get('admin/verification/badges')
  @Roles('admin')
  listBadges(
    @Query('entity_type') entityType?: string,
    @Query('badge_type') badgeType?: string,
    @Query('revoked') revoked?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.service.listBadges({
      entity_type: entityType,
      badge_type: badgeType,
      revoked,
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined,
    });
  }
}
