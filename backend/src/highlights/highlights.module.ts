import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Highlight } from '../entities/highlight.entity';
import { PlayerProfile } from '../entities/player-profile.entity';
import { HighlightsController } from './highlights.controller';
import { HighlightsService } from './highlights.service';

@Module({
  imports: [TypeOrmModule.forFeature([Highlight, PlayerProfile])],
  controllers: [HighlightsController],
  providers: [HighlightsService],
  exports: [HighlightsService],
})
export class HighlightsModule {}
