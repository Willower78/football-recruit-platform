-- 032 — tryouts
CREATE TABLE IF NOT EXISTS tryouts (
    id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    club_id           UUID NOT NULL REFERENCES club_profiles(id) ON DELETE CASCADE,
    title             VARCHAR(300) NOT NULL,
    description       TEXT,
    sport             VARCHAR(60) NOT NULL DEFAULT 'football',
    position          VARCHAR(30),
    age_group         VARCHAR(40),
    location          VARCHAR(300),
    city              VARCHAR(120),
    country           VARCHAR(80),
    tryout_date       TIMESTAMPTZ,
    end_date          TIMESTAMPTZ,
    max_participants  INTEGER,
    requirements      TEXT,
    status            VARCHAR(20) NOT NULL DEFAULT 'open'
        CHECK (status IN ('draft','open','closed','cancelled')),
    created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tryout_status ON tryouts (status);
CREATE INDEX IF NOT EXISTS idx_tryout_club ON tryouts (club_id);
CREATE INDEX IF NOT EXISTS idx_tryout_date ON tryouts (tryout_date);
CREATE INDEX IF NOT EXISTS idx_tryout_sport_position ON tryouts (sport, position);
