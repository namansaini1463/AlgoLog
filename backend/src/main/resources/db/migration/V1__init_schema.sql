-- Users table
CREATE TABLE users (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email         VARCHAR(255) UNIQUE NOT NULL,
    username      VARCHAR(100) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role          VARCHAR(20) NOT NULL DEFAULT 'ROLE_USER',
    created_at    TIMESTAMP DEFAULT NOW(),
    updated_at    TIMESTAMP DEFAULT NOW()
);

-- Topics table (admin-managed)
CREATE TABLE topics (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name       VARCHAR(100) UNIQUE NOT NULL,
    color_hex  VARCHAR(7),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Problem bank (admin-curated master list)
CREATE TABLE problem_bank (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title         VARCHAR(255) NOT NULL,
    slug          VARCHAR(255) UNIQUE NOT NULL,
    difficulty    VARCHAR(10) NOT NULL,
    topic         VARCHAR(100) NOT NULL,
    tags          TEXT[],
    platform      VARCHAR(50),
    platform_url  VARCHAR(500),
    description   TEXT,
    is_published  BOOLEAN DEFAULT FALSE,
    created_at    TIMESTAMP DEFAULT NOW(),
    updated_at    TIMESTAMP DEFAULT NOW()
);

-- User problems (junction: user's personal copy of a bank problem)
CREATE TABLE user_problems (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    bank_problem_id UUID NOT NULL REFERENCES problem_bank(id) ON DELETE CASCADE,
    confidence      INTEGER CHECK (confidence BETWEEN 1 AND 5),
    one_liner       VARCHAR(500),
    detailed_notes  TEXT,
    time_taken_mins INTEGER,
    hints_used      BOOLEAN DEFAULT FALSE,
    solved_at       TIMESTAMP DEFAULT NOW(),
    updated_at      TIMESTAMP DEFAULT NOW(),
    UNIQUE (user_id, bank_problem_id)
);

-- Revisions (SM-2 spaced repetition data)
CREATE TABLE revisions (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_problem_id   UUID UNIQUE NOT NULL REFERENCES user_problems(id) ON DELETE CASCADE,
    interval_days     INTEGER DEFAULT 1,
    repetition_count  INTEGER DEFAULT 0,
    ease_factor       DOUBLE PRECISION DEFAULT 2.5,
    last_reviewed_at  TIMESTAMP,
    next_due_at       TIMESTAMP NOT NULL,
    created_at        TIMESTAMP DEFAULT NOW()
);

-- Activity log (one row per user per day)
CREATE TABLE activity_log (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    log_date        DATE NOT NULL,
    problems_count  INTEGER DEFAULT 0,
    streak_day      INTEGER DEFAULT 0,
    UNIQUE (user_id, log_date)
);

-- Reported problems
CREATE TABLE reported_problems (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id),
    bank_problem_id UUID NOT NULL REFERENCES problem_bank(id),
    reason          TEXT NOT NULL,
    status          VARCHAR(20) DEFAULT 'PENDING',
    created_at      TIMESTAMP DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX idx_user_problems_user_id ON user_problems(user_id);
CREATE INDEX idx_user_problems_bank_problem_id ON user_problems(bank_problem_id);
CREATE INDEX idx_revisions_next_due ON revisions(next_due_at);
CREATE INDEX idx_activity_log_user_date ON activity_log(user_id, log_date);
CREATE INDEX idx_problem_bank_topic ON problem_bank(topic);
CREATE INDEX idx_problem_bank_difficulty ON problem_bank(difficulty);
CREATE INDEX idx_problem_bank_published ON problem_bank(is_published);
CREATE INDEX idx_reported_problems_status ON reported_problems(status);
