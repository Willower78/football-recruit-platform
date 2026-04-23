CREATE TABLE consents (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES users(id) ON DELETE CASCADE,
    consent_type text CHECK (consent_type IN ('terms','privacy','scouting_ai','marketing','guardian_approval')),
    granted boolean NOT NULL,
    granted_at timestamptz,
    expires_at timestamptz
);
