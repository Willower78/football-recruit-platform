import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlayerProfile } from '../entities/player-profile.entity';
import { PlayerProfilesController } from './player-profiles.controller';
import { PlayerProfilesService } from './player-profiles.service';

@Module({
  imports: [TypeOrmModule.forFeature([PlayerProfile])],
  controllers: [PlayerProfilesController],
  providers: [PlayerProfilesService],
})
export class PlayerProfilesModule {}
