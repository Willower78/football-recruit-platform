import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ScoutingRating } from '../entities/scouting-rating.entity';
import { ScoutingCategory } from '../entities/scouting-category.entity';
import { PlayerAggregateRating } from '../entities/player-aggregate-rating.entity';
import { ScoutingRatingsController } from './scouting-ratings.controller';
import { ScoutingRatingsService } from './scouting-ratings.service';

@Module({
  imports: [TypeOrmModule.forFeature([ScoutingRating, ScoutingCategory, PlayerAggregateRating])],
  controllers: [ScoutingRatingsController],
  providers: [ScoutingRatingsService],
  exports: [ScoutingRatingsService],
})
export class ScoutingRatingsModule {}
