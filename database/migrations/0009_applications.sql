CREATE TABLE applications (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    player_id uuid REFERENCES player_profiles(id) ON DELETE CASCADE,
    club_need_id uuid REFERENCES club_needs(id) ON DELETE CASCADE,
    status text DEFAULT 'submitted' CHECK (status IN ('submitted','viewed','shortlisted','invited','rejected','signed')),
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);
