-- 028 — imported_matches: matches pulled from external video platforms
CREATE TABLE IF NOT EXISTS imported_matches (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id                 UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    integration_id          UUID NOT NULL REFERENCES video_integrations(id) ON DELETE CASCADE,
    platform                TEXT NOT NULL,
    platform_match_id       TEXT NOT NULL,
    match_date              DATE,
    match_title             TEXT,
    home_team               TEXT,
    away_team               TEXT,
    duration_sec            INTEGER,
    platform_thumbnail_url  TEXT,
    platform_video_url      TEXT,
    platform_tags           JSONB DEFAULT '[]',
    import_status           TEXT NOT NULL DEFAULT 'listed' CHECK (import_status IN ('listed', 'downloading', 'downloaded', 'failed')),
    local_storage_url       TEXT,
    created_at              TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(integration_id, platform_match_id)
);

CREATE INDEX IF NOT EXISTS idx_imported_matches_user ON imported_matches(user_id);
CREATE INDEX IF NOT EXISTS idx_imported_matches_status ON imported_matches(import_status);
