-- Migration: Create category table and update user_account for onboarding
-- Path: backend/src/main/resources/db/manual/004_create_category_and_update_user.sql

-- Add onboarding fields to user_account
ALTER TABLE user_account ADD COLUMN onboarding_completed BOOLEAN DEFAULT FALSE;
ALTER TABLE user_account ADD COLUMN opening_balance DECIMAL(15, 2) DEFAULT 0.00;

-- Create category table
CREATE TABLE category (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    is_global BOOLEAN NOT NULL DEFAULT FALSE,
    user_id BIGINT REFERENCES user_account(id),
    icon VARCHAR(255),
    color VARCHAR(7), -- Hex color e.g. #FFFFFF
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Index for performance
CREATE INDEX idx_category_user_id ON category(user_id);
CREATE INDEX idx_category_is_global ON category(is_global);
