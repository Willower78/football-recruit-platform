import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PsychAssessment } from '../entities/psych-assessment.entity';
import { PsychQuestion } from '../entities/psych-question.entity';
import { PsychResponse } from '../entities/psych-response.entity';
import { PsychScore } from '../entities/psych-score.entity';
import { Consent } from '../entities/consent.entity';
import { User } from '../entities/user.entity';
import { PsychAssessmentController } from './psych-assessment.controller';
import { PsychAssessmentService } from './psych-assessment.service';
import { ScoringService } from './scoring.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PsychAssessment,
      PsychQuestion,
      PsychResponse,
      PsychScore,
      Consent,
      User,
    ]),
  ],
  controllers: [PsychAssessmentController],
  providers: [PsychAssessmentService, ScoringService],
  exports: [PsychAssessmentService, ScoringService],
})
export class PsychAssessmentModule {}
