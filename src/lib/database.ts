import Database from 'better-sqlite3';
import path from 'path';

// Database connection singleton
let db: Database.Database | null = null;

export function getDatabase(): Database.Database {
  if (!db) {
    const dbPath = path.join(process.cwd(), 'data', 'marketplace.db');
    db = new Database(dbPath);
    
    // Enable foreign keys
    db.pragma('foreign_keys = ON');
    
    // Initialize database schema
    initializeSchema();
  }
  
  return db;
}

export function closeDatabase(): void {
  if (db) {
    db.close();
    db = null;
  }
}

function initializeSchema(): void {
  if (!db) return;

  // Create tables in order of dependencies
  
  // Users table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      civic_auth_id TEXT UNIQUE,
      email TEXT,
      full_name TEXT NOT NULL,
      phone_number TEXT NOT NULL,
      location TEXT NOT NULL,
      user_type TEXT CHECK(user_type IN ('client', 'provider')) NOT NULL,
      avatar_url TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Service providers table
  db.exec(`
    CREATE TABLE IF NOT EXISTS service_providers (
      id TEXT PRIMARY KEY,
      user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
      business_name TEXT,
      services_offered TEXT, -- JSON array
      price_range TEXT,
      description TEXT,
      availability BOOLEAN DEFAULT true,
      average_rating REAL DEFAULT 0,
      total_ratings INTEGER DEFAULT 0,
      years_experience INTEGER,
      certifications TEXT, -- JSON array
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Bookings table
  db.exec(`
    CREATE TABLE IF NOT EXISTS bookings (
      id TEXT PRIMARY KEY,
      client_id TEXT REFERENCES users(id) ON DELETE CASCADE,
      provider_id TEXT REFERENCES users(id) ON DELETE CASCADE,
      service_type TEXT NOT NULL,
      scheduled_date DATE NOT NULL,
      scheduled_time TIME NOT NULL,
      status TEXT CHECK(status IN ('pending', 'confirmed', 'in_progress', 'completed', 'cancelled')) DEFAULT 'pending',
      total_amount REAL,
      payment_method TEXT CHECK(payment_method IN ('mpesa', 'cash')),
      payment_status TEXT CHECK(payment_status IN ('pending', 'completed', 'failed')) DEFAULT 'pending',
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Ratings table
  db.exec(`
    CREATE TABLE IF NOT EXISTS ratings (
      id TEXT PRIMARY KEY,
      booking_id TEXT REFERENCES bookings(id) ON DELETE CASCADE,
      provider_id TEXT REFERENCES users(id) ON DELETE CASCADE,
      client_id TEXT REFERENCES users(id) ON DELETE CASCADE,
      rating INTEGER CHECK(rating >= 1 AND rating <= 5) NOT NULL,
      feedback TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create indexes for better performance
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_users_civic_auth_id ON users(civic_auth_id);
    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    CREATE INDEX IF NOT EXISTS idx_users_user_type ON users(user_type);
    CREATE INDEX IF NOT EXISTS idx_service_providers_user_id ON service_providers(user_id);
    CREATE INDEX IF NOT EXISTS idx_bookings_client_id ON bookings(client_id);
    CREATE INDEX IF NOT EXISTS idx_bookings_provider_id ON bookings(provider_id);
    CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
    CREATE INDEX IF NOT EXISTS idx_ratings_provider_id ON ratings(provider_id);
    CREATE INDEX IF NOT EXISTS idx_ratings_booking_id ON ratings(booking_id);
  `);
}

// Migration system
export function runMigrations(): void {
  const db = getDatabase();
  
  // Create migrations table if it doesn't exist
  db.exec(`
    CREATE TABLE IF NOT EXISTS migrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      executed_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // List of migrations to run
  const migrations = [
    {
      name: '001_initial_schema',
      sql: '' // Already handled in initializeSchema
    }
  ];

  // Execute pending migrations
  const executedMigrations = db.prepare('SELECT name FROM migrations').all() as { name: string }[];
  const executedNames = new Set(executedMigrations.map(m => m.name));

  for (const migration of migrations) {
    if (!executedNames.has(migration.name)) {
      if (migration.sql) {
        db.exec(migration.sql);
      }
      db.prepare('INSERT INTO migrations (name) VALUES (?)').run(migration.name);
      console.log(`Executed migration: ${migration.name}`);
    }
  }
}

// Database backup and restore utilities
export function backupDatabase(backupPath: string): void {
  const db = getDatabase();
  db.backup(backupPath);
}

export function restoreDatabase(backupPath: string): void {
  if (db) {
    db.close();
    db = null;
  }
  
  const backupDb = new Database(backupPath, { readonly: true });
  const newDb = getDatabase();
  backupDb.backup(newDb);
  backupDb.close();
}