-- V2: Convert INITIAL_BALANCE transaction type to INCOME
-- Rename and retype the global "Initial Setup" category to "Initial Balance" (INCOME)
UPDATE category
SET type        = 'INCOME',
    name        = 'Initial Balance',
    updated_at  = NOW()
WHERE name      = 'Initial Setup'
  AND is_global = true;

-- Convert all existing INITIAL_BALANCE transactions to INCOME,
-- assigning the new "Initial Balance" category.
UPDATE transaction
SET type        = 'INCOME',
    category_id = (
        SELECT id
        FROM   category
        WHERE  name      = 'Initial Balance'
          AND  is_global = true
        LIMIT  1
    ),
    updated_at  = NOW()
WHERE type = 'INITIAL_BALANCE';
