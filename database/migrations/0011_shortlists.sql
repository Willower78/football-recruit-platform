CREATE TABLE shortlists (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    club_id uuid REFERENCES club_profiles(id) ON DELETE CASCADE,
    player_id uuid REFERENCES player_profiles(id) ON DELETE CASCADE,
    list_name text,
    stage text,
    notes text,
    created_at timestamptz DEFAULT now()
);
