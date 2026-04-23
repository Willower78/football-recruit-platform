-- 012 — scouting_reports
CREATE TABLE IF NOT EXISTS scouting_reports (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    player_id       UUID NOT NULL REFERENCES player_profiles(id) ON DELETE CASCADE,
    video_id        UUID REFERENCES player_videos(id) ON DELETE SET NULL,
    generated_by    VARCHAR(20) NOT NULL CHECK (generated_by IN ('ai','scout','hybrid')),
    scores          JSONB NOT NULL DEFAULT '{}'::jsonb,
    strengths       JSONB NOT NULL DEFAULT '[]'::jsonb,
    weaknesses      JSONB NOT NULL DEFAULT '[]'::jsonb,
    summary_text    TEXT,
    status          VARCHAR(20) NOT NULL DEFAULT 'draft'
        CHECK (status IN ('draft','reviewed','published')),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
