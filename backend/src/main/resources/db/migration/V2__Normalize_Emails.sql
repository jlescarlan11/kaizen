-- Migration to normalize emails and prevent case-sensitive duplicates

-- 1. Lowercase all emails
UPDATE user_account SET email = LOWER(email);

-- 2. Identify and remove duplicates (keeping the one with the smallest ID, which is likely the oldest/original)
DELETE FROM user_account u1
USING user_account u2
WHERE u1.id > u2.id
AND u1.email = u2.email;

-- 3. Add a unique index on LOWER(email) to prevent future duplicates
-- First remove the old unique constraint if it exists (it was named uk_user_account_email in entity)
-- Note: In V1__Initial_Schema.sql it was implicitly created by the UNIQUE keyword
ALTER TABLE user_account DROP CONSTRAINT IF EXISTS user_account_email_key;

-- Create the new case-insensitive unique index
CREATE UNIQUE INDEX uk_user_account_email_case_insensitive ON user_account (LOWER(email));
