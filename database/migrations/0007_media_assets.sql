CREATE TABLE media_assets (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_user_id uuid REFERENCES users(id) ON DELETE CASCADE,
    asset_type text CHECK (asset_type IN ('video','image','document')),
    storage_url text,
    thumbnail_url text,
    duration_sec integer,
    source_type text CHECK (source_type IN ('upload','youtube_link','external_feed')),
    created_at timestamptz DEFAULT now()
);
