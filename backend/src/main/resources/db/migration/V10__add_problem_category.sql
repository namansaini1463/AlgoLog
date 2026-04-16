-- Add category column to problem_bank
ALTER TABLE problem_bank ADD COLUMN category VARCHAR(10) NOT NULL DEFAULT 'DSA';
ALTER TABLE problem_bank ADD CONSTRAINT check_pb_category CHECK (category IN ('DSA', 'LLD', 'HLD'));
CREATE INDEX idx_problem_bank_category ON problem_bank(category);

-- Add category column to user_problems
ALTER TABLE user_problems ADD COLUMN category VARCHAR(10) NOT NULL DEFAULT 'DSA';
ALTER TABLE user_problems ADD CONSTRAINT check_up_category CHECK (category IN ('DSA', 'LLD', 'HLD'));
CREATE INDEX idx_user_problems_category ON user_problems(category);

-- Add category column to topics and update unique constraint
ALTER TABLE topics ADD COLUMN category VARCHAR(10) NOT NULL DEFAULT 'DSA';
ALTER TABLE topics DROP CONSTRAINT IF EXISTS topics_name_key;
ALTER TABLE topics ADD CONSTRAINT topics_name_category_key UNIQUE (name, category);
