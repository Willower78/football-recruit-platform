CREATE TABLE psych_assessments (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES users(id) ON DELETE CASCADE,
    version integer DEFAULT 1,
    status text DEFAULT 'draft' CHECK (status IN ('draft','submitted','reviewed')),
    visibility text DEFAULT 'private' CHECK (visibility IN ('private','summary_only','full')),
    completed_at timestamptz,
    consent_id uuid REFERENCES consents(id),
    created_at timestamptz DEFAULT now()
);
