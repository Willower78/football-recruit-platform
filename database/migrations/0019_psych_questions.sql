CREATE TABLE psych_questions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    version integer DEFAULT 1,
    domain text NOT NULL,
    question_text text NOT NULL,
    reverse_scored boolean DEFAULT false,
    active boolean DEFAULT true,
    sort_order integer
);
