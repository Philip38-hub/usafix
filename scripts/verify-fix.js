#!/usr/bin/env node

/**
 * Verify that the authentication fix is working
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://kgscfdeoxavfufggoyah.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtnc2NmZGVveGF2ZnVmZ2dveWFoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUyOTg3OTUsImV4cCI6MjA3MDg3NDc5NX0.GbGaPuAuZPk0ioZ5zAHcmvvtwp_E_rumyvA3NEXxo6s";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function verifyFix() {
  console.log('🔍 Verifying Authentication Fix');
  console.log('==============================');
  
  try {
    // Check for any new profiles created in the last 5 minutes
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    
    const { data: recentProfiles, error } = await supabase
      .from('profiles')
      .select('*')
      .gte('created_at', fiveMinutesAgo)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('❌ Error checking profiles:', error.message);
      return;
    }
    
    console.log(`📊 Found ${recentProfiles.length} profiles created in the last 5 minutes:`);
    
    if (recentProfiles.length === 0) {
      console.log('⚠️  No recent profiles found');
      console.log('   This is expected if no one has signed in recently');
      console.log('   Try signing in with Civic Auth to test the fix');
    } else {
      recentProfiles.forEach((profile, index) => {
        console.log(`${index + 1}. ${profile.full_name}`);
        console.log(`   Civic Auth ID: ${profile.civic_auth_id}`);
        console.log(`   User Type: ${profile.user_type}`);
        console.log(`   Role Selected: ${profile.role_selected}`);
        console.log(`   Created: ${profile.created_at}`);
        
        // Check if this profile should trigger role selection
        const needsRoleSelection = profile.role_selected === false || 
                                 (profile.role_selected == null && profile.user_type === 'client');
        
        if (needsRoleSelection) {
          console.log('   ✅ This user should see role selection page');
        } else {
          console.log('   ❌ This user will NOT see role selection page');
        }
        console.log('');
      });
    }
    
    // Show total profiles count
    const { data: allProfiles, error: countError } = await supabase
      .from('profiles')
      .select('civic_auth_id, full_name, created_at')
      .order('created_at', { ascending: false });
    
    if (!countError) {
      console.log(`📋 Total profiles in database: ${allProfiles.length}`);
      console.log('Recent profiles:');
      allProfiles.slice(0, 5).forEach((profile, index) => {
        console.log(`${index + 1}. ${profile.full_name} - ${profile.created_at}`);
      });
    }
    
    console.log('');
    console.log('🎯 Expected behavior after fix:');
    console.log('1. User signs in with Civic Auth');
    console.log('2. Console shows "DATABASE_TYPE: supabase"');
    console.log('3. Profile is created in Supabase database');
    console.log('4. User is redirected to role selection page');
    console.log('5. After role selection, user proceeds to dashboard');
    
  } catch (error) {
    console.error('❌ Verification error:', error.message);
  }
}

verifyFix();
