import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VerificationRequest } from '../entities/verification-request.entity';
import { VerificationBadge } from '../entities/verification-badge.entity';
import { ClubProfile } from '../entities/club-profile.entity';
import { VerificationService } from './verification.service';
import { VerificationController } from './verification.controller';
import { AuditModule } from '../audit/audit.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([VerificationRequest, VerificationBadge, ClubProfile]),
    AuditModule,
    NotificationsModule,
  ],
  controllers: [VerificationController],
  providers: [VerificationService],
  exports: [VerificationService],
})
export class VerificationModule {}
