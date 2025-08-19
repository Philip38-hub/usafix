-- Add role_selected column to profiles table
ALTER TABLE profiles ADD COLUMN role_selected BOOLEAN DEFAULT false;

-- Update existing profiles to have role_selected = true (they've already selected their role)
UPDATE profiles SET role_selected = true WHERE user_type IS NOT NULL;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_role_selected ON profiles(role_selected);

-- Add comment
COMMENT ON COLUMN profiles.role_selected IS 'Indicates whether the user has explicitly selected their role during onboarding';
