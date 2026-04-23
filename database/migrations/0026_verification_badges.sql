CREATE TABLE verification_badges (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type text CHECK (entity_type IN ('club','coach_recommendation','player')),
    entity_id uuid,
    badge_type text CHECK (badge_type IN ('verified','official','trusted')),
    granted_by uuid REFERENCES users(id),
    granted_at timestamptz DEFAULT now(),
    expires_at timestamptz,
    revoked boolean DEFAULT false,
    revoked_at timestamptz,
    revoke_reason text
);
