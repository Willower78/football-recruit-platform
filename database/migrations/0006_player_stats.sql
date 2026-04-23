CREATE TABLE player_stats (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    player_id uuid REFERENCES player_profiles(id) ON DELETE CASCADE,
    season text,
    team_name text,
    competition text,
    minutes_played integer,
    goals integer,
    assists integer,
    matches integer,
    custom_metrics jsonb DEFAULT '{}',
    source text,
    created_at timestamptz DEFAULT now()
);
