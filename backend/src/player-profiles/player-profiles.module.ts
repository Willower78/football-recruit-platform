import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { PlayerProfile } from '../entities/player-profile.entity';
import { PlayerProfilesController } from './player-profiles.controller';
import { PlayerProfilesService } from './player-profiles.service';
import { PlayerSearchService } from './player-search.service';

@Module({
  imports: [TypeOrmModule.forFeature([PlayerProfile])],
  controllers: [PlayerProfilesController],
  providers: [PlayerProfilesService, PlayerSearchService],
  exports: [PlayerProfilesService],
})
export class PlayerProfilesModule {}
