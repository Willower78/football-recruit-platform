CREATE TABLE coach_ratings (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    player_id uuid REFERENCES player_profiles(id) ON DELETE CASCADE,
    coach_name text,
    coach_role text,
    domain text,
    score_int integer,
    notes text,
    created_at timestamptz DEFAULT now()
);
