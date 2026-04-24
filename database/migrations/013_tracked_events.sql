-- 013 — tracked_events
CREATE TABLE IF NOT EXISTS tracked_events (
    id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    report_id      UUID NOT NULL REFERENCES scouting_reports(id) ON DELETE CASCADE,
    timestamp_sec  NUMERIC(10,3) NOT NULL,
    event_type     VARCHAR(40) NOT NULL,
    coordinates    JSONB,
    confidence     NUMERIC(5,4),
    metadata       JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_events_report_ts ON tracked_events (report_id, timestamp_sec);
