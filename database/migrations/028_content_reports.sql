-- 028 — content_reports
CREATE TABLE IF NOT EXISTS content_reports (
    id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reporter_user_id      UUID NOT NULL REFERENCES users(id),
    reported_entity_type  TEXT NOT NULL,
    reported_entity_id    UUID NOT NULL,
    reason                TEXT NOT NULL,
    description           TEXT,
    status                TEXT NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending','reviewing','resolved','dismissed')),
    reviewed_by           UUID REFERENCES users(id),
    reviewed_at           TIMESTAMPTZ,
    resolution_notes      TEXT,
    created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_content_reports_status ON content_reports(status);
