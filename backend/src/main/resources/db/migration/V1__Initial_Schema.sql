-- Initial Schema

CREATE TABLE role (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);

CREATE TABLE user_account (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255),
    email VARCHAR(320) UNIQUE,
    provider_name VARCHAR(50),
    provider_user_id VARCHAR(255),
    password_hash VARCHAR(255),
    picture_url TEXT,
    encrypted_access_token TEXT,
    encrypted_refresh_token TEXT,
    onboarding_completed BOOLEAN NOT NULL DEFAULT FALSE,
    tour_completed BOOLEAN NOT NULL DEFAULT FALSE,
    budget_setup_skipped BOOLEAN NOT NULL DEFAULT FALSE,
    first_transaction_added BOOLEAN NOT NULL DEFAULT FALSE,
    balance NUMERIC(15,2) DEFAULT 0.00,
    quick_add_preferences TEXT,
    reminders_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);

CREATE TABLE user_role (
    user_account_id BIGINT NOT NULL REFERENCES user_account(id),
    role_id BIGINT NOT NULL REFERENCES role(id),
    PRIMARY KEY (user_account_id, role_id)
);

CREATE TABLE category (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL,
    icon VARCHAR(255),
    color VARCHAR(50),
    is_global BOOLEAN NOT NULL DEFAULT FALSE,
    user_id BIGINT REFERENCES user_account(id),
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);

CREATE TABLE budget (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES user_account(id),
    category_id BIGINT NOT NULL REFERENCES category(id),
    amount NUMERIC(15,2) NOT NULL,
    period VARCHAR(50) NOT NULL,
    start_date DATE NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);

CREATE TABLE payment_method (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    is_global BOOLEAN NOT NULL DEFAULT FALSE,
    user_account_id BIGINT REFERENCES user_account(id),
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);

CREATE TABLE transaction (
    id BIGSERIAL PRIMARY KEY,
    user_account_id BIGINT NOT NULL REFERENCES user_account(id),
    category_id BIGINT NOT NULL REFERENCES category(id),
    payment_method_id BIGINT REFERENCES payment_method(id),
    amount NUMERIC(15,2) NOT NULL,
    type VARCHAR(50) NOT NULL,
    description VARCHAR(255),
    transaction_date TIMESTAMP NOT NULL,
    is_recurring BOOLEAN NOT NULL DEFAULT FALSE,
    frequency_unit VARCHAR(20),
    frequency_multiplier INTEGER,
    parent_recurring_transaction_id BIGINT REFERENCES transaction(id),
    reconciliation_increase BOOLEAN,
    notes TEXT,
    client_generated_id VARCHAR(255) UNIQUE,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);

CREATE TABLE transaction_attachment (
    id BIGSERIAL PRIMARY KEY,
    transaction_id BIGINT NOT NULL REFERENCES transaction(id),
    filename VARCHAR(255) NOT NULL,
    file_size BIGINT NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    storage_reference TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);

CREATE TABLE onboarding_progress (
    id BIGSERIAL PRIMARY KEY,
    user_account_id BIGINT NOT NULL UNIQUE REFERENCES user_account(id),
    current_step VARCHAR(32) NOT NULL,
    balance_value NUMERIC(15,2),
    funding_source_type VARCHAR(32),
    budget_choice VARCHAR(255),
    initial_transaction_description VARCHAR(255),
    initial_transaction_notes TEXT,
    initial_transaction_payment_method_id BIGINT,
    initial_transaction_date TIMESTAMP,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);

CREATE TABLE onboarding_initial_balance (
    onboarding_progress_id BIGINT NOT NULL REFERENCES onboarding_progress(id),
    payment_method_id BIGINT,
    amount NUMERIC(15,2),
    description VARCHAR(255),
    notes TEXT,
    transaction_date TIMESTAMP
);

CREATE TABLE user_funding_source (
    id BIGSERIAL PRIMARY KEY,
    user_account_id BIGINT NOT NULL REFERENCES user_account(id),
    source_type VARCHAR(32) NOT NULL,
    name VARCHAR(100) NOT NULL,
    current_balance NUMERIC(15,2) NOT NULL DEFAULT 0.00,
    is_primary BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);

CREATE TABLE reminder_schedule (
    id BIGSERIAL PRIMARY KEY,
    transaction_id BIGINT NOT NULL REFERENCES transaction(id),
    next_reminder_timestamp TIMESTAMP,
    is_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    retry_count INTEGER DEFAULT 0,
    last_retry_timestamp TIMESTAMP,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);

CREATE TABLE persistent_session (
    id BIGSERIAL PRIMARY KEY,
    user_account_id BIGINT NOT NULL REFERENCES user_account(id),
    token_hash VARCHAR(255) NOT NULL UNIQUE,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);
