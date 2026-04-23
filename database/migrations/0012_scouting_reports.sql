CREATE TABLE scouting_reports (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    player_id uuid REFERENCES player_profiles(id),
    video_id uuid REFERENCES player_videos(id),
    generated_by text CHECK (generated_by IN ('ai','scout','hybrid')),
    overall_score numeric,
    confidence_score numeric,
    position_fit_scores jsonb,
    strengths jsonb,
    weaknesses jsonb,
    summary_text text,
    status text DEFAULT 'draft' CHECK (status IN ('draft','reviewed','published')),
    created_at timestamptz DEFAULT now()
);
