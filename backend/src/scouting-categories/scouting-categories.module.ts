import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ScoutingCategory } from '../entities/scouting-category.entity';
import { ScoutingCategoriesController } from './scouting-categories.controller';
import { ScoutingCategoriesService } from './scouting-categories.service';

@Module({
  imports: [TypeOrmModule.forFeature([ScoutingCategory])],
  controllers: [ScoutingCategoriesController],
  providers: [ScoutingCategoriesService],
  exports: [ScoutingCategoriesService],
})
export class ScoutingCategoriesModule {}
