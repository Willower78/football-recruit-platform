CREATE TABLE audit_logs (
    id bigserial PRIMARY KEY,
    actor_user_id uuid,
    action_type text,
    entity_type text,
    entity_id uuid,
    metadata jsonb,
    created_at timestamptz DEFAULT now()
);
