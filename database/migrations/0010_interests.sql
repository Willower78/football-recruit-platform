CREATE TABLE interests (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    from_user_id uuid REFERENCES users(id),
    to_user_id uuid REFERENCES users(id),
    context_type text CHECK (context_type IN ('player_to_club','club_to_player')),
    context_id uuid,
    status text DEFAULT 'pending' CHECK (status IN ('pending','mutual','withdrawn')),
    created_at timestamptz DEFAULT now()
);
