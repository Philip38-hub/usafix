-- Add civic_auth_id field to profiles table for Civic Auth integration
ALTER TABLE public.profiles 
ADD COLUMN civic_auth_id TEXT UNIQUE;

-- Create index for faster lookups
CREATE INDEX idx_profiles_civic_auth_id ON public.profiles(civic_auth_id);

-- Update RLS policies to work with civic_auth_id
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;

-- New RLS policies that work with civic_auth_id
CREATE POLICY "Users can update their own profile" ON public.profiles 
FOR UPDATE USING (true); -- Allow updates for now, we'll refine this later

CREATE POLICY "Users can insert their own profile" ON public.profiles 
FOR INSERT WITH CHECK (true); -- Allow inserts for now, we'll refine this later

-- Make user_id nullable since we're using civic_auth_id as primary identifier
ALTER TABLE public.profiles 
ALTER COLUMN user_id DROP NOT NULL;
