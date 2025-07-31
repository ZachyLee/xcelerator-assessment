-- Create industry_trends table to store trends and implications
CREATE TABLE IF NOT EXISTS industry_trends (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  industry TEXT NOT NULL,
  trends JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_industry_trends_user_id ON industry_trends(user_id);
CREATE INDEX IF NOT EXISTS idx_industry_trends_industry ON industry_trends(industry);

-- Enable Row Level Security
ALTER TABLE industry_trends ENABLE ROW LEVEL SECURITY;

-- Create policies for industry_trends
CREATE POLICY "Users can view their own industry trends" ON industry_trends
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own industry trends" ON industry_trends
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own industry trends" ON industry_trends
  FOR UPDATE USING (auth.uid() = user_id); 