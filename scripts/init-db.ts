#!/usr/bin/env node
import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';

console.log('Initializing database...');

// Create data directory if it doesn't exist
const dataDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Run the initialization and seeding scripts
try {
  console.log('Running database initialization...');
  execSync('npx tsx scripts/initDb.js', { stdio: 'inherit' });
  
  console.log('\nSeeding database...');
  execSync('npx tsx scripts/seedDb.js', { stdio: 'inherit' });
  
  console.log('\nDatabase setup completed successfully!');
} catch (error) {
  console.error('Error setting up database:', error);
  process.exit(1);
}
