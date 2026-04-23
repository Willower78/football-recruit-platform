CREATE TABLE verification_requests (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES users(id),
    entity_type text CHECK (entity_type IN ('club','coach_recommendation')),
    entity_id uuid,
    verification_method text CHECK (verification_method IN ('email_domain','document','manual_review','api_check')),
    evidence_url text,
    evidence_notes text,
    status text DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected','expired')),
    reviewed_by uuid REFERENCES users(id),
    reviewed_at timestamptz,
    rejection_reason text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);
