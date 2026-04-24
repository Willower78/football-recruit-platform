import { Body, Controller, Delete, Get, Header, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CurrentUser, JwtUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { AdminService } from './admin.service';
import { UpdateUserStatusDto } from './dto/update-user-status.dto';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';
import { DeleteUserDto } from './dto/delete-user.dto';
import { UpdateReportDto } from './dto/update-report.dto';

@ApiTags('admin')
@Controller('admin')
@Roles('admin')
export class AdminController {
  constructor(private readonly service: AdminService) {}

  /* ───── User Management ───── */

  @Get('users')
  listUsers(
    @Query('role') role?: string,
    @Query('status') status?: string,
    @Query('subscription_plan') subscriptionPlan?: string,
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.service.listUsers({
      role,
      status,
      subscription_plan: subscriptionPlan,
      search,
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined,
    });
  }

  @Get('users/:id')
  getUser(@Param('id') id: string) {
    return this.service.getUser(id);
  }

  @Patch('users/:id/status')
  updateUserStatus(
    @Param('id') id: string,
    @CurrentUser() user: JwtUser,
    @Body() dto: UpdateUserStatusDto,
  ) {
    return this.service.updateUserStatus(id, user.sub, dto);
  }

  @Patch('users/:id/role')
  updateUserRole(
    @Param('id') id: string,
    @CurrentUser() user: JwtUser,
    @Body() dto: UpdateUserRoleDto,
  ) {
    return this.service.updateUserRole(id, user.sub, dto);
  }

  @Delete('users/:id')
  deleteUser(@Param('id') id: string, @CurrentUser() user: JwtUser, @Body() dto: DeleteUserDto) {
    return this.service.deleteUser(id, user.sub, dto);
  }

  /* ───── Content Reports ───── */

  @Get('reports')
  listReports(
    @Query('status') status?: string,
    @Query('reason') reason?: string,
    @Query('entity_type') entityType?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.service.listReports({
      status,
      reason,
      entity_type: entityType,
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined,
    });
  }

  @Get('reports/:id')
  getReport(@Param('id') id: string) {
    return this.service.getReport(id);
  }

  @Patch('reports/:id')
  updateReport(
    @Param('id') id: string,
    @CurrentUser() user: JwtUser,
    @Body() dto: UpdateReportDto,
  ) {
    return this.service.updateReport(id, user.sub, dto);
  }

  /* ───── Audit Logs ───── */

  @Get('audit-logs')
  listAuditLogs(
    @Query('user_id') userId?: string,
    @Query('action_type') actionType?: string,
    @Query('entity_type') entityType?: string,
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.service.listAuditLogs({
      user_id: userId,
      action_type: actionType,
      entity_type: entityType,
      search,
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined,
    });
  }

  @Get('audit-logs/export')
  @Header('Content-Type', 'text/csv')
  @Header('Content-Disposition', 'attachment; filename="audit-logs.csv"')
  exportAuditLogs(@Query('from') from?: string, @Query('to') to?: string) {
    return this.service.exportAuditLogs({ from, to });
  }

  /* ───── Consents / Privacy ───── */

  @Get('consents')
  listConsents(
    @Query('user_id') userId?: string,
    @Query('consent_type') consentType?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.service.listConsents({
      user_id: userId,
      consent_type: consentType,
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined,
    });
  }

  @Get('users/:id/consents')
  getUserConsents(@Param('id') id: string) {
    return this.service.getUserConsents(id);
  }

  @Post('users/:id/data-export')
  triggerDataExport(@Param('id') id: string, @CurrentUser() user: JwtUser) {
    return this.service.triggerDataExport(id, user.sub);
  }

  @Post('users/:id/data-deletion')
  triggerDataDeletion(@Param('id') id: string, @CurrentUser() user: JwtUser) {
    return this.service.triggerDataDeletion(id, user.sub);
  }

  /* ───── Analytics ───── */

  @Get('analytics/overview')
  getAnalyticsOverview() {
    return this.service.getAnalyticsOverview();
  }

  @Get('analytics/signups')
  getSignupAnalytics(@Query('days') days?: string) {
    return this.service.getSignupAnalytics(days ? parseInt(days) : 30);
  }

  @Get('analytics/conversions')
  getConversionAnalytics(@Query('days') days?: string) {
    return this.service.getConversionAnalytics(days ? parseInt(days) : 30);
  }
}
