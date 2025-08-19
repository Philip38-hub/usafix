-- Fix profiles table for Civic Auth integration
-- Remove dependency on auth.users table and use civic_auth_id as primary identifier

-- First, drop the foreign key constraint if it exists
ALTER TABLE public.profiles 
DROP CONSTRAINT IF EXISTS profiles_user_id_fkey;

-- Make user_id completely nullable and remove unique constraint
ALTER TABLE public.profiles 
ALTER COLUMN user_id DROP NOT NULL;

-- Drop the unique constraint on user_id if it exists
ALTER TABLE public.profiles 
DROP CONSTRAINT IF EXISTS profiles_user_id_key;

-- Ensure civic_auth_id is the primary identifier
ALTER TABLE public.profiles 
ALTER COLUMN civic_auth_id SET NOT NULL;

-- Make sure civic_auth_id has unique constraint
ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_civic_auth_id_unique UNIQUE (civic_auth_id);

-- Update RLS policies to be more permissive for Civic Auth
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;

-- Create new RLS policies that work with civic_auth_id
CREATE POLICY "Allow all profile operations" ON public.profiles 
FOR ALL USING (true) WITH CHECK (true);

-- Fix service_providers table to reference profiles correctly
-- First check if the foreign key exists and drop it
ALTER TABLE public.service_providers 
DROP CONSTRAINT IF EXISTS service_providers_user_id_fkey;

-- Update service_providers to reference profiles by civic_auth_id instead of user_id
-- We'll keep user_id in service_providers but it will reference profiles.civic_auth_id
ALTER TABLE public.service_providers 
ADD CONSTRAINT service_providers_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.profiles(civic_auth_id) ON DELETE CASCADE;

-- Add missing columns to service_providers if they don't exist
-- Note: services_offered is not needed since we have 'services' array column
-- Note: average_rating is not needed since we have 'rating' column
-- Note: total_ratings can use 'total_jobs' column
-- Note: is_available can use 'is_verified' column

ALTER TABLE public.service_providers
ADD COLUMN IF NOT EXISTS years_experience INTEGER DEFAULT 0;

ALTER TABLE public.service_providers
ADD COLUMN IF NOT EXISTS certifications TEXT[] DEFAULT '{}';

-- Ensure we have all the columns the app expects
-- The app will map: rating -> averageRating, total_jobs -> totalRatings, is_verified -> availability

-- Update existing service_providers data if needed
-- Ensure services array is not null
UPDATE public.service_providers
SET services = COALESCE(services, '{}')
WHERE services IS NULL;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_service_providers_user_id ON public.service_providers(user_id);
CREATE INDEX IF NOT EXISTS idx_service_providers_available ON public.service_providers(is_available);
CREATE INDEX IF NOT EXISTS idx_service_providers_rating ON public.service_providers(average_rating);

-- Add comment to clarify the new structure
COMMENT ON TABLE public.profiles IS 'User profiles table using civic_auth_id as primary identifier, independent of Supabase auth.users';
COMMENT ON COLUMN public.profiles.civic_auth_id IS 'Primary identifier from Civic Auth, used as main user reference';
COMMENT ON COLUMN public.profiles.user_id IS 'Legacy field, nullable, may contain civic_auth_id for compatibility';
