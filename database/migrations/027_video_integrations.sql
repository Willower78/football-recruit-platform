-- 027 — video_integrations: stores connected video platform accounts
CREATE TABLE IF NOT EXISTS video_integrations (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id           UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    platform          TEXT NOT NULL CHECK (platform IN ('veo', 'hudl', 'trace', 'pixellot')),
    platform_user_id  TEXT,
    access_token      TEXT NOT NULL,
    refresh_token     TEXT,
    token_expires_at  TIMESTAMPTZ,
    status            TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'revoked')),
    metadata          JSONB DEFAULT '{}',
    created_at        TIMESTAMPTZ DEFAULT NOW(),
    updated_at        TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, platform)
);

CREATE INDEX IF NOT EXISTS idx_video_integrations_user ON video_integrations(user_id);
