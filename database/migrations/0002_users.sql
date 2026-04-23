CREATE TABLE users (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    email text UNIQUE NOT NULL,
    password_hash text NOT NULL,
    role text NOT NULL CHECK (role IN ('player','club','scout','admin')),
    status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','pending_verification','suspended')),
    subscription_plan text NOT NULL DEFAULT 'free' CHECK (subscription_plan IN ('free','premium')),
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);
