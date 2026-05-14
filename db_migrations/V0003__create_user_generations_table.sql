CREATE TABLE IF NOT EXISTS user_generations (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    type VARCHAR(20) NOT NULL,
    title VARCHAR(500),
    prompt TEXT,
    result_url TEXT,
    preview_url TEXT,
    duration INTEGER,
    status VARCHAR(20) DEFAULT 'done',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_user_generations_user_id ON user_generations(user_id);
CREATE INDEX IF NOT EXISTS idx_user_generations_type ON user_generations(type);
CREATE INDEX IF NOT EXISTS idx_user_generations_created ON user_generations(created_at DESC);
