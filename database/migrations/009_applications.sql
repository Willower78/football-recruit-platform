-- 009 — applications
CREATE TABLE IF NOT EXISTS applications (
    id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    player_id      UUID NOT NULL REFERENCES player_profiles(id) ON DELETE CASCADE,
    club_need_id   UUID NOT NULL REFERENCES club_needs(id) ON DELETE CASCADE,
    status         VARCHAR(20) NOT NULL DEFAULT 'submitted'
        CHECK (status IN ('submitted','viewed','shortlisted','invited','rejected','signed')),
    created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (player_id, club_need_id)
);

CREATE INDEX IF NOT EXISTS idx_application_status ON applications (status);
