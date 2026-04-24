-- 030 — highlights: auto-generated highlight clips
CREATE TABLE IF NOT EXISTS highlights (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scouting_report_id  UUID NOT NULL REFERENCES scouting_reports(id) ON DELETE CASCADE,
    player_id           UUID NOT NULL REFERENCES player_profiles(id) ON DELETE CASCADE,
    title               TEXT NOT NULL,
    event_type          TEXT NOT NULL,
    start_time_sec      NUMERIC NOT NULL,
    end_time_sec        NUMERIC NOT NULL,
    duration_sec        NUMERIC NOT NULL,
    clip_storage_url    TEXT,
    thumbnail_url       TEXT,
    confidence          NUMERIC,
    tags                JSONB DEFAULT '[]',
    featured            BOOLEAN DEFAULT FALSE,
    created_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_highlights_player ON highlights(player_id);
CREATE INDEX IF NOT EXISTS idx_highlights_report ON highlights(scouting_report_id);
CREATE INDEX IF NOT EXISTS idx_highlights_event_type ON highlights(event_type);
