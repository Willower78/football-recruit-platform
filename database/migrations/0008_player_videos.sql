CREATE TABLE player_videos (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    player_id uuid REFERENCES player_profiles(id) ON DELETE CASCADE,
    media_asset_id uuid REFERENCES media_assets(id) ON DELETE CASCADE,
    title text,
    video_type text CHECK (video_type IN ('highlight','full_match','drill')),
    match_date date,
    visibility text DEFAULT 'public',
    created_at timestamptz DEFAULT now()
);
