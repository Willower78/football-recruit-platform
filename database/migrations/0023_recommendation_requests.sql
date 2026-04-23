CREATE TABLE recommendation_requests (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    player_id uuid REFERENCES player_profiles(id) ON DELETE CASCADE,
    coach_email text,
    coach_name text,
    status text DEFAULT 'pending' CHECK (status IN ('pending','completed','expired','declined')),
    token text UNIQUE NOT NULL,
    expires_at timestamptz,
    created_at timestamptz DEFAULT now()
);
