-- Migration: Create budget table for Smart and Manual allocations
-- Path: backend/src/main/resources/db/manual/005_create_budget_table.sql

CREATE TABLE budget (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES user_account(id),
    category_id BIGINT NOT NULL REFERENCES category(id),
    amount DECIMAL(15, 2) NOT NULL CHECK (amount > 0),
    period VARCHAR(20) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE INDEX idx_budget_user_id ON budget(user_id);
CREATE INDEX idx_budget_period ON budget(period);
