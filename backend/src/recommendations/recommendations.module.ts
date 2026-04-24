import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RecommendationRequest } from '../entities/recommendation-request.entity';
import { Recommendation } from '../entities/recommendation.entity';
import { CoachRating } from '../entities/coach-rating.entity';
import { PlayerProfile } from '../entities/player-profile.entity';
import { User } from '../entities/user.entity';
import { RecommendationsController } from './recommendations.controller';
import { RecommendationsService } from './recommendations.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      RecommendationRequest,
      Recommendation,
      CoachRating,
      PlayerProfile,
      User,
    ]),
  ],
  controllers: [RecommendationsController],
  providers: [RecommendationsService],
  exports: [RecommendationsService],
})
export class RecommendationsModule {}
