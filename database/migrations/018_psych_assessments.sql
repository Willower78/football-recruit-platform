-- 018 — psych_assessments
CREATE TABLE IF NOT EXISTS psych_assessments (
    id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id        UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    version        VARCHAR(16) NOT NULL DEFAULT 'v1',
    status         VARCHAR(20) NOT NULL DEFAULT 'draft'
        CHECK (status IN ('draft','submitted','reviewed')),
    visibility     VARCHAR(20) NOT NULL DEFAULT 'private'
        CHECK (visibility IN ('private','summary_only','full')),
    completed_at   TIMESTAMPTZ,
    consent_id     UUID REFERENCES consents(id) ON DELETE SET NULL,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
