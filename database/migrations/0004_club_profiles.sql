CREATE TABLE club_profiles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    club_name text NOT NULL,
    country text,
    city text,
    geo_point geography(Point, 4326),
    league_name text,
    competition_level text,
    age_groups jsonb DEFAULT '[]',
    verified boolean DEFAULT false,
    verification_tier text DEFAULT 'unverified' CHECK (verification_tier IN ('unverified','pending','verified','official')),
    verified_at timestamptz,
    official_website_domain text,
    description text,
    website_url text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);
