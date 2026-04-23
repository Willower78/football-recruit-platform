-- 019 — psych_questions
CREATE TABLE IF NOT EXISTS psych_questions (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    version         VARCHAR(16) NOT NULL DEFAULT 'v1',
    domain          VARCHAR(60) NOT NULL,
    question_text   TEXT NOT NULL,
    reverse_scored  BOOLEAN NOT NULL DEFAULT FALSE,
    active          BOOLEAN NOT NULL DEFAULT TRUE,
    sort_order      INTEGER NOT NULL DEFAULT 0,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_psych_questions_domain ON psych_questions (domain);
