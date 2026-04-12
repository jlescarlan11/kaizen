-- Add nullable plain-text notes field to transaction table
-- Null value enforced for absent notes (Section 6a)
ALTER TABLE transaction ADD COLUMN notes TEXT;

-- Constraint: No empty strings (checked at application level, but could add CHECK constraint)
-- For now, just adding the column.
