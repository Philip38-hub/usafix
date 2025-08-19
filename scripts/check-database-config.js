#!/usr/bin/env node

// Simulate the config loading
const DATABASE_TYPE = process.env.VITE_DATABASE_TYPE || 'supabase';
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://kgscfdeoxavfufggoyah.supabase.co';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtnc2NmZGVveGF2ZnVmZ2dveWFoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUyOTg3OTUsImV4cCI6MjA3MDg3NDc5NX0.GbGaPuAuZPk0ioZ5zAHcmvvtwp_E_rumyvA3NEXxo6s';

console.log('🔍 Database Configuration Check');
console.log('==============================');
console.log(`DATABASE_TYPE: ${DATABASE_TYPE}`);
console.log(`SUPABASE_URL: ${SUPABASE_URL}`);
console.log(`SUPABASE_ANON_KEY: ${SUPABASE_ANON_KEY ? 'Present' : 'Missing'}`);

// Test the condition
const shouldUseSupabase = DATABASE_TYPE === 'supabase' && SUPABASE_URL && SUPABASE_ANON_KEY;
console.log(`\nShould use Supabase: ${shouldUseSupabase}`);

if (shouldUseSupabase) {
  console.log('✅ Configuration is correct for Supabase');
} else {
  console.log('❌ Configuration will fall back to IndexedDB');
  
  if (DATABASE_TYPE !== 'supabase') {
    console.log(`   - DATABASE_TYPE is '${DATABASE_TYPE}', should be 'supabase'`);
  }
  if (!SUPABASE_URL) {
    console.log('   - SUPABASE_URL is missing');
  }
  if (!SUPABASE_ANON_KEY) {
    console.log('   - SUPABASE_ANON_KEY is missing');
  }
}

console.log('\n📝 To fix:');
console.log('1. Make sure src/config.ts has the correct default');
console.log('2. Restart the development server');
console.log('3. Clear browser cache and refresh');
