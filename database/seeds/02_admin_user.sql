-- Default admin user.
-- Email:    admin@footballrecruit.com
-- Password: ChangeMeNow!2024  (bcrypt, 10 rounds)
-- IMPORTANT: change this password immediately in any environment that is not local dev.
INSERT INTO users (email, password_hash, role, status, subscription_plan)
VALUES (
    'admin@footballrecruit.com',
    '$2b$10$p5T8Z//pVgj3v3FcA3QOqeURYTaZVgIW6b/ClslSqzYq5hdDGr/4K',
    'admin',
    'active',
    'free'
)
ON CONFLICT (email) DO NOTHING;
