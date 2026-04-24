import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { VideoIntegration } from '../entities/video-integration.entity';
import { VideoIntegrationsController } from './video-integrations.controller';
import { VideoIntegrationsService } from './video-integrations.service';
import { VeoService } from './providers/veo.service';

@Module({
  imports: [TypeOrmModule.forFeature([VideoIntegration])],
  controllers: [VideoIntegrationsController],
  providers: [VideoIntegrationsService, VeoService],
  exports: [VideoIntegrationsService],
})
export class VideoIntegrationsModule {}
