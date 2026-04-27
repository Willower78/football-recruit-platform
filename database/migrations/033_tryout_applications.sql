-- 033 — tryout_applications
CREATE TABLE IF NOT EXISTS tryout_applications (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tryout_id       UUID NOT NULL REFERENCES tryouts(id) ON DELETE CASCADE,
    player_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    message         TEXT,
    status          VARCHAR(20) NOT NULL DEFAULT 'applied'
        CHECK (status IN ('applied','accepted','rejected','withdrawn')),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (tryout_id, player_id)
);

CREATE INDEX IF NOT EXISTS idx_tryout_app_tryout ON tryout_applications (tryout_id);
CREATE INDEX IF NOT EXISTS idx_tryout_app_player ON tryout_applications (player_id);
CREATE INDEX IF NOT EXISTS idx_tryout_app_status ON tryout_applications (status);
