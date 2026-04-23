-- 008 — player_videos
CREATE TABLE IF NOT EXISTS player_videos (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    player_id       UUID NOT NULL REFERENCES player_profiles(id) ON DELETE CASCADE,
    media_asset_id  UUID NOT NULL REFERENCES media_assets(id) ON DELETE CASCADE,
    title           VARCHAR(200),
    video_type      VARCHAR(40),
    match_date      DATE,
    visibility      VARCHAR(20) NOT NULL DEFAULT 'public'
        CHECK (visibility IN ('public','clubs_only','private')),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
