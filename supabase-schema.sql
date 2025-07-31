-- Enable Row Level Security
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

-- Create assessment_responses table
CREATE TABLE assessment_responses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  assessment_type TEXT NOT NULL CHECK (assessment_type IN ('c_level', 'shopfloor')),
  question_id INTEGER NOT NULL,
  answer INTEGER NOT NULL CHECK (answer >= 1 AND answer <= 5),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create assessment_scores table
CREATE TABLE assessment_scores (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  assessment_type TEXT NOT NULL CHECK (assessment_type IN ('c_level', 'shopfloor')),
  total_score INTEGER NOT NULL CHECK (total_score >= 12 AND total_score <= 60),
  readiness_level TEXT NOT NULL CHECK (readiness_level IN ('Beginner', 'Developing', 'Advanced', 'Leader')),
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create profiles table to store user industry and other profile info
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  industry TEXT,
  user_role TEXT,
  user_department TEXT,
  annual_revenue TEXT,
  user_country TEXT,
  -- Assessment data for future use
  c_level_assessment_answers JSONB,
  c_level_total_score INTEGER,
  c_level_readiness_level TEXT,
  c_level_completed_at TIMESTAMP WITH TIME ZONE,
  shopfloor_assessment_answers JSONB,
  shopfloor_total_score INTEGER,
  shopfloor_readiness_level TEXT,
  shopfloor_completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create industry_trends table to store trends and implications
CREATE TABLE industry_trends (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  industry TEXT NOT NULL,
  trends JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create ai_recommendations table to store AI-generated recommendations
CREATE TABLE ai_recommendations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  assessment_type TEXT NOT NULL CHECK (assessment_type IN ('c_level', 'shopfloor')),
  recommendations JSONB NOT NULL,
  readiness_level TEXT NOT NULL,
  total_score INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_assessment_responses_user_id ON assessment_responses(user_id);
CREATE INDEX idx_assessment_responses_assessment_type ON assessment_responses(assessment_type);
CREATE INDEX idx_assessment_scores_user_id ON assessment_scores(user_id);
CREATE INDEX idx_assessment_scores_assessment_type ON assessment_scores(assessment_type);
CREATE INDEX idx_profiles_user_id ON profiles(id);
CREATE INDEX idx_industry_trends_user_id ON industry_trends(user_id);
CREATE INDEX idx_industry_trends_industry ON industry_trends(industry);
CREATE INDEX idx_ai_recommendations_user_id ON ai_recommendations(user_id);
CREATE INDEX idx_ai_recommendations_assessment_type ON ai_recommendations(assessment_type);

-- Enable Row Level Security
ALTER TABLE assessment_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE industry_trends ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_recommendations ENABLE ROW LEVEL SECURITY;

-- Create policies for assessment_responses
CREATE POLICY "Users can view their own assessment responses" ON assessment_responses
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own assessment responses" ON assessment_responses
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own assessment responses" ON assessment_responses
  FOR UPDATE USING (auth.uid() = user_id);

-- Create policies for assessment_scores
CREATE POLICY "Users can view their own assessment scores" ON assessment_scores
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own assessment scores" ON assessment_scores
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own assessment scores" ON assessment_scores
  FOR UPDATE USING (auth.uid() = user_id);

-- Create policies for profiles
CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Create policy for analytics (allow reading all profiles for analytics)
CREATE POLICY "Analytics can view all profiles" ON profiles
  FOR SELECT USING (true);

-- Create policies for industry_trends
CREATE POLICY "Users can view their own industry trends" ON industry_trends
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own industry trends" ON industry_trends
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own industry trends" ON industry_trends
  FOR UPDATE USING (auth.uid() = user_id);

-- Create policies for ai_recommendations
CREATE POLICY "Users can view their own AI recommendations" ON ai_recommendations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own AI recommendations" ON ai_recommendations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own AI recommendations" ON ai_recommendations
  FOR UPDATE USING (auth.uid() = user_id);

-- Create a function to calculate readiness level
CREATE OR REPLACE FUNCTION calculate_readiness_level(score INTEGER)
RETURNS TEXT AS $$
BEGIN
  IF score >= 49 THEN
    RETURN 'Leader';
  ELSIF score >= 37 THEN
    RETURN 'Advanced';
  ELSIF score >= 25 THEN
    RETURN 'Developing';
  ELSE
    RETURN 'Beginner';
  END IF;
END;
$$ LANGUAGE plpgsql; 