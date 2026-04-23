-- 021 — psych_scores
CREATE TABLE IF NOT EXISTS psych_scores (
    id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    assessment_id         UUID NOT NULL REFERENCES psych_assessments(id) ON DELETE CASCADE,
    domain                VARCHAR(60) NOT NULL,
    raw_score             NUMERIC(10,4),
    normalized_score      NUMERIC(10,4),
    percentile_band       VARCHAR(20),
    interpretation_text   TEXT,
    created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (assessment_id, domain)
);
