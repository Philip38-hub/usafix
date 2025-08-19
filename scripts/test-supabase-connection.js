#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://kgscfdeoxavfufggoyah.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtnc2NmZGVveGF2ZnVmZ2dveWFoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUyOTg3OTUsImV4cCI6MjA3MDg3NDc5NX0.GbGaPuAuZPk0ioZ5zAHcmvvtwp_E_rumyvA3NEXxo6s';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testConnection() {
  try {
    console.log('🚀 Testing Supabase Connection');
    console.log('==============================');
    
    // Test 1: Basic connection
    console.log('🔍 Testing basic connection...');
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);
    
    if (profilesError) {
      console.error('❌ Connection failed:', profilesError);
      return;
    }
    
    console.log('✅ Connection successful!');
    
    // Test 2: Check if role_selected column exists
    console.log('\n🔍 Checking role_selected column...');
    const { data: testData, error: columnError } = await supabase
      .from('profiles')
      .select('role_selected')
      .limit(1);
    
    if (columnError && columnError.message.includes('column "role_selected" does not exist')) {
      console.log('❌ role_selected column missing!');
      console.log('\n📝 Please run this SQL in your Supabase SQL Editor:');
      console.log(`
-- Add role_selected column to profiles table
ALTER TABLE profiles ADD COLUMN role_selected BOOLEAN DEFAULT false;

-- Update existing profiles to have role_selected = true
UPDATE profiles SET role_selected = true WHERE user_type IS NOT NULL;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_role_selected ON profiles(role_selected);
      `);
      return;
    } else if (columnError) {
      console.error('❌ Error checking column:', columnError);
      return;
    }
    
    console.log('✅ role_selected column exists!');
    
    // Test 3: Show current profiles
    console.log('\n📊 Current profiles in database:');
    const { data: allProfiles, error: allError } = await supabase
      .from('profiles')
      .select('user_id, full_name, user_type, role_selected, created_at')
      .order('created_at', { ascending: false })
      .limit(10);
    
    if (allError) {
      console.error('❌ Error fetching profiles:', allError);
      return;
    }
    
    if (allProfiles && allProfiles.length > 0) {
      console.table(allProfiles);
      console.log(`\n📈 Total profiles shown: ${allProfiles.length}`);
      
      // Count users by role selection status
      const needRoleSelection = allProfiles.filter(p => !p.role_selected).length;
      const hasRoleSelected = allProfiles.filter(p => p.role_selected).length;
      
      console.log(`👥 Users who need role selection: ${needRoleSelection}`);
      console.log(`✅ Users who have selected role: ${hasRoleSelected}`);
    } else {
      console.log('📭 No profiles found in database');
    }
    
    // Test 4: Test service providers
    console.log('\n🔍 Checking service providers...');
    const { data: providers, error: providersError } = await supabase
      .from('service_providers')
      .select('count')
      .limit(1);
    
    if (providersError) {
      console.log('❌ Service providers table error:', providersError);
    } else {
      console.log('✅ Service providers table accessible');
    }
    
    console.log('\n🎉 All tests completed!');
    console.log('\n📋 Next steps:');
    console.log('1. If role_selected column is missing, run the SQL provided above');
    console.log('2. Test the app at http://localhost:8080');
    console.log('3. Sign up with a new email through Civic Auth');
    console.log('4. Verify role selection flow works correctly');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testConnection();
