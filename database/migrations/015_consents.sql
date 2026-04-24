-- 015 — consents
CREATE TABLE IF NOT EXISTS consents (
    id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    consent_type  VARCHAR(60) NOT NULL,
    granted       BOOLEAN NOT NULL DEFAULT FALSE,
    granted_at    TIMESTAMPTZ,
    expires_at    TIMESTAMPTZ,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
