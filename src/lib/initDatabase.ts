import { getDatabase, runMigrations } from './database';
import { seedDatabase, getDatabaseStats } from './seedDatabase';

// Initialize database with schema and seed data
export async function initializeDatabase(forceSeed: boolean = false): Promise<void> {
  try {
    console.log('Initializing database...');
    
    // Get database connection and run migrations
    const db = getDatabase();
    runMigrations();
    
    // Check if database already has data
    const stats = getDatabaseStats();
    const hasData = stats.users > 0;
    
    if (!hasData || forceSeed) {
      console.log(forceSeed ? 'Force seeding database...' : 'Database is empty, seeding with mock data...');
      
      // Seed with default mock data
      seedDatabase({
        userCount: 50,
        providerCount: 15,
        bookingCount: 100,
        ratingCount: 60
      });
      
      console.log('Database initialization completed successfully!');
    } else {
      console.log('Database already contains data, skipping seeding.');
      console.log('Current stats:', stats);
    }
    
  } catch (error) {
    console.error('Failed to initialize database:', error);
    throw error;
  }
}

// Function to reset database (clear and reseed)
export async function resetDatabase(): Promise<void> {
  console.log('Resetting database...');
  await initializeDatabase(true);
}

// Function to check database health
export function checkDatabaseHealth(): { healthy: boolean; stats: Record<string, number>; error?: string } {
  try {
    const db = getDatabase();
    
    // Test basic connectivity
    const result = db.prepare('SELECT 1 as test').get() as { test: number };
    
    if (result.test !== 1) {
      throw new Error('Database connectivity test failed');
    }
    
    // Get current statistics
    const stats = getDatabaseStats();
    
    return {
      healthy: true,
      stats
    };
    
  } catch (error) {
    return {
      healthy: false,
      stats: {},
      error: error instanceof Error ? error.message : 'Unknown database error'
    };
  }
}