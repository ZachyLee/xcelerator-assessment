-- Add user_country column to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS user_country TEXT; 