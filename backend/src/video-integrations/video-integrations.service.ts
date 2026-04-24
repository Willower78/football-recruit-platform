import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { randomUUID } from 'crypto';

import { VideoIntegration } from '../entities/video-integration.entity';
import { VeoService } from './providers/veo.service';
import type { NormalizedMatch } from './providers/video-provider.interface';

const STATE_TTL_MS = 10 * 60 * 1000; // 10 minutes

@Injectable()
export class VideoIntegrationsService {
  private stateMap = new Map<string, { userId: string; createdAt: number }>();

  constructor(
    @InjectRepository(VideoIntegration)
    private readonly repo: Repository<VideoIntegration>,
    private readonly veo: VeoService,
  ) {}

  getVeoAuthUrl(userId: string): string {
    const state = randomUUID();
    this.stateMap.set(state, { userId, createdAt: Date.now() });
    this.pruneExpiredStates();
    return this.veo.getAuthUrl(state);
  }

  async handleVeoCallback(userId: string, code: string, state: string): Promise<VideoIntegration> {
    const entry = this.stateMap.get(state);
    if (!entry || entry.userId !== userId) {
      throw new ForbiddenException('Invalid or expired OAuth state');
    }
    this.stateMap.delete(state);

    if (Date.now() - entry.createdAt > STATE_TTL_MS) {
      throw new ForbiddenException('OAuth state expired');
    }

    const tokens = await this.veo.exchangeCode(code);

    const existing = await this.repo.findOne({
      where: { userId, platform: 'veo' },
    });

    if (existing) {
      existing.accessToken = tokens.accessToken;
      existing.refreshToken = tokens.refreshToken;
      existing.tokenExpiresAt = tokens.expiresAt;
      existing.status = 'active';
      return this.repo.save(existing);
    }

    return this.repo.save(
      this.repo.create({
        userId,
        platform: 'veo',
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        tokenExpiresAt: tokens.expiresAt,
        status: 'active',
      }),
    );
  }

  async listForUser(userId: string): Promise<
    Array<{
      id: string;
      platform: string;
      status: string;
      createdAt: Date;
    }>
  > {
    const integrations = await this.repo.find({ where: { userId } });
    return integrations.map((i) => ({
      id: i.id,
      platform: i.platform,
      status: i.status,
      createdAt: i.createdAt,
    }));
  }

  async disconnect(userId: string, integrationId: string): Promise<{ success: boolean }> {
    const integration = await this.findOwned(userId, integrationId);
    integration.status = 'revoked';
    await this.repo.save(integration);
    return { success: true };
  }

  async refreshIntegrationToken(
    userId: string,
    integrationId: string,
  ): Promise<{ success: boolean }> {
    const integration = await this.findOwned(userId, integrationId);
    const tokens = await this.veo.refreshToken(integration);
    integration.accessToken = tokens.accessToken;
    integration.refreshToken = tokens.refreshToken ?? integration.refreshToken;
    integration.tokenExpiresAt = tokens.expiresAt;
    integration.status = 'active';
    await this.repo.save(integration);
    return { success: true };
  }

  async findOwned(userId: string, integrationId: string): Promise<VideoIntegration> {
    const integration = await this.repo.findOne({
      where: { id: integrationId },
    });
    if (!integration) throw new NotFoundException('Integration not found');
    if (integration.userId !== userId) throw new ForbiddenException('Not your integration');
    return integration;
  }

  async listVeoMatches(integration: VideoIntegration): Promise<NormalizedMatch[]> {
    return this.veo.listMatches(integration);
  }

  async getVeoDownloadUrl(integration: VideoIntegration, matchId: string): Promise<string> {
    return this.veo.getDownloadUrl(integration, matchId);
  }

  private pruneExpiredStates(): void {
    const now = Date.now();
    for (const [key, entry] of this.stateMap) {
      if (now - entry.createdAt > STATE_TTL_MS) {
        this.stateMap.delete(key);
      }
    }
  }
}
