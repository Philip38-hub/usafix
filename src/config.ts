// Set this to 'supabase' to use Supabase, or 'local' to use IndexedDB
export const DATABASE_TYPE: 'supabase' | 'local' = 'local';

// Supabase configuration
export const SUPABASE_CONFIG = {
  url: import.meta.env.VITE_SUPABASE_URL || 'https://your-supabase-url.supabase.co',
  anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-supabase-anon-key',
};
