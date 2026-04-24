-- 031 — scouting_ratings: per-category ratings linked to scouting reports
CREATE TABLE IF NOT EXISTS scouting_ratings (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_id           UUID NOT NULL REFERENCES scouting_reports(id) ON DELETE CASCADE,
    category            TEXT NOT NULL,
    score               NUMERIC(3,1),
    ai_generated        BOOLEAN NOT NULL DEFAULT TRUE,
    notes               TEXT,
    created_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_scouting_ratings_report ON scouting_ratings(report_id);
