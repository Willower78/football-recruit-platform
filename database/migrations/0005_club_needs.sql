CREATE TABLE club_needs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    club_id uuid REFERENCES club_profiles(id) ON DELETE CASCADE,
    team_name text,
    age_group text,
    position text,
    foot_preference text,
    playing_style_tags jsonb DEFAULT '[]',
    min_height_cm integer,
    max_age integer,
    contract_type text,
    start_date date,
    status text DEFAULT 'open' CHECK (status IN ('open','closed')),
    created_at timestamptz DEFAULT now()
);
