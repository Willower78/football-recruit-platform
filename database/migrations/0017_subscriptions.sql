CREATE TABLE subscriptions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid UNIQUE REFERENCES users(id),
    stripe_customer_id text,
    stripe_subscription_id text,
    plan text DEFAULT 'free' CHECK (plan IN ('free','premium')),
    price_cents integer DEFAULT 500,
    currency text DEFAULT 'eur',
    status text DEFAULT 'active' CHECK (status IN ('active','canceled','past_due','trialing')),
    current_period_start timestamptz,
    current_period_end timestamptz,
    canceled_at timestamptz,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);
