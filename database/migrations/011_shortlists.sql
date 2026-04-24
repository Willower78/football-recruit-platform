-- 011 — shortlists
CREATE TABLE IF NOT EXISTS shortlists (
    id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    club_id       UUID NOT NULL REFERENCES club_profiles(id) ON DELETE CASCADE,
    player_id     UUID NOT NULL REFERENCES player_profiles(id) ON DELETE CASCADE,
    list_name     VARCHAR(160) NOT NULL DEFAULT 'default',
    stage         VARCHAR(60),
    notes         TEXT,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
