#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://kgscfdeoxavfufggoyah.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtnc2NmZGVveGF2ZnVmZ2dveWFoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUyOTg3OTUsImV4cCI6MjA3MDg3NDc5NX0.GbGaPuAuZPk0ioZ5zAHcmvvtwp_E_rumyvA3NEXxo6s';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function checkAndAddColumn() {
  try {
    console.log('🔍 Checking Supabase profiles table...');
    
    // First, let's check if we can access the profiles table
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);
    
    if (profilesError) {
      console.error('❌ Error accessing profiles table:', profilesError);
      console.log('\n📝 Please run this SQL manually in your Supabase SQL Editor:');
      console.log(`
-- Add role_selected column to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role_selected BOOLEAN DEFAULT false;

-- Update existing profiles to have role_selected = true (they've already selected their role)
UPDATE profiles SET role_selected = true WHERE user_type IS NOT NULL;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_role_selected ON profiles(role_selected);
      `);
      return;
    }
    
    console.log('✅ Successfully connected to Supabase');
    console.log(`📊 Found ${profiles?.length || 0} profiles in the table`);
    
    // Check if role_selected column exists by trying to select it
    const { data: testData, error: testError } = await supabase
      .from('profiles')
      .select('role_selected')
      .limit(1);
    
    if (testError && testError.message.includes('column "role_selected" does not exist')) {
      console.log('❌ role_selected column does not exist');
      console.log('\n📝 Please run this SQL manually in your Supabase SQL Editor:');
      console.log(`
-- Add role_selected column to profiles table
ALTER TABLE profiles ADD COLUMN role_selected BOOLEAN DEFAULT false;

-- Update existing profiles to have role_selected = true (they've already selected their role)
UPDATE profiles SET role_selected = true WHERE user_type IS NOT NULL;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_role_selected ON profiles(role_selected);
      `);
    } else if (testError) {
      console.error('❌ Error checking role_selected column:', testError);
    } else {
      console.log('✅ role_selected column already exists!');
      
      // Show current data
      const { data: currentProfiles, error: currentError } = await supabase
        .from('profiles')
        .select('user_id, full_name, user_type, role_selected')
        .limit(10);
      
      if (!currentError && currentProfiles) {
        console.log('\n📊 Current profiles:');
        console.table(currentProfiles);
      }
    }
    
  } catch (error) {
    console.error('❌ Script failed:', error);
  }
}

console.log('🚀 Supabase Column Check Script');
console.log('================================');
checkAndAddColumn();
