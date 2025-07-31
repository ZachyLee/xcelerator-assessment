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
CREATE INDEX idx_ai_recommendations_user_id ON ai_recommendations(user_id);
CREATE INDEX idx_ai_recommendations_assessment_type ON ai_recommendations(assessment_type);

-- Enable Row Level Security
ALTER TABLE ai_recommendations ENABLE ROW LEVEL SECURITY;

-- Create policies for ai_recommendations
CREATE POLICY "Users can view their own AI recommendations" ON ai_recommendations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own AI recommendations" ON ai_recommendations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own AI recommendations" ON ai_recommendations
  FOR UPDATE USING (auth.uid() = user_id); 