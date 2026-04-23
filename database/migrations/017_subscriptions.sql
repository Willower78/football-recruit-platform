-- 017 — subscriptions
CREATE TABLE IF NOT EXISTS subscriptions (
    id                       UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id                  UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    stripe_customer_id       VARCHAR(120),
    stripe_subscription_id   VARCHAR(120),
    stripe_price_id          VARCHAR(120),
    plan                     VARCHAR(20) NOT NULL DEFAULT 'free' CHECK (plan IN ('free','premium')),
    status                   VARCHAR(40) NOT NULL DEFAULT 'inactive',
    current_period_start     TIMESTAMPTZ,
    current_period_end       TIMESTAMPTZ,
    cancel_at_period_end     BOOLEAN NOT NULL DEFAULT FALSE,
    created_at               TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at               TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
