import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { PlayerProfile } from '../entities/player-profile.entity';
import { ClubProfile } from '../entities/club-profile.entity';
import { AuditLog } from '../entities/audit-log.entity';
import { Consent } from '../entities/consent.entity';
import { ContentReport } from '../entities/content-report.entity';
import { VerificationRequest } from '../entities/verification-request.entity';
import { VerificationBadge } from '../entities/verification-badge.entity';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { AuditModule } from '../audit/audit.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      PlayerProfile,
      ClubProfile,
      AuditLog,
      Consent,
      ContentReport,
      VerificationRequest,
      VerificationBadge,
    ]),
    AuditModule,
    NotificationsModule,
  ],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
