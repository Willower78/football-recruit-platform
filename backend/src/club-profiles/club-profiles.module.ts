import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClubProfile } from '../entities/club-profile.entity';
import { ClubProfilesController } from './club-profiles.controller';
import { ClubProfilesService } from './club-profiles.service';

@Module({
  imports: [TypeOrmModule.forFeature([ClubProfile])],
  controllers: [ClubProfilesController],
  providers: [ClubProfilesService],
})
export class ClubProfilesModule {}
