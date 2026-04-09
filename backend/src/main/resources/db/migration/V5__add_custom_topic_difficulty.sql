-- Add topic and difficulty fields for custom problems
ALTER TABLE user_problems ADD COLUMN custom_topic VARCHAR(100);
ALTER TABLE user_problems ADD COLUMN custom_difficulty VARCHAR(10);

-- Add check constraint for difficulty values
ALTER TABLE user_problems ADD CONSTRAINT check_custom_difficulty
    CHECK (custom_difficulty IS NULL OR custom_difficulty IN ('EASY', 'MEDIUM', 'HARD'));
