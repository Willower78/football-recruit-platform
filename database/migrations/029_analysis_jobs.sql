-- 029 — analysis_jobs: tracks AI pipeline progress for each video
CREATE TABLE IF NOT EXISTS analysis_jobs (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    video_id            UUID REFERENCES player_videos(id),
    imported_match_id   UUID REFERENCES imported_matches(id),
    scouting_report_id  UUID REFERENCES scouting_reports(id),
    status              TEXT NOT NULL DEFAULT 'queued' CHECK (status IN (
        'queued', 'downloading', 'preprocessing', 'detecting', 'tracking',
        'calibrating', 'event_detection', 'aggregating', 'generating_report',
        'clipping_highlights', 'completed', 'failed'
    )),
    progress_pct        INTEGER DEFAULT 0,
    current_stage       TEXT,
    error_message       TEXT,
    started_at          TIMESTAMPTZ,
    completed_at        TIMESTAMPTZ,
    processing_time_sec INTEGER,
    metadata            JSONB DEFAULT '{}',
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_analysis_jobs_user_status ON analysis_jobs(user_id, status);
