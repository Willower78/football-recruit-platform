import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { PsychAssessmentService } from './psych-assessment.service';
import { StartAssessmentDto } from './dto/start-assessment.dto';
import { SubmitBatchResponsesDto } from './dto/submit-batch-responses.dto';
import { UpdateVisibilityDto } from './dto/update-visibility.dto';
import { CurrentUser, JwtUser } from '../auth/decorators/current-user.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { PremiumGuard } from '../auth/guards/premium.guard';

@ApiTags('assessments')
@ApiBearerAuth()
@Controller('assessments')
export class PsychAssessmentController {
  constructor(private readonly service: PsychAssessmentService) {}

  @Public()
  @Get('questions')
  getQuestions() {
    return this.service.getQuestions();
  }

  @UseGuards(PremiumGuard)
  @Post()
  start(@CurrentUser() user: JwtUser, @Body() dto: StartAssessmentDto) {
    return this.service.startAssessment(user.sub, dto.consent_id);
  }

  @Post(':id/responses')
  submitResponses(
    @Param('id') id: string,
    @CurrentUser() user: JwtUser,
    @Body() dto: SubmitBatchResponsesDto,
  ) {
    return this.service.submitResponses(id, user.sub, dto.responses);
  }

  @UseGuards(PremiumGuard)
  @Post(':id/submit')
  submit(@Param('id') id: string, @CurrentUser() user: JwtUser) {
    return this.service.submitAssessment(id, user.sub);
  }

  @Get('mine')
  listMine(@CurrentUser() user: JwtUser) {
    return this.service.listMine(user.sub);
  }

  @Get(':id')
  getOne(@Param('id') id: string, @CurrentUser() user: JwtUser) {
    return this.service.getAssessment(id, user.sub, user.role);
  }

  @Get(':id/results')
  getResults(@Param('id') id: string, @CurrentUser() user: JwtUser) {
    return this.service.getResults(id, user.sub, user.role);
  }

  @Patch(':id/visibility')
  updateVisibility(
    @Param('id') id: string,
    @CurrentUser() user: JwtUser,
    @Body() dto: UpdateVisibilityDto,
  ) {
    return this.service.updateVisibility(id, user.sub, dto.visibility);
  }
}
