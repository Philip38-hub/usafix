#!/usr/bin/env node

import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import Database from 'better-sqlite3';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Ensure data directory exists
const dataDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Database setup
const dbPath = path.join(dataDir, 'marketplace.db');
const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Initialize database schema
function initializeSchema() {
  // Users table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      civic_auth_id TEXT UNIQUE,
      email TEXT,
      full_name TEXT NOT NULL,
      phone_number TEXT,
      location TEXT NOT NULL,
      user_type TEXT CHECK(user_type IN ('client', 'provider')) NOT NULL,
      avatar_url TEXT,
      role_selected BOOLEAN DEFAULT 0,
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

  // Create indexes
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_users_civic_auth_id ON users(civic_auth_id);
    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    CREATE INDEX IF NOT EXISTS idx_users_user_type ON users(user_type);
    CREATE INDEX IF NOT EXISTS idx_service_providers_user_id ON service_providers(user_id);
  `);
}

// Initialize schema
initializeSchema();

// API Routes

// Users
app.get('/api/users', (req, res) => {
  try {
    const users = db.prepare('SELECT * FROM users ORDER BY created_at DESC').all();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/users/civic/:civicId', (req, res) => {
  try {
    const user = db.prepare('SELECT * FROM users WHERE civic_auth_id = ?').get(req.params.civicId);
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/users', (req, res) => {
  try {
    const { id, civic_auth_id, email, full_name, phone_number, location, user_type, avatar_url, role_selected } = req.body;
    const now = new Date().toISOString();
    
    const stmt = db.prepare(`
      INSERT INTO users (id, civic_auth_id, email, full_name, phone_number, location, user_type, avatar_url, role_selected, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    const result = stmt.run(id, civic_auth_id, email, full_name, phone_number, location, user_type, avatar_url, role_selected || false, now, now);
    
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/users/civic/:civicId', (req, res) => {
  try {
    const { user_type, role_selected } = req.body;
    const now = new Date().toISOString();
    
    const stmt = db.prepare(`
      UPDATE users 
      SET user_type = COALESCE(?, user_type), 
          role_selected = COALESCE(?, role_selected),
          updated_at = ?
      WHERE civic_auth_id = ?
    `);
    
    const result = stmt.run(user_type, role_selected, now, req.params.civicId);
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const user = db.prepare('SELECT * FROM users WHERE civic_auth_id = ?').get(req.params.civicId);
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Service Providers
app.get('/api/service-providers', (req, res) => {
  try {
    const providers = db.prepare(`
      SELECT sp.*, u.full_name, u.phone_number, u.location, u.avatar_url
      FROM service_providers sp
      JOIN users u ON sp.user_id = u.id
      WHERE sp.availability = 1
      ORDER BY sp.average_rating DESC, sp.total_ratings DESC
    `).all();
    
    res.json(providers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  try {
    const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get().count;
    const providerCount = db.prepare('SELECT COUNT(*) as count FROM service_providers').get().count;
    
    res.json({
      status: 'healthy',
      database: 'connected',
      stats: {
        users: userCount,
        providers: providerCount
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Seed data endpoint
app.post('/api/seed', (req, res) => {
  try {
    // Check if we already have data
    const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get().count;
    if (userCount > 0) {
      return res.json({ message: 'Database already seeded', userCount });
    }

    // Add sample users and providers here
    // This is a simplified version - you can expand it
    const sampleUsers = [
      {
        id: 'user-1',
        civic_auth_id: null,
        email: 'provider1@example.com',
        full_name: 'John Doe',
        phone_number: '+254712345678',
        location: 'Nairobi',
        user_type: 'provider',
        avatar_url: null,
        role_selected: true
      },
      {
        id: 'user-2',
        civic_auth_id: null,
        email: 'client1@example.com',
        full_name: 'Jane Smith',
        phone_number: '+254723456789',
        location: 'Nairobi',
        user_type: 'client',
        avatar_url: null,
        role_selected: true
      }
    ];

    const insertUser = db.prepare(`
      INSERT INTO users (id, civic_auth_id, email, full_name, phone_number, location, user_type, avatar_url, role_selected, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const now = new Date().toISOString();
    sampleUsers.forEach(user => {
      insertUser.run(user.id, user.civic_auth_id, user.email, user.full_name, user.phone_number, user.location, user.user_type, user.avatar_url, user.role_selected, now, now);
    });

    res.json({ message: 'Database seeded successfully', userCount: sampleUsers.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Local SQLite API server running on http://localhost:${PORT}`);
  console.log(`📊 Database location: ${dbPath}`);
  console.log(`🔍 Health check: http://localhost:${PORT}/api/health`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down server...');
  db.close();
  process.exit(0);
});
