-- 004 — club_profiles
CREATE TABLE IF NOT EXISTS club_profiles (
    id                       UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id                  UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    club_name                VARCHAR(200),
    country                  VARCHAR(80),
    city                     VARCHAR(120),
    geo_point                GEOGRAPHY(POINT, 4326),
    league_name              VARCHAR(160),
    competition_level        VARCHAR(60),
    age_groups               JSONB NOT NULL DEFAULT '[]'::jsonb,
    verified                 BOOLEAN NOT NULL DEFAULT FALSE,
    verification_tier        VARCHAR(20) NOT NULL DEFAULT 'unverified'
        CHECK (verification_tier IN ('unverified','pending','verified','official')),
    verified_at              TIMESTAMPTZ,
    official_website_domain  VARCHAR(200),
    description              TEXT,
    website_url              VARCHAR(300),
    created_at               TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at               TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_club_geo ON club_profiles USING GIST (geo_point);
