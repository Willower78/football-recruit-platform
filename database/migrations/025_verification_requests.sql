-- 025 — verification_requests
CREATE TABLE IF NOT EXISTS verification_requests (
    id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id               UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    entity_type           VARCHAR(40) NOT NULL,
    entity_id             UUID NOT NULL,
    verification_method   VARCHAR(40) NOT NULL,
    evidence              JSONB NOT NULL DEFAULT '{}'::jsonb,
    status                VARCHAR(20) NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending','approved','rejected','expired')),
    reviewed_by           UUID REFERENCES users(id) ON DELETE SET NULL,
    reviewed_at           TIMESTAMPTZ,
    rejection_reason      TEXT,
    created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_verification_status ON verification_requests (status);
