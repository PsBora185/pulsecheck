ALTER TABLE monitors ADD COLUMN user_id BIGINT;

CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    display_name VARCHAR(100),
    created_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE monitors 
    ADD CONSTRAINT fk_monitors_user 
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
