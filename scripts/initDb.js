#!/usr/bin/env node

// Simple Node.js script to initialize the database
// This runs outside of the React app context

import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure data directory exists
const dataDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Database path
const dbPath = path.join(dataDir, 'marketplace.db');

console.log('Initializing SQLite database at:', dbPath);

// Create database connection
const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

console.log('Creating database schema...');

// Create tables
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

db.exec(`
  CREATE TABLE IF NOT EXISTS service_providers (
    id TEXT PRIMARY KEY,
    user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
    business_name TEXT,
    services_offered TEXT,
    price_range TEXT,
    description TEXT,
    availability BOOLEAN DEFAULT true,
    average_rating REAL DEFAULT 0,
    total_ratings INTEGER DEFAULT 0,
    years_experience INTEGER,
    certifications TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

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

// Create indexes
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

// Create migrations table
db.exec(`
  CREATE TABLE IF NOT EXISTS migrations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    executed_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// Record initial migration
const insertMigration = db.prepare('INSERT OR IGNORE INTO migrations (name) VALUES (?)');
insertMigration.run('001_initial_schema');

console.log('Database schema created successfully!');

// Close database
db.close();

console.log('Database initialization completed.');
console.log('You can now run the React app and it will seed the database with mock data.');