-- 003 — player_profiles
CREATE TABLE IF NOT EXISTS player_profiles (
    id                   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id              UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    full_name            VARCHAR(160),
    date_of_birth        DATE,
    nationality          VARCHAR(80),
    city                 VARCHAR(120),
    country              VARCHAR(80),
    geo_point            GEOGRAPHY(POINT, 4326),
    dominant_foot        VARCHAR(10) CHECK (dominant_foot IN ('left','right','both')),
    primary_position     VARCHAR(30),
    secondary_positions  JSONB NOT NULL DEFAULT '[]'::jsonb,
    height_cm            INTEGER,
    weight_kg            INTEGER,
    current_club         VARCHAR(160),
    free_agent           BOOLEAN NOT NULL DEFAULT TRUE,
    availability_status  VARCHAR(30) NOT NULL DEFAULT 'available'
        CHECK (availability_status IN ('available','open_to_offers','not_available')),
    bio                  TEXT,
    visibility_level     VARCHAR(20) NOT NULL DEFAULT 'public'
        CHECK (visibility_level IN ('public','clubs_only','private')),
    guardian_required    BOOLEAN NOT NULL DEFAULT FALSE,
    created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_player_position ON player_profiles (primary_position);
CREATE INDEX IF NOT EXISTS idx_player_geo      ON player_profiles USING GIST (geo_point);
