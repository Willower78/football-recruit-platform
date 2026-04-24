-- 002 — users
CREATE TABLE IF NOT EXISTS users (
    id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email             VARCHAR(320) NOT NULL UNIQUE,
    password_hash     VARCHAR(255) NOT NULL,
    role              VARCHAR(20)  NOT NULL CHECK (role IN ('player','club','scout','admin')),
    status            VARCHAR(30)  NOT NULL DEFAULT 'active' CHECK (status IN ('active','pending_verification','suspended')),
    subscription_plan VARCHAR(20)  NOT NULL DEFAULT 'free' CHECK (subscription_plan IN ('free','premium')),
    last_login_at     TIMESTAMPTZ,
    created_at        TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);
CREATE INDEX IF NOT EXISTS idx_users_role  ON users (role);
