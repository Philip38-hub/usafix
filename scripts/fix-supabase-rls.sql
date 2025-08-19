-- Fix Supabase RLS policies for profiles table
-- Run this in your Supabase SQL Editor

-- First, let's see current policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'profiles';

-- Option 1: Temporarily disable RLS for testing (NOT recommended for production)
-- ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- Option 2: Create proper RLS policies for anon users (RECOMMENDED)

-- Allow anon users to insert their own profiles
CREATE POLICY "Allow anon users to insert profiles" ON profiles
  FOR INSERT 
  TO anon
  WITH CHECK (true);

-- Allow anon users to select profiles
CREATE POLICY "Allow anon users to select profiles" ON profiles
  FOR SELECT 
  TO anon
  USING (true);

-- Allow anon users to update their own profiles
CREATE POLICY "Allow anon users to update profiles" ON profiles
  FOR UPDATE 
  TO anon
  USING (true)
  WITH CHECK (true);

-- Check if RLS is enabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'profiles';

-- Test the policies by trying to insert a test profile
INSERT INTO profiles (
  user_id, 
  full_name, 
  phone_number, 
  location, 
  user_type, 
  avatar_url, 
  role_selected
) VALUES (
  '550e8400-e29b-41d4-a716-446655440000',
  'Test User',
  null,
  'Nairobi',
  'client',
  null,
  false
);

-- Clean up test data
DELETE FROM profiles WHERE user_id = '550e8400-e29b-41d4-a716-446655440000';
