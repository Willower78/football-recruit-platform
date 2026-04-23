-- 022 — coach_ratings
CREATE TABLE IF NOT EXISTS coach_ratings (
    id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    player_id      UUID NOT NULL REFERENCES player_profiles(id) ON DELETE CASCADE,
    coach_name     VARCHAR(160),
    coach_role     VARCHAR(80),
    domain         VARCHAR(60) NOT NULL,
    score_int      INTEGER NOT NULL CHECK (score_int BETWEEN 1 AND 5),
    notes          TEXT,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
