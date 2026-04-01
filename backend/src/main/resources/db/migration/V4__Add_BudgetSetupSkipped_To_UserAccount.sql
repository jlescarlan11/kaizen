-- Comprehensive migration to sync user_account schema with entity
-- This adds all potentially missing columns for users with older database versions.

-- 1. Add missing columns IF they don't exist
ALTER TABLE user_account ADD COLUMN IF NOT EXISTS picture_url TEXT;
ALTER TABLE user_account ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE user_account ADD COLUMN IF NOT EXISTS tour_completed BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE user_account ADD COLUMN IF NOT EXISTS budget_setup_skipped BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE user_account ADD COLUMN IF NOT EXISTS first_transaction_added BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE user_account ADD COLUMN IF NOT EXISTS quick_add_preferences TEXT;
ALTER TABLE user_account ADD COLUMN IF NOT EXISTS reminders_enabled BOOLEAN NOT NULL DEFAULT TRUE;

-- 2. Set defaults for existing null values in columns that should be NOT NULL
-- (V1 had some columns as nullable that the entity requires to be NOT NULL)
UPDATE user_account SET name = 'User' WHERE name IS NULL;
UPDATE user_account SET provider_name = 'LOCAL' WHERE provider_name IS NULL;
UPDATE user_account SET provider_user_id = email WHERE provider_user_id IS NULL;
UPDATE user_account SET encrypted_access_token = '' WHERE encrypted_access_token IS NULL;

-- 3. Ensure required columns are NOT NULL
ALTER TABLE user_account ALTER COLUMN name SET NOT NULL;
ALTER TABLE user_account ALTER COLUMN provider_name SET NOT NULL;
ALTER TABLE user_account ALTER COLUMN provider_user_id SET NOT NULL;
ALTER TABLE user_account ALTER COLUMN encrypted_access_token SET NOT NULL;

-- 4. Fix Transaction category nullability mismatch
-- The entity maps category as optional, but V1 had it as NOT NULL
ALTER TABLE transaction ALTER COLUMN category_id DROP NOT NULL;
