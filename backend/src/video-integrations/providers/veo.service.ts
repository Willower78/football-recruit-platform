import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type {
  VideoProviderInterface,
  TokenPair,
  NormalizedMatch,
} from './video-provider.interface';
import { VideoIntegration } from '../../entities/video-integration.entity';

@Injectable()
export class VeoService implements VideoProviderInterface {
  private readonly logger = new Logger(VeoService.name);
  private readonly clientId: string;
  private readonly clientSecret: string;
  private readonly redirectUri: string;
  private readonly apiBase: string;

  constructor(private readonly config: ConfigService) {
    this.clientId = this.config.get<string>('VEO_CLIENT_ID', '');
    this.clientSecret = this.config.get<string>('VEO_CLIENT_SECRET', '');
    this.redirectUri = this.config.get<string>(
      'VEO_REDIRECT_URI',
      'http://localhost:3000/integrations/veo/callback',
    );
    this.apiBase = this.config.get<string>('VEO_API_BASE_URL', 'https://api.veo.co/v1');
  }

  getAuthUrl(state: string): string {
    const params = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      response_type: 'code',
      scope: 'matches:read matches:download user:read',
      state,
    });
    return `${this.apiBase}/oauth/authorize?${params.toString()}`;
  }

  async exchangeCode(code: string): Promise<TokenPair> {
    const res = await fetch(`${this.apiBase}/oauth/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        grant_type: 'authorization_code',
        client_id: this.clientId,
        client_secret: this.clientSecret,
        redirect_uri: this.redirectUri,
        code,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      this.logger.error(`VEO token exchange failed: ${err}`);
      throw new Error('Failed to exchange VEO authorization code');
    }

    const data = (await res.json()) as {
      access_token: string;
      refresh_token?: string;
      expires_in?: number;
    };

    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token ?? null,
      expiresAt: data.expires_in ? new Date(Date.now() + data.expires_in * 1000) : null,
    };
  }

  async refreshToken(integration: VideoIntegration): Promise<TokenPair> {
    if (!integration.refreshToken) {
      throw new Error('No refresh token available for this integration');
    }

    const res = await fetch(`${this.apiBase}/oauth/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        grant_type: 'refresh_token',
        client_id: this.clientId,
        client_secret: this.clientSecret,
        refresh_token: integration.refreshToken,
      }),
    });

    if (!res.ok) {
      this.logger.error('VEO token refresh failed');
      throw new Error('Failed to refresh VEO token');
    }

    const data = (await res.json()) as {
      access_token: string;
      refresh_token?: string;
      expires_in?: number;
    };

    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token ?? integration.refreshToken,
      expiresAt: data.expires_in ? new Date(Date.now() + data.expires_in * 1000) : null,
    };
  }

  private async authedFetch(integration: VideoIntegration, path: string): Promise<Response> {
    return fetch(`${this.apiBase}${path}`, {
      headers: { Authorization: `Bearer ${integration.accessToken}` },
    });
  }

  async listMatches(integration: VideoIntegration): Promise<NormalizedMatch[]> {
    const res = await this.authedFetch(integration, '/matches');
    if (!res.ok) {
      this.logger.error(`VEO listMatches failed: ${res.status}`);
      throw new Error('Failed to fetch matches from VEO');
    }

    const data = (await res.json()) as {
      matches: Array<{
        id: string;
        date?: string;
        title?: string;
        home_team?: string;
        away_team?: string;
        duration?: number;
        thumbnail_url?: string;
        video_url?: string;
        tags?: unknown[];
      }>;
    };

    return (data.matches ?? []).map((m) => ({
      platformMatchId: m.id,
      matchDate: m.date ?? null,
      matchTitle: m.title ?? null,
      homeTeam: m.home_team ?? null,
      awayTeam: m.away_team ?? null,
      durationSec: m.duration ?? null,
      thumbnailUrl: m.thumbnail_url ?? null,
      videoUrl: m.video_url ?? null,
      tags: m.tags ?? [],
    }));
  }

  async getDownloadUrl(integration: VideoIntegration, matchId: string): Promise<string> {
    const res = await this.authedFetch(integration, `/matches/${matchId}/download`);
    if (!res.ok) {
      throw new Error('Failed to get download URL from VEO');
    }
    const data = (await res.json()) as { download_url: string };
    return data.download_url;
  }
}
