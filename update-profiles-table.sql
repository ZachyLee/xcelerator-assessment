-- Add assessment-related columns to the profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS c_level_assessment_answers JSONB,
ADD COLUMN IF NOT EXISTS c_level_total_score INTEGER,
ADD COLUMN IF NOT EXISTS c_level_readiness_level TEXT,
ADD COLUMN IF NOT EXISTS c_level_completed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS shopfloor_assessment_answers JSONB,
ADD COLUMN IF NOT EXISTS shopfloor_total_score INTEGER,
ADD COLUMN IF NOT EXISTS shopfloor_readiness_level TEXT,
ADD COLUMN IF NOT EXISTS shopfloor_completed_at TIMESTAMP WITH TIME ZONE;

-- Add constraints for readiness levels
ALTER TABLE profiles 
ADD CONSTRAINT IF NOT EXISTS check_c_level_readiness_level 
CHECK (c_level_readiness_level IS NULL OR c_level_readiness_level IN ('Beginner', 'Developing', 'Advanced', 'Leader'));

ALTER TABLE profiles 
ADD CONSTRAINT IF NOT EXISTS check_shopfloor_readiness_level 
CHECK (shopfloor_readiness_level IS NULL OR shopfloor_readiness_level IN ('Beginner', 'Developing', 'Advanced', 'Leader'));

-- Add constraints for scores
ALTER TABLE profiles 
ADD CONSTRAINT IF NOT EXISTS check_c_level_score 
CHECK (c_level_total_score IS NULL OR (c_level_total_score >= 12 AND c_level_total_score <= 60));

ALTER TABLE profiles 
ADD CONSTRAINT IF NOT EXISTS check_shopfloor_score 
CHECK (shopfloor_total_score IS NULL OR (shopfloor_total_score >= 12 AND shopfloor_total_score <= 60)); 