import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const dbPath = path.join(process.cwd(), 'data', 'marketplace.db');
const outputPath = path.join(process.cwd(), 'public', 'seed-data.json');

console.log('Exporting data from SQLite to JSON...');

// Connect to the SQLite database
const db = new Database(dbPath, { readonly: true });

// Fetch all data
try {
  // Get users
  const users = db.prepare('SELECT * FROM users').all();
  console.log(`Fetched ${users.length} users`);
  
  // Get service providers
  const serviceProviders = db.prepare(`
    SELECT sp.*, u.phone_number, u.location as county
    FROM service_providers sp
    JOIN users u ON sp.user_id = u.id
  `).all();
  console.log(`Fetched ${serviceProviders.length} service providers`);
  
  // Prepare the data for export
  const exportData = {
    users: users.map(user => ({
      ...user,
      created_at: new Date(user.created_at).toISOString(),
      updated_at: new Date(user.updated_at).toISOString()
    })),
    service_providers: serviceProviders.map(provider => ({
      ...provider,
      availability: provider.availability ? 1 : 0,
      created_at: new Date(provider.created_at).toISOString(),
      updated_at: new Date(provider.updated_at).toISOString()
    }))
  };
  
  // Write to file
  fs.writeFileSync(outputPath, JSON.stringify(exportData, null, 2));
  console.log(`Data exported to ${outputPath}`);
  
} catch (error) {
  console.error('Error exporting data:', error);
  process.exit(1);
} finally {
  // Close the database connection
  db.close();
}
