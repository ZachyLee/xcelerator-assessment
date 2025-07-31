-- Migration script to update profiles table from organization_size to annual_revenue

-- Add the new annual_revenue column
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS annual_revenue TEXT;

-- Update existing data (if any) - you can customize this mapping as needed
-- UPDATE profiles 
-- SET annual_revenue = CASE 
--   WHEN organization_size = '<100 employees' THEN '<$25M'
--   WHEN organization_size = '100–500 employees' THEN '$25M–$100M'
--   WHEN organization_size = '500–1000 employees' THEN '$100M–$500M'
--   WHEN organization_size = '1000+ employees' THEN '$500M+'
--   ELSE NULL
-- END;

-- Drop the old organization_size column (uncomment when ready to remove)
-- ALTER TABLE profiles DROP COLUMN IF EXISTS organization_size; 