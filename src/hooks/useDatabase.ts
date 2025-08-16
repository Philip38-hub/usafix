import { useState, useEffect } from 'react';
import { initializeDatabase, checkDatabaseHealth, resetDatabase } from '../lib/initDatabase';
import { getDatabaseStats } from '../lib/seedDatabase';

interface DatabaseState {
  isInitialized: boolean;
  isLoading: boolean;
  error: string | null;
  stats: Record<string, number>;
  healthy: boolean;
}

export function useDatabase() {
  const [state, setState] = useState<DatabaseState>({
    isInitialized: false,
    isLoading: true,
    error: null,
    stats: {},
    healthy: false
  });

  // Initialize database on mount
  useEffect(() => {
    initDb();
  }, []);

  const initDb = async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      // Check if we're in a browser environment
      if (typeof window === 'undefined') {
        setState(prev => ({ 
          ...prev, 
          isLoading: false, 
          error: 'Database not available in server environment' 
        }));
        return;
      }

      // For now, we'll simulate database initialization
      // In a real app, this would connect to the actual SQLite database
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const health = checkDatabaseHealth();
      
      setState({
        isInitialized: true,
        isLoading: false,
        error: health.error || null,
        stats: health.stats,
        healthy: health.healthy
      });
      
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to initialize database'
      }));
    }
  };

  const refreshStats = async () => {
    try {
      const stats = getDatabaseStats();
      setState(prev => ({ ...prev, stats }));
    } catch (error) {
      console.error('Failed to refresh database stats:', error);
    }
  };

  const resetDb = async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      await resetDatabase();
      await refreshStats();
      setState(prev => ({ ...prev, isLoading: false }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to reset database'
      }));
    }
  };

  return {
    ...state,
    refreshStats,
    resetDatabase: resetDb,
    reinitialize: initDb
  };
}

// Hook for checking if database is ready
export function useDatabaseReady() {
  const { isInitialized, isLoading, error } = useDatabase();
  return isInitialized && !isLoading && !error;
}