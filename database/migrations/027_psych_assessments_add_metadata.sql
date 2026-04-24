-- 027 — Add metadata JSONB and missing columns to psych_assessments & recommendations
ALTER TABLE psych_assessments ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';

-- recommendation_requests additions for reminder & sent tracking
ALTER TABLE recommendation_requests ADD COLUMN IF NOT EXISTS sent_at TIMESTAMPTZ;
ALTER TABLE recommendation_requests ADD COLUMN IF NOT EXISTS reminded_at TIMESTAMPTZ;

-- recommendations additions for extra fields
ALTER TABLE recommendations ADD COLUMN IF NOT EXISTS relationship_duration VARCHAR(60);
ALTER TABLE recommendations ADD COLUMN IF NOT EXISTS would_recommend BOOLEAN DEFAULT TRUE;
ALTER TABLE recommendations ADD COLUMN IF NOT EXISTS additional_notes TEXT;
ALTER TABLE recommendations ADD COLUMN IF NOT EXISTS verified_by UUID REFERENCES users(id);
ALTER TABLE recommendations ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ;
ALTER TABLE recommendations ADD COLUMN IF NOT EXISTS coach_club VARCHAR(200);
ALTER TABLE recommendations ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_recommendation_requests_player ON recommendation_requests(player_id);
CREATE INDEX IF NOT EXISTS idx_recommendation_requests_token ON recommendation_requests(token);
