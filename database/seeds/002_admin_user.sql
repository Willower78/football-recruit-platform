-- 002 — Default admin user.
-- Email:    admin@footballrecruit.com
-- Password: ChangeMe123!
-- The password_hash below is a bcrypt hash of "ChangeMe123!" at cost 10.
-- IMPORTANT: change this password in any non-dev environment.
INSERT INTO users (email, password_hash, role, status, subscription_plan)
VALUES (
  'admin@footballrecruit.com',
  '$2b$10$8/kwqJcswT2W4H4ro.h.6Oh5NKjNFWPQPg0Scm4goQTC9MN51VxGq',
  'admin',
  'active',
  'free'
)
ON CONFLICT (email) DO NOTHING;
