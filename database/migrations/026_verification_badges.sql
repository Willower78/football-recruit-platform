-- 026 — verification_badges
CREATE TABLE IF NOT EXISTS verification_badges (
    id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entity_type    VARCHAR(40) NOT NULL,
    entity_id      UUID NOT NULL,
    badge_type     VARCHAR(20) NOT NULL CHECK (badge_type IN ('verified','official','trusted')),
    granted_by     UUID REFERENCES users(id) ON DELETE SET NULL,
    granted_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at     TIMESTAMPTZ,
    revoked        BOOLEAN NOT NULL DEFAULT FALSE,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_badges_entity ON verification_badges (entity_type, entity_id);
