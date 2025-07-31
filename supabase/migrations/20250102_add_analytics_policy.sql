-- Add analytics policy for profiles table
CREATE POLICY "Analytics can view all profiles" ON profiles
  FOR SELECT USING (true); 