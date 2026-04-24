import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_INTERCEPTOR } from '@nestjs/core';

import { User } from './entities/user.entity';
import { PlayerProfile } from './entities/player-profile.entity';
import { ClubProfile } from './entities/club-profile.entity';
import { Consent } from './entities/consent.entity';
import { AuditLog } from './entities/audit-log.entity';
import { VideoIntegration } from './entities/video-integration.entity';
import { ImportedMatch } from './entities/imported-match.entity';
import { AnalysisJob } from './entities/analysis-job.entity';
import { Highlight } from './entities/highlight.entity';
import { ScoutingReport } from './entities/scouting-report.entity';

import { AuthModule } from './auth/auth.module';
import { PlayerProfilesModule } from './player-profiles/player-profiles.module';
import { ClubProfilesModule } from './club-profiles/club-profiles.module';
import { AuditModule } from './audit/audit.module';
import { ConsentModule } from './consent/consent.module';
import { VideoIntegrationsModule } from './video-integrations/video-integrations.module';
import { ImportedMatchesModule } from './imported-matches/imported-matches.module';
import { AnalysisJobsModule } from './analysis-jobs/analysis-jobs.module';
import { HighlightsModule } from './highlights/highlights.module';
import { HealthController } from './health/health.controller';
import { AuditInterceptor } from './audit/audit.interceptor';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      entities: [
        User,
        PlayerProfile,
        ClubProfile,
        Consent,
        AuditLog,
        VideoIntegration,
        ImportedMatch,
        AnalysisJob,
        Highlight,
        ScoutingReport,
      ],
      // Migrations are managed via SQL files in /database/migrations. Never
      // let TypeORM auto-sync against the live schema.
      synchronize: false,
      autoLoadEntities: true,
    }),
    AuthModule,
    PlayerProfilesModule,
    ClubProfilesModule,
    AuditModule,
    ConsentModule,
    VideoIntegrationsModule,
    ImportedMatchesModule,
    AnalysisJobsModule,
    HighlightsModule,
  ],
  controllers: [HealthController],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: AuditInterceptor,
    },
  ],
})
export class AppModule {}
