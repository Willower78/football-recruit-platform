import { VideoIntegration } from '../../entities/video-integration.entity';

export interface NormalizedMatch {
  platformMatchId: string;
  matchDate: string | null;
  matchTitle: string | null;
  homeTeam: string | null;
  awayTeam: string | null;
  durationSec: number | null;
  thumbnailUrl: string | null;
  videoUrl: string | null;
  tags: unknown[];
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string | null;
  expiresAt: Date | null;
}

export interface VideoProviderInterface {
  getAuthUrl(state: string): string;
  exchangeCode(code: string): Promise<TokenPair>;
  refreshToken(integration: VideoIntegration): Promise<TokenPair>;
  listMatches(integration: VideoIntegration): Promise<NormalizedMatch[]>;
  getDownloadUrl(integration: VideoIntegration, matchId: string): Promise<string>;
}
