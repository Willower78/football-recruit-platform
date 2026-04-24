-- 020 — psych_responses
CREATE TABLE IF NOT EXISTS psych_responses (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    assessment_id   UUID NOT NULL REFERENCES psych_assessments(id) ON DELETE CASCADE,
    question_id     UUID NOT NULL REFERENCES psych_questions(id) ON DELETE CASCADE,
    score_int       INTEGER NOT NULL CHECK (score_int BETWEEN 1 AND 5),
    answered_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (assessment_id, question_id)
);

CREATE INDEX IF NOT EXISTS idx_psych_responses_assessment ON psych_responses (assessment_id);
