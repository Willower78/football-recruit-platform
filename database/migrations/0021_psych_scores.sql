CREATE TABLE psych_scores (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    assessment_id uuid REFERENCES psych_assessments(id) ON DELETE CASCADE,
    domain text,
    raw_score integer,
    normalized_score numeric,
    percentile_band text,
    interpretation_text text
);
