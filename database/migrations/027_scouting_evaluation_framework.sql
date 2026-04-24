-- 027 — Scouting evaluation framework + saved searches

-- 1. scouting_categories — reference table for the 13 evaluation sub-categories
CREATE TABLE IF NOT EXISTS scouting_categories (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    domain          TEXT NOT NULL,
    name            TEXT NOT NULL,
    slug            TEXT NOT NULL UNIQUE,
    description     TEXT,
    ai_detectable   BOOLEAN DEFAULT FALSE,
    sort_order      INTEGER NOT NULL,
    active          BOOLEAN DEFAULT TRUE,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- 2. scouting_ratings — individual ratings linked to scouting reports
CREATE TABLE IF NOT EXISTS scouting_ratings (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_id       UUID NOT NULL REFERENCES scouting_reports(id) ON DELETE CASCADE,
    category_id     UUID NOT NULL REFERENCES scouting_categories(id),
    score           INTEGER NOT NULL CHECK (score >= 1 AND score <= 10),
    source          TEXT NOT NULL CHECK (source IN ('ai', 'scout', 'hybrid')),
    confidence      NUMERIC(3,2),
    notes           TEXT,
    rated_by        UUID REFERENCES users(id),
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(report_id, category_id, source)
);

CREATE INDEX IF NOT EXISTS idx_scouting_ratings_report   ON scouting_ratings(report_id);
CREATE INDEX IF NOT EXISTS idx_scouting_ratings_category ON scouting_ratings(category_id);

-- 3. player_aggregate_ratings — cached aggregate ratings per player
CREATE TABLE IF NOT EXISTS player_aggregate_ratings (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    player_id       UUID NOT NULL REFERENCES player_profiles(id) ON DELETE CASCADE,
    category_slug   TEXT NOT NULL,
    avg_score       NUMERIC(4,2),
    max_score       NUMERIC(4,2),
    latest_score    NUMERIC(4,2),
    report_count    INTEGER DEFAULT 0,
    last_updated    TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(player_id, category_slug)
);

CREATE INDEX IF NOT EXISTS idx_player_agg_ratings_player     ON player_aggregate_ratings(player_id);
CREATE INDEX IF NOT EXISTS idx_player_agg_ratings_slug_score ON player_aggregate_ratings(category_slug, avg_score DESC);

-- 4. saved_searches — user-saved filter presets
CREATE TABLE IF NOT EXISTS saved_searches (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name            TEXT NOT NULL,
    filters         JSONB NOT NULL,
    sort_by         TEXT,
    sort_order      TEXT DEFAULT 'desc',
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_saved_searches_user ON saved_searches(user_id);

-- Seed the 13 scouting categories
INSERT INTO scouting_categories (domain, name, slug, description, ai_detectable, sort_order) VALUES
  ('technical', 'First Touch & Composure',       'first_touch_composure',       'Ability to control the ball cleanly under pressure and maintain composure in tight spaces', true,  1),
  ('technical', 'Passing Accuracy & Range',       'passing_accuracy_range',       'Short and long-range passing accuracy, weight of pass, and variety of distribution', true,  2),
  ('technical', 'Dribbling & Ball Carrying',      'dribbling_ball_carrying',      'Close control, ability to beat defenders, and progressive ball carrying', true,  3),
  ('technical', 'Shooting & Finishing',            'shooting_finishing',            'Shot accuracy, power, composure in front of goal, and finishing from various positions', true,  4),
  ('technical', 'Position-Specific Technique',     'position_specific_technique',   'Specialist skills relevant to primary position (e.g. heading for CB, crossing for FB)', false, 5),
  ('tactical',  'Off-Ball Movement & Space Finding','off_ball_movement',            'Intelligent movement off the ball, creating space, and finding pockets between lines', true,  6),
  ('tactical',  'Game Reading & Anticipation',     'game_reading_anticipation',     'Ability to read the game, anticipate play, and intercept or prevent danger', false, 7),
  ('tactical',  'Tactical Role Understanding',     'tactical_role_understanding',   'Understanding of positional responsibilities within different formations and systems', false, 8),
  ('physical',  'Speed & Agility',                 'speed_agility',                 'Acceleration, top speed, change of direction, and agility in tight spaces', true,  9),
  ('physical',  'Strength & Stamina',              'strength_stamina',              'Physical strength in duels, endurance over 90 minutes, and recovery between matches', true,  10),
  ('mental',    'Decision-Making Under Pressure',  'decision_making',               'Speed and quality of decisions in high-pressure match situations', false, 11),
  ('mental',    'Mentality & Discipline',          'mentality_discipline',          'Mental toughness, discipline, work rate, and response to setbacks during matches', false, 12),
  ('intangibles','Body Language & Consistency',    'body_language_consistency',     'Positive body language, leadership cues, and consistency of performance across matches', false, 13)
ON CONFLICT (slug) DO NOTHING;
