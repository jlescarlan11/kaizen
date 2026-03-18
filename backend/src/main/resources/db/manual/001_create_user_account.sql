CREATE TABLE IF NOT EXISTS user_account (
    id BIGSERIAL PRIMARY KEY,
    created_at TIMESTAMP(6) WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP(6) WITH TIME ZONE NOT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(320) NOT NULL,
    provider_name VARCHAR(50) NOT NULL,
    provider_user_id VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255),
    encrypted_access_token TEXT NOT NULL,
    encrypted_refresh_token TEXT
);

CREATE UNIQUE INDEX IF NOT EXISTS uk_user_account_email
    ON user_account (email);

CREATE UNIQUE INDEX IF NOT EXISTS uk_user_account_provider_identity
    ON user_account (provider_name, provider_user_id);
