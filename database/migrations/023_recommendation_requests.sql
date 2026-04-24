-- 023 — recommendation_requests
CREATE TABLE IF NOT EXISTS recommendation_requests (
    id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    player_id     UUID NOT NULL REFERENCES player_profiles(id) ON DELETE CASCADE,
    coach_email   VARCHAR(320) NOT NULL,
    coach_name    VARCHAR(160),
    status        VARCHAR(20) NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending','sent','completed','expired')),
    token         VARCHAR(120) NOT NULL UNIQUE,
    expires_at    TIMESTAMPTZ NOT NULL,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
