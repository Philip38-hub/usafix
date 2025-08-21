#!/usr/bin/env node

/**
 * Test script to verify the profile editing functionality
 * This script checks the database structure and simulates profile updates
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

// Read environment variables from .env file manually
let supabaseUrl, supabaseKey;
try {
  const envFile = readFileSync('.env', 'utf8');
  const envVars = {};
  envFile.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) {
      envVars[key.trim()] = value.trim();
    }
  });
  supabaseUrl = envVars.VITE_SUPABASE_URL;
  supabaseKey = envVars.VITE_SUPABASE_ANON_KEY;
} catch (error) {
  console.error('❌ Could not read .env file:', error.message);
}

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  console.log('Please ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in your .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testProfileFlow() {
  console.log('🧪 Testing Profile Editing Flow');
  console.log('================================');

  try {
    // 1. Check profiles table structure
    console.log('\n1. Checking profiles table structure...');
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .limit(5);

    if (profilesError) {
      console.error('❌ Error fetching profiles:', profilesError);
      return;
    }

    console.log(`✅ Found ${profiles.length} profiles in database`);
    
    // Show sample profile structure
    if (profiles.length > 0) {
      console.log('📋 Sample profile structure:');
      const sampleProfile = profiles[0];
      Object.keys(sampleProfile).forEach(key => {
        console.log(`   ${key}: ${typeof sampleProfile[key]} (${sampleProfile[key] === null ? 'null' : 'has value'})`);
      });
    }

    // 2. Check for incomplete profiles (Civic User names)
    console.log('\n2. Checking for incomplete profiles...');
    const { data: incompleteProfiles, error: incompleteError } = await supabase
      .from('profiles')
      .select('id, civic_auth_id, full_name, phone_number, location, user_type, created_at')
      .or('full_name.is.null,full_name.eq.Civic User');

    if (incompleteError) {
      console.error('❌ Error checking incomplete profiles:', incompleteError);
      return;
    }

    console.log(`📊 Found ${incompleteProfiles.length} incomplete profiles:`);
    incompleteProfiles.forEach((profile, index) => {
      console.log(`   ${index + 1}. ${profile.full_name || 'NULL'} (${profile.user_type}) - Created: ${new Date(profile.created_at).toLocaleDateString()}`);
    });

    // 3. Test profile update functionality
    if (incompleteProfiles.length > 0) {
      console.log('\n3. Testing profile update functionality...');
      const testProfile = incompleteProfiles[0];
      
      console.log(`🔄 Testing update for profile: ${testProfile.civic_auth_id}`);
      
      // Simulate a profile update
      const testUpdate = {
        full_name: 'Test User Updated',
        phone_number: '+254712345678',
        location: 'Nairobi',
        updated_at: new Date().toISOString()
      };

      const { data: updateResult, error: updateError } = await supabase
        .from('profiles')
        .update(testUpdate)
        .eq('civic_auth_id', testProfile.civic_auth_id)
        .select();

      if (updateError) {
        console.error('❌ Error updating profile:', updateError);
        return;
      }

      console.log('✅ Profile update successful!');
      console.log('📋 Updated profile data:');
      console.log(`   Full Name: ${updateResult[0].full_name}`);
      console.log(`   Phone: ${updateResult[0].phone_number}`);
      console.log(`   Location: ${updateResult[0].location}`);
      console.log(`   Updated At: ${updateResult[0].updated_at}`);

      // Revert the test update
      console.log('\n🔄 Reverting test update...');
      const { error: revertError } = await supabase
        .from('profiles')
        .update({
          full_name: testProfile.full_name,
          phone_number: testProfile.phone_number,
          location: testProfile.location,
          updated_at: new Date().toISOString()
        })
        .eq('civic_auth_id', testProfile.civic_auth_id);

      if (revertError) {
        console.error('⚠️ Warning: Could not revert test update:', revertError);
      } else {
        console.log('✅ Test update reverted successfully');
      }
    } else {
      console.log('ℹ️ No incomplete profiles found to test with');
    }

    // 4. Summary and recommendations
    console.log('\n4. Summary and Recommendations');
    console.log('==============================');
    
    if (incompleteProfiles.length > 0) {
      console.log(`📈 Profile Completion Status:`);
      console.log(`   - ${profiles.length - incompleteProfiles.length} complete profiles`);
      console.log(`   - ${incompleteProfiles.length} incomplete profiles`);
      console.log(`   - ${Math.round(((profiles.length - incompleteProfiles.length) / profiles.length) * 100)}% completion rate`);
      
      console.log('\n💡 Recommendations:');
      console.log('   - Users with incomplete profiles will be redirected to profile editing');
      console.log('   - Profile completion alerts will be shown on dashboards');
      console.log('   - Consider sending email reminders for profile completion');
    } else {
      console.log('🎉 All profiles are complete!');
    }

    console.log('\n✅ Profile editing flow test completed successfully!');
    console.log('\n🚀 Next steps:');
    console.log('   1. Start the development server: npm run dev');
    console.log('   2. Sign in with Civic Auth');
    console.log('   3. Complete role selection');
    console.log('   4. Test profile editing at /profile');
    console.log('   5. Verify data persistence in database');

  } catch (error) {
    console.error('❌ Test failed with error:', error);
  }
}

// Run the test
testProfileFlow().catch(console.error);
