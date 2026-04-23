import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmConfigFactory } from './config/typeorm.config';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { PlayerProfilesModule } from './player-profiles/player-profiles.module';
import { ClubProfilesModule } from './club-profiles/club-profiles.module';
import { ConsentModule } from './consent/consent.module';
import { AuditModule } from './audit/audit.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: typeOrmConfigFactory,
    }),
    AuditModule,
    AuthModule,
    UsersModule,
    PlayerProfilesModule,
    ClubProfilesModule,
    ConsentModule,
    HealthModule,
  ],
})
export class AppModule {}
