#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://kgscfdeoxavfufggoyah.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtnc2NmZGVveGF2ZnVmZ2dveWFoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUyOTg3OTUsImV4cCI6MjA3MDg3NDc5NX0.GbGaPuAuZPk0ioZ5zAHcmvvtwp_E_rumyvA3NEXxo6s';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function debugProfileCreation() {
  try {
    console.log('🔍 Debugging Profile Creation Issue');
    console.log('===================================');
    
    // Check all profiles in Supabase
    console.log('\n1. Checking Supabase profiles...');
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (profilesError) {
      console.error('❌ Error fetching profiles:', profilesError);
      return;
    }
    
    if (profiles && profiles.length > 0) {
      console.log(`✅ Found ${profiles.length} profiles in Supabase:`);
      profiles.forEach((profile, index) => {
        console.log(`\n   Profile ${index + 1}:`);
        console.log(`   - ID: ${profile.id}`);
        console.log(`   - User ID: ${profile.user_id}`);
        console.log(`   - Full Name: ${profile.full_name}`);
        console.log(`   - User Type: ${profile.user_type}`);
        console.log(`   - Role Selected: ${profile.role_selected}`);
        console.log(`   - Created: ${profile.created_at}`);
      });
    } else {
      console.log('📭 No profiles found in Supabase');
    }
    
    // Test profile creation
    console.log('\n2. Testing profile creation...');
    const testUserId = `test_user_${Date.now()}`;
    
    const { data: newProfile, error: createError } = await supabase
      .from('profiles')
      .insert([{
        user_id: testUserId,
        full_name: 'Test User',
        phone_number: null,
        location: 'Nairobi',
        user_type: 'client',
        avatar_url: null,
        role_selected: false, // This should be false for new users
      }])
      .select()
      .single();
    
    if (createError) {
      console.error('❌ Error creating test profile:', createError);
      
      // Check if it's a permissions issue
      if (createError.message.includes('permission')) {
        console.log('\n🔐 This appears to be a permissions issue.');
        console.log('   The anon key might not have INSERT permissions on the profiles table.');
        console.log('   Please check your Supabase RLS (Row Level Security) policies.');
      }
    } else {
      console.log('✅ Test profile created successfully:');
      console.log('   - ID:', newProfile.id);
      console.log('   - User ID:', newProfile.user_id);
      console.log('   - Role Selected:', newProfile.role_selected);
      
      // Clean up test profile
      await supabase
        .from('profiles')
        .delete()
        .eq('user_id', testUserId);
      console.log('🧹 Test profile cleaned up');
    }
    
    // Check RLS policies
    console.log('\n3. Checking table permissions...');
    const { data: testSelect, error: selectError } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);
    
    if (selectError) {
      console.error('❌ SELECT permission issue:', selectError);
    } else {
      console.log('✅ SELECT permissions working');
    }
    
    console.log('\n📋 Diagnosis:');
    console.log('=============');
    
    if (profiles && profiles.length === 0) {
      console.log('🔍 Issue: No profiles in Supabase but app shows profile exists');
      console.log('   Possible causes:');
      console.log('   1. App is still using IndexedDB instead of Supabase');
      console.log('   2. Profile creation is failing silently');
      console.log('   3. RLS policies are preventing profile creation');
      console.log('   4. Different database/environment being used');
    }
    
    console.log('\n🛠️  Next steps:');
    console.log('1. Clear all browser storage (IndexedDB, localStorage)');
    console.log('2. Check browser Network tab for Supabase API calls');
    console.log('3. Verify RLS policies in Supabase dashboard');
    console.log('4. Test with a completely new email address');
    
  } catch (error) {
    console.error('❌ Debug script failed:', error);
  }
}

debugProfileCreation();
