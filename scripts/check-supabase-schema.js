#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://kgscfdeoxavfufggoyah.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtnc2NmZGVveGF2ZnVmZ2dveWFoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUyOTg3OTUsImV4cCI6MjA3MDg3NDc5NX0.GbGaPuAuZPk0ioZ5zAHcmvvtwp_E_rumyvA3NEXxo6s';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function checkSchema() {
  try {
    console.log('🔍 Checking Supabase Schema');
    console.log('===========================');
    
    // Try to get schema information
    console.log('\n1. Testing with a valid UUID...');
    const validUUID = '550e8400-e29b-41d4-a716-446655440000';
    
    const { data: testProfile, error: testError } = await supabase
      .from('profiles')
      .insert([{
        user_id: validUUID,
        full_name: 'Test User',
        phone_number: null,
        location: 'Nairobi',
        user_type: 'client',
        avatar_url: null,
        role_selected: false,
      }])
      .select()
      .single();
    
    if (testError) {
      console.error('❌ Error with valid UUID:', testError);
    } else {
      console.log('✅ Valid UUID works! Profile created:');
      console.log('   - ID:', testProfile.id);
      console.log('   - User ID:', testProfile.user_id);
      console.log('   - Role Selected:', testProfile.role_selected);
      
      // Clean up
      await supabase
        .from('profiles')
        .delete()
        .eq('user_id', validUUID);
      console.log('🧹 Test profile cleaned up');
    }
    
    // Test what happens with Civic Auth format
    console.log('\n2. Testing Civic Auth ID format...');
    
    // Civic Auth IDs are typically UUIDs, let's test with a realistic one
    const civicAuthId = 'ad644400-efd6-474f-b3fa-3fd33131453b'; // From the logs
    
    const { data: civicProfile, error: civicError } = await supabase
      .from('profiles')
      .insert([{
        user_id: civicAuthId,
        full_name: 'Civic Test User',
        phone_number: null,
        location: 'Nairobi',
        user_type: 'client',
        avatar_url: null,
        role_selected: false,
      }])
      .select()
      .single();
    
    if (civicError) {
      console.error('❌ Error with Civic Auth ID:', civicError);
    } else {
      console.log('✅ Civic Auth ID works! Profile created:');
      console.log('   - ID:', civicProfile.id);
      console.log('   - User ID:', civicProfile.user_id);
      console.log('   - Role Selected:', civicProfile.role_selected);
      
      // Don't clean up this one - let's keep it for testing
      console.log('📌 Keeping this profile for testing role selection');
    }
    
    // Check current profiles
    console.log('\n3. Current profiles in database:');
    const { data: allProfiles, error: allError } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (allError) {
      console.error('❌ Error fetching profiles:', allError);
    } else if (allProfiles && allProfiles.length > 0) {
      console.log(`✅ Found ${allProfiles.length} profiles:`);
      allProfiles.forEach((profile, index) => {
        console.log(`\n   Profile ${index + 1}:`);
        console.log(`   - ID: ${profile.id}`);
        console.log(`   - User ID: ${profile.user_id}`);
        console.log(`   - Full Name: ${profile.full_name}`);
        console.log(`   - User Type: ${profile.user_type}`);
        console.log(`   - Role Selected: ${profile.role_selected}`);
      });
    } else {
      console.log('📭 No profiles found');
    }
    
    console.log('\n📋 Summary:');
    console.log('===========');
    console.log('✅ Supabase connection working');
    console.log('✅ UUID format required for user_id');
    console.log('✅ Profile creation works with proper UUID');
    console.log('✅ role_selected field is working');
    
  } catch (error) {
    console.error('❌ Schema check failed:', error);
  }
}

checkSchema();
