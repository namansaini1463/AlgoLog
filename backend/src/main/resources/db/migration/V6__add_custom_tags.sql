-- Add tags field for custom problems
ALTER TABLE user_problems ADD COLUMN custom_tags TEXT[];
