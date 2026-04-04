-- Add expense column to budget table to track spending
ALTER TABLE budget
ADD COLUMN IF NOT EXISTS expense DECIMAL(15, 2) NOT NULL DEFAULT 0;