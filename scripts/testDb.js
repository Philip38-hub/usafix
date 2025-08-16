#!/usr/bin/env node

import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'data', 'marketplace.db');
console.log('Testing database at:', dbPath);

const db = new Database(dbPath);

// Test basic connectivity
console.log('Testing database connectivity...');
const testResult = db.prepare('SELECT 1 as test').get();
console.log('Connectivity test:', testResult.test === 1 ? 'PASSED' : 'FAILED');

// Check table structure
console.log('\nChecking table structure...');
const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
console.log('Tables found:', tables.map(t => t.name));

// Check if tables have the expected structure
const userColumns = db.prepare("PRAGMA table_info(users)").all();
console.log('\nUsers table columns:', userColumns.length);

const providerColumns = db.prepare("PRAGMA table_info(service_providers)").all();
console.log('Service providers table columns:', providerColumns.length);

const bookingColumns = db.prepare("PRAGMA table_info(bookings)").all();
console.log('Bookings table columns:', bookingColumns.length);

const ratingColumns = db.prepare("PRAGMA table_info(ratings)").all();
console.log('Ratings table columns:', ratingColumns.length);

// Check current data counts
console.log('\nCurrent data counts:');
const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get();
console.log('Users:', userCount.count);

const providerCount = db.prepare('SELECT COUNT(*) as count FROM service_providers').get();
console.log('Service providers:', providerCount.count);

const bookingCount = db.prepare('SELECT COUNT(*) as count FROM bookings').get();
console.log('Bookings:', bookingCount.count);

const ratingCount = db.prepare('SELECT COUNT(*) as count FROM ratings').get();
console.log('Ratings:', ratingCount.count);

// Sample some data if it exists
if (userCount.count > 0) {
  console.log('\nSample users:');
  const sampleUsers = db.prepare('SELECT full_name, location, user_type FROM users LIMIT 5').all();
  sampleUsers.forEach(user => {
    console.log(`- ${user.full_name} (${user.user_type}) from ${user.location}`);
  });
}

if (providerCount.count > 0) {
  console.log('\nSample service providers:');
  const sampleProviders = db.prepare(`
    SELECT u.full_name, sp.business_name, sp.services_offered, sp.average_rating 
    FROM service_providers sp 
    JOIN users u ON sp.user_id = u.id 
    LIMIT 5
  `).all();
  
  sampleProviders.forEach(provider => {
    const services = JSON.parse(provider.services_offered || '[]');
    console.log(`- ${provider.full_name} (${provider.business_name || 'Individual'}) - ${services.join(', ')} - Rating: ${provider.average_rating}`);
  });
}

db.close();
console.log('\nDatabase test completed successfully!');