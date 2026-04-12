CREATE TABLE IF NOT EXISTS transaction (
    id BIGSERIAL PRIMARY KEY,
    created_at TIMESTAMP(6) WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP(6) WITH TIME ZONE NOT NULL,
    user_account_id BIGINT NOT NULL,
    category_id BIGINT,
    amount DECIMAL(15, 2) NOT NULL,
    type VARCHAR(10) NOT NULL,
    description VARCHAR(255),
    transaction_date TIMESTAMP(6) WITH TIME ZONE NOT NULL,
    CONSTRAINT fk_transaction_user_account FOREIGN KEY (user_account_id) REFERENCES user_account(id),
    CONSTRAINT fk_transaction_category FOREIGN KEY (category_id) REFERENCES category(id)
);

CREATE INDEX idx_transaction_user_account ON transaction(user_account_id);
