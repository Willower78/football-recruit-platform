import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_INTERCEPTOR } from '@nestjs/core';

import { User } from './entities/user.entity';
import { PlayerProfile } from './entities/player-profile.entity';
import { ClubProfile } from './entities/club-profile.entity';
import { Consent } from './entities/consent.entity';
import { AuditLog } from './entities/audit-log.entity';
import { ScoutingCategory } from './entities/scouting-category.entity';
import { ScoutingRating } from './entities/scouting-rating.entity';
import { PlayerAggregateRating } from './entities/player-aggregate-rating.entity';
import { SavedSearch } from './entities/saved-search.entity';

import { AuthModule } from './auth/auth.module';
import { PlayerProfilesModule } from './player-profiles/player-profiles.module';
import { ClubProfilesModule } from './club-profiles/club-profiles.module';
import { AuditModule } from './audit/audit.module';
import { ConsentModule } from './consent/consent.module';
import { ScoutingCategoriesModule } from './scouting-categories/scouting-categories.module';
import { ScoutingRatingsModule } from './scouting-ratings/scouting-ratings.module';
import { SavedSearchesModule } from './saved-searches/saved-searches.module';
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
        ScoutingCategory,
        ScoutingRating,
        PlayerAggregateRating,
        SavedSearch,
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
    ScoutingCategoriesModule,
    ScoutingRatingsModule,
    SavedSearchesModule,
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
