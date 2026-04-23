CREATE TABLE psych_responses (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    assessment_id uuid REFERENCES psych_assessments(id) ON DELETE CASCADE,
    question_id uuid REFERENCES psych_questions(id),
    score_int integer CHECK (score_int BETWEEN 1 AND 5),
    answered_at timestamptz
);
