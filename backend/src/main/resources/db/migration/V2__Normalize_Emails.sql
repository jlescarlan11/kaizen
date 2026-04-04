-- Migration to normalize emails and prevent case-sensitive duplicates

-- 1. Lowercase all emails
UPDATE user_account SET email = LOWER(email);

-- 2. Identify and remove duplicates using standard SQL (H2 and Postgres compatible)
DELETE FROM user_account WHERE id IN (
    SELECT id FROM (
        SELECT id, ROW_NUMBER() OVER (PARTITION BY LOWER(email) ORDER BY id ASC) as row_num
        FROM user_account
    ) t WHERE row_num > 1
);

-- Create the unique index on LOWER(email) to prevent future duplicates
-- First remove the old unique constraint if it exists
ALTER TABLE user_account DROP CONSTRAINT IF EXISTS user_account_email_key;

-- Create a functional unique index for case-insensitivity
CREATE UNIQUE INDEX IF NOT EXISTS uk_user_account_email_case_insensitive ON user_account (LOWER(email));
