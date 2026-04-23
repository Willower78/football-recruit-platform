-- 016 — audit_logs
CREATE TABLE IF NOT EXISTS audit_logs (
    id             BIGSERIAL PRIMARY KEY,
    actor_user_id  UUID REFERENCES users(id) ON DELETE SET NULL,
    action_type    VARCHAR(60) NOT NULL,
    entity_type    VARCHAR(60),
    entity_id      UUID,
    metadata       JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_actor   ON audit_logs (actor_user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity  ON audit_logs (entity_type, entity_id);
