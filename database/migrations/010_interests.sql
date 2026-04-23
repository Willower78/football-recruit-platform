-- 010 — interests (mutual interest / like-style pairings)
CREATE TABLE IF NOT EXISTS interests (
    id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    from_user_id   UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    to_user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    context_type   VARCHAR(40),
    context_id     UUID,
    status         VARCHAR(20) NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending','mutual','withdrawn')),
    created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
