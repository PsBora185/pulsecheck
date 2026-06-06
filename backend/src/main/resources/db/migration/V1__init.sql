CREATE TABLE IF NOT EXISTS monitors (
    id BIGSERIAL PRIMARY KEY,
    url TEXT NOT NULL UNIQUE,
    name TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    interval_seconds INT DEFAULT 10,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS pings (
    id BIGSERIAL PRIMARY KEY,
    monitor_id BIGINT REFERENCES monitors(id),
    status VARCHAR(10) NOT NULL,
    response_time_ms INT,
    failure_reason TEXT,
    checked_at TIMESTAMP DEFAULT NOW()
);
