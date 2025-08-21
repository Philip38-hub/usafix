#!/usr/bin/env node

/**
 * Script to check what service providers are actually in the database
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
  process.exit(1);
}

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkProviders() {
  console.log('🔍 Checking Service Providers in Database');
  console.log('=========================================');

  try {
    // Get all service providers
    const { data: providers, error } = await supabase
      .from('service_providers')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error fetching providers:', error);
      return;
    }

    console.log(`📊 Found ${providers.length} service providers in database:`);
    
    if (providers.length === 0) {
      console.log('⚠️  No service providers found in database');
      console.log('💡 You may need to create some test providers first');
      return;
    }

    providers.forEach((provider, index) => {
      console.log(`\n${index + 1}. Provider Details:`);
      console.log(`   ID: ${provider.id}`);
      console.log(`   User ID: ${provider.user_id}`);
      console.log(`   Business Name: ${provider.business_name || 'N/A'}`);
      console.log(`   Description: ${provider.description || 'N/A'}`);
      console.log(`   Services: ${JSON.stringify(provider.services || [])}`);
      console.log(`   Location: ${provider.location || 'N/A'}`);
      console.log(`   County: ${provider.county || 'N/A'}`);
      console.log(`   Phone: ${provider.phone_number || 'N/A'}`);
      console.log(`   Verified: ${provider.is_verified ? 'Yes' : 'No'}`);
      console.log(`   Rating: ${provider.rating || 0}`);
      console.log(`   Total Jobs: ${provider.total_jobs || 0}`);
      console.log(`   Created: ${new Date(provider.created_at).toLocaleDateString()}`);
    });

    // Test fetching a specific provider
    if (providers.length > 0) {
      const testProviderId = providers[0].id;
      console.log(`\n🧪 Testing getServiceProviderById with ID: ${testProviderId}`);
      
      const { data: singleProvider, error: singleError } = await supabase
        .from('service_providers')
        .select('*')
        .eq('id', testProviderId)
        .single();

      if (singleError) {
        console.error('❌ Error fetching single provider:', singleError);
      } else {
        console.log('✅ Successfully fetched single provider:', singleProvider.business_name);
      }
    }

    console.log('\n📋 Summary:');
    console.log(`   - Total providers: ${providers.length}`);
    console.log(`   - Verified providers: ${providers.filter(p => p.is_verified).length}`);
    console.log(`   - Providers with services: ${providers.filter(p => p.services && p.services.length > 0).length}`);
    
    console.log('\n🔗 Booking URLs you can test:');
    providers.slice(0, 3).forEach((provider, index) => {
      console.log(`   ${index + 1}. http://localhost:8080/booking/${provider.id}`);
    });

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

checkProviders().catch(console.error);
