-- 024 — recommendations
CREATE TABLE IF NOT EXISTS recommendations (
    id                     UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    request_id             UUID REFERENCES recommendation_requests(id) ON DELETE SET NULL,
    player_id              UUID NOT NULL REFERENCES player_profiles(id) ON DELETE CASCADE,
    coach_name             VARCHAR(160),
    coach_role             VARCHAR(80),
    coach_email            VARCHAR(320),
    coach_organization     VARCHAR(200),
    overall_rating         INTEGER CHECK (overall_rating BETWEEN 1 AND 5),
    strengths_text         TEXT,
    development_text       TEXT,
    domain_ratings         JSONB NOT NULL DEFAULT '{}'::jsonb,
    verified               BOOLEAN NOT NULL DEFAULT FALSE,
    verification_status    VARCHAR(20) NOT NULL DEFAULT 'unverified'
        CHECK (verification_status IN ('unverified','pending','verified','rejected')),
    visibility             VARCHAR(20) NOT NULL DEFAULT 'public'
        CHECK (visibility IN ('public','clubs_only','private')),
    created_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at             TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_recommendations_player ON recommendations (player_id);
