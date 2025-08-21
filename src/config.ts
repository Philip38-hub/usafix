// Database configuration
// Set this to 'supabase' to use Supabase, or 'local' to use IndexedDB
// For development, use 'local' for easy testing without Supabase setup
// For production with cross-browser persistence, use 'supabase'

// Auto-detect based on environment variable, fallback to supabase for development
export const DATABASE_TYPE: 'supabase' | 'local' =
  (import.meta.env.VITE_DATABASE_TYPE as 'supabase' | 'local') || 'supabase';

// Development mode flag
export const IS_DEVELOPMENT = import.meta.env.DEV;

// Enhanced local storage for cross-browser scenarios in development
export const USE_ENHANCED_LOCAL_STORAGE = IS_DEVELOPMENT;

// Supabase configuration
export const SUPABASE_CONFIG = {
  url: import.meta.env.VITE_SUPABASE_URL || '',
  anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || '',
};
