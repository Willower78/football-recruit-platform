-- 029 — add verification_code and code_expires_at to verification_requests for email domain flow
ALTER TABLE verification_requests
    ADD COLUMN IF NOT EXISTS verification_code VARCHAR(10),
    ADD COLUMN IF NOT EXISTS code_expires_at TIMESTAMPTZ;

-- add revoked_at and revoke_reason to verification_badges
ALTER TABLE verification_badges
    ADD COLUMN IF NOT EXISTS revoked_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS revoke_reason TEXT;
