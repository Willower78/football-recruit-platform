-- 007 — media_assets
CREATE TABLE IF NOT EXISTS media_assets (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_user_id   UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    asset_type      VARCHAR(20) NOT NULL CHECK (asset_type IN ('image','video','document')),
    storage_url     VARCHAR(500) NOT NULL,
    thumbnail_url   VARCHAR(500),
    duration_sec    INTEGER,
    source_type     VARCHAR(40),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
