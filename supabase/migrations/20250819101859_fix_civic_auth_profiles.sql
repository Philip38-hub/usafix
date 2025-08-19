-- Fix profiles table for Civic Auth integration
-- Remove dependency on auth.users table and use civic_auth_id as primary identifier

-- 1. Remove foreign key constraint from profiles table
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_user_id_fkey;

-- 2. Make user_id nullable (remove NOT NULL constraint)
ALTER TABLE public.profiles ALTER COLUMN user_id DROP NOT NULL;

-- 3. Drop unique constraint on user_id if it exists
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_user_id_key;

-- 4. Ensure civic_auth_id is not null and unique
ALTER TABLE public.profiles ALTER COLUMN civic_auth_id SET NOT NULL;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_civic_auth_id_unique UNIQUE (civic_auth_id);

-- 5. Update RLS policies to be more permissive for Civic Auth
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;

CREATE POLICY "Allow all profile operations" ON public.profiles
FOR ALL USING (true) WITH CHECK (true);

-- 6. Fix service_providers table foreign key to reference profiles correctly
ALTER TABLE public.service_providers DROP CONSTRAINT IF EXISTS service_providers_user_id_fkey;
ALTER TABLE public.service_providers ADD CONSTRAINT service_providers_user_id_fkey
FOREIGN KEY (user_id) REFERENCES public.profiles(civic_auth_id) ON DELETE CASCADE;

-- 7. Add missing columns to service_providers
ALTER TABLE public.service_providers ADD COLUMN IF NOT EXISTS years_experience INTEGER DEFAULT 0;
ALTER TABLE public.service_providers ADD COLUMN IF NOT EXISTS certifications TEXT[] DEFAULT '{}';

-- 8. Ensure services array is not null
UPDATE public.service_providers SET services = COALESCE(services, '{}') WHERE services IS NULL;

-- 9. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_service_providers_user_id ON public.service_providers(user_id);
CREATE INDEX IF NOT EXISTS idx_service_providers_available ON public.service_providers(is_verified);
CREATE INDEX IF NOT EXISTS idx_service_providers_rating ON public.service_providers(rating);

-- Add comments to clarify the new structure
COMMENT ON TABLE public.profiles IS 'User profiles table using civic_auth_id as primary identifier, independent of Supabase auth.users';
COMMENT ON COLUMN public.profiles.civic_auth_id IS 'Primary identifier from Civic Auth, used as main user reference';
COMMENT ON COLUMN public.profiles.user_id IS 'Legacy field, nullable, may contain civic_auth_id for compatibility';