import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TryoutsController } from './tryouts.controller';
import { TryoutsService } from './tryouts.service';
import { Tryout } from '../entities/tryout.entity';
import { TryoutApplication } from '../entities/tryout-application.entity';
import { ClubProfile } from '../entities/club-profile.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Tryout, TryoutApplication, ClubProfile])],
  controllers: [TryoutsController],
  providers: [TryoutsService],
})
export class TryoutsModule {}
