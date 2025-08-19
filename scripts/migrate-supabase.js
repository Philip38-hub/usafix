#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://kgscfdeoxavfufggoyah.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtnc2NmZGVveGF2ZnVmZ2dveWFoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUyOTg3OTUsImV4cCI6MjA3MDg3NDc5NX0.GbGaPuAuZPk0ioZ5zAHcmvvtwp_E_rumyvA3NEXxo6s';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function runMigration() {
  try {
    console.log('🔄 Running Supabase migration...');
    
    // Check if role_selected column already exists
    const { data: columns, error: columnError } = await supabase
      .from('information_schema.columns')
      .select('column_name')
      .eq('table_name', 'profiles')
      .eq('column_name', 'role_selected');
    
    if (columnError) {
      console.error('❌ Error checking column existence:', columnError);
      return;
    }
    
    if (columns && columns.length > 0) {
      console.log('✅ role_selected column already exists');
      return;
    }
    
    // Add role_selected column
    const { error: alterError } = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE profiles ADD COLUMN role_selected BOOLEAN DEFAULT false;
        UPDATE profiles SET role_selected = true WHERE user_type IS NOT NULL;
        CREATE INDEX IF NOT EXISTS idx_profiles_role_selected ON profiles(role_selected);
      `
    });
    
    if (alterError) {
      console.error('❌ Error running migration:', alterError);
      return;
    }
    
    console.log('✅ Migration completed successfully!');
    
    // Verify the migration
    const { data: profiles, error: verifyError } = await supabase
      .from('profiles')
      .select('id, user_type, role_selected')
      .limit(5);
    
    if (verifyError) {
      console.error('❌ Error verifying migration:', verifyError);
      return;
    }
    
    console.log('📊 Sample profiles after migration:');
    console.table(profiles);
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
  }
}

runMigration();
