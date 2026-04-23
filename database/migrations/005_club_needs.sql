-- 005 — club_needs
CREATE TABLE IF NOT EXISTS club_needs (
    id                   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    club_id              UUID NOT NULL REFERENCES club_profiles(id) ON DELETE CASCADE,
    team_name            VARCHAR(160),
    age_group            VARCHAR(40),
    position             VARCHAR(30),
    foot_preference      VARCHAR(10) CHECK (foot_preference IN ('left','right','both','any')),
    playing_style_tags   JSONB NOT NULL DEFAULT '[]'::jsonb,
    min_height_cm        INTEGER,
    max_age              INTEGER,
    contract_type        VARCHAR(40),
    start_date           DATE,
    status               VARCHAR(20) NOT NULL DEFAULT 'open' CHECK (status IN ('open','closed')),
    created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_need_status_position ON club_needs (status, position);
