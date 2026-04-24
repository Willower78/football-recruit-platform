import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ImportedMatch } from '../entities/imported-match.entity';
import { ImportedMatchesController } from './imported-matches.controller';
import { ImportedMatchesService } from './imported-matches.service';
import { VideoIntegrationsModule } from '../video-integrations/video-integrations.module';

@Module({
  imports: [TypeOrmModule.forFeature([ImportedMatch]), VideoIntegrationsModule],
  controllers: [ImportedMatchesController],
  providers: [ImportedMatchesService],
  exports: [ImportedMatchesService],
})
export class ImportedMatchesModule {}
