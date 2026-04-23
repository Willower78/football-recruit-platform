import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Consent } from '../entities/consent.entity';
import { CreateConsentDto } from './dto/create-consent.dto';

@Injectable()
export class ConsentService {
  constructor(
    @InjectRepository(Consent)
    private readonly repo: Repository<Consent>,
  ) {}

  async record(userId: string, dto: CreateConsentDto): Promise<Consent> {
    return this.repo.save(
      this.repo.create({
        userId,
        consentType: dto.consentType,
        granted: dto.granted,
        grantedAt: dto.granted ? new Date() : null,
        expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : null,
      }),
    );
  }

  listForUser(userId: string): Promise<Consent[]> {
    return this.repo.find({ where: { userId }, order: { createdAt: 'DESC' } });
  }
}
