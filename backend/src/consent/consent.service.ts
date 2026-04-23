import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Consent } from '../entities/consent.entity';
import { RecordConsentDto } from './dto/record-consent.dto';

@Injectable()
export class ConsentService {
  constructor(
    @InjectRepository(Consent)
    private readonly repo: Repository<Consent>,
  ) {}

  record(userId: string, dto: RecordConsentDto): Promise<Consent> {
    const consent = this.repo.create({
      userId,
      consentType: dto.consent_type,
      granted: dto.granted,
      grantedAt: new Date(),
    });
    return this.repo.save(consent);
  }

  listForUser(userId: string): Promise<Consent[]> {
    return this.repo.find({
      where: { userId },
      order: { grantedAt: 'DESC' },
    });
  }
}
