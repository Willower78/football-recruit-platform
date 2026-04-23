-- 006 — player_stats
CREATE TABLE IF NOT EXISTS player_stats (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    player_id       UUID NOT NULL REFERENCES player_profiles(id) ON DELETE CASCADE,
    season          VARCHAR(16),
    team_name       VARCHAR(160),
    competition     VARCHAR(160),
    minutes_played  INTEGER,
    goals           INTEGER,
    assists         INTEGER,
    matches         INTEGER,
    custom_metrics  JSONB NOT NULL DEFAULT '{}'::jsonb,
    source          VARCHAR(40),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
