import { getDatabase } from './database';
import { 
  generateMockUsers, 
  generateMockServiceProviders, 
  generateMockBookings, 
  generateMockRatings 
} from './mockData';
import { 
  UserProfile, 
  ServiceProvider, 
  Booking, 
  Rating, 
  MockDataOptions 
} from '../types/database';

// Database seeding functions
export class DatabaseSeeder {
  private db = getDatabase();

  // Clear all data from tables
  clearAllData(): void {
    console.log('Clearing existing data...');
    
    // Delete in reverse order of dependencies
    this.db.prepare('DELETE FROM ratings').run();
    this.db.prepare('DELETE FROM bookings').run();
    this.db.prepare('DELETE FROM service_providers').run();
    this.db.prepare('DELETE FROM users').run();
    
    console.log('All data cleared successfully');
  }

  // Seed users table
  seedUsers(users: UserProfile[]): void {
    console.log(`Seeding ${users.length} users...`);
    
    const insertUser = this.db.prepare(`
      INSERT INTO users (
        id, civic_auth_id, email, full_name, phone_number, 
        location, user_type, avatar_url, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const insertMany = this.db.transaction((users: UserProfile[]) => {
      for (const user of users) {
        insertUser.run(
          user.id,
          user.civic_auth_id || null,
          user.email || null,
          user.full_name,
          user.phone_number,
          user.location,
          user.user_type,
          user.avatar_url || null,
          user.created_at,
          user.updated_at
        );
      }
    });

    insertMany(users);
    console.log(`Successfully seeded ${users.length} users`);
  }

  // Seed service providers table
  seedServiceProviders(providers: ServiceProvider[]): void {
    console.log(`Seeding ${providers.length} service providers...`);
    
    const insertProvider = this.db.prepare(`
      INSERT INTO service_providers (
        id, user_id, business_name, services_offered, price_range,
        description, availability, average_rating, total_ratings,
        years_experience, certifications, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const insertMany = this.db.transaction((providers: ServiceProvider[]) => {
      for (const provider of providers) {
        insertProvider.run(
          provider.id,
          provider.user_id,
          provider.business_name || null,
          JSON.stringify(provider.services_offered),
          provider.price_range,
          provider.description,
          provider.availability ? 1 : 0,
          provider.average_rating,
          provider.total_ratings,
          provider.years_experience || null,
          provider.certifications ? JSON.stringify(provider.certifications) : null,
          provider.created_at,
          provider.updated_at
        );
      }
    });

    insertMany(providers);
    console.log(`Successfully seeded ${providers.length} service providers`);
  }

  // Seed bookings table
  seedBookings(bookings: Booking[]): void {
    console.log(`Seeding ${bookings.length} bookings...`);
    
    const insertBooking = this.db.prepare(`
      INSERT INTO bookings (
        id, client_id, provider_id, service_type, scheduled_date,
        scheduled_time, status, total_amount, payment_method,
        payment_status, notes, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const insertMany = this.db.transaction((bookings: Booking[]) => {
      for (const booking of bookings) {
        insertBooking.run(
          booking.id,
          booking.client_id,
          booking.provider_id,
          booking.service_type,
          booking.scheduled_date,
          booking.scheduled_time,
          booking.status,
          booking.total_amount || null,
          booking.payment_method || null,
          booking.payment_status,
          booking.notes || null,
          booking.created_at,
          booking.updated_at
        );
      }
    });

    insertMany(bookings);
    console.log(`Successfully seeded ${bookings.length} bookings`);
  }

  // Seed ratings table
  seedRatings(ratings: Rating[]): void {
    console.log(`Seeding ${ratings.length} ratings...`);
    
    const insertRating = this.db.prepare(`
      INSERT INTO ratings (
        id, booking_id, provider_id, client_id, rating, feedback, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    const insertMany = this.db.transaction((ratings: Rating[]) => {
      for (const rating of ratings) {
        insertRating.run(
          rating.id,
          rating.booking_id,
          rating.provider_id,
          rating.client_id,
          rating.rating,
          rating.feedback || null,
          rating.created_at
        );
      }
    });

    insertMany(ratings);
    console.log(`Successfully seeded ${ratings.length} ratings`);
  }

  // Update provider ratings based on actual ratings data
  updateProviderRatings(): void {
    console.log('Updating provider average ratings...');
    
    const updateRating = this.db.prepare(`
      UPDATE service_providers 
      SET average_rating = ?, total_ratings = ?
      WHERE user_id = ?
    `);

    // Get actual rating statistics for each provider
    const ratingStats = this.db.prepare(`
      SELECT 
        provider_id,
        AVG(rating) as avg_rating,
        COUNT(*) as total_count
      FROM ratings 
      GROUP BY provider_id
    `).all() as Array<{ provider_id: string; avg_rating: number; total_count: number }>;

    const updateMany = this.db.transaction(() => {
      for (const stat of ratingStats) {
        updateRating.run(
          Math.round(stat.avg_rating * 10) / 10, // Round to 1 decimal place
          stat.total_count,
          stat.provider_id
        );
      }
    });

    updateMany();
    console.log(`Updated ratings for ${ratingStats.length} providers`);
  }

  // Complete seeding process
  seedAll(options: MockDataOptions = {}): void {
    const {
      userCount = 50,
      providerCount = 15,
      bookingCount = 100,
      ratingCount = 60
    } = options;

    console.log('Starting database seeding process...');
    console.log(`Target: ${userCount} users (${providerCount} providers), ${bookingCount} bookings, ${ratingCount} ratings`);

    try {
      // Clear existing data
      this.clearAllData();

      // Generate mock data
      console.log('Generating mock data...');
      const users = generateMockUsers(userCount);
      
      // Ensure we have enough providers
      const actualProviders = users.filter(u => u.user_type === 'provider');
      if (actualProviders.length < providerCount) {
        // Convert some clients to providers if needed
        const clients = users.filter(u => u.user_type === 'client');
        const needed = providerCount - actualProviders.length;
        for (let i = 0; i < needed && i < clients.length; i++) {
          clients[i].user_type = 'provider';
        }
      }

      const serviceProviders = generateMockServiceProviders(users);
      const bookings = generateMockBookings(users, serviceProviders, bookingCount);
      const ratings = generateMockRatings(bookings, ratingCount);

      // Seed data in order
      this.seedUsers(users);
      this.seedServiceProviders(serviceProviders);
      this.seedBookings(bookings);
      this.seedRatings(ratings);

      // Update provider ratings based on actual data
      this.updateProviderRatings();

      console.log('Database seeding completed successfully!');
      console.log(`Final counts:`);
      console.log(`- Users: ${users.length} (${serviceProviders.length} providers)`);
      console.log(`- Bookings: ${bookings.length}`);
      console.log(`- Ratings: ${ratings.length}`);

    } catch (error) {
      console.error('Error during database seeding:', error);
      throw error;
    }
  }

  // Get seeding statistics
  getStats(): Record<string, number> {
    const stats = {
      users: this.db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number },
      clients: this.db.prepare('SELECT COUNT(*) as count FROM users WHERE user_type = "client"').get() as { count: number },
      providers: this.db.prepare('SELECT COUNT(*) as count FROM users WHERE user_type = "provider"').get() as { count: number },
      service_providers: this.db.prepare('SELECT COUNT(*) as count FROM service_providers').get() as { count: number },
      bookings: this.db.prepare('SELECT COUNT(*) as count FROM bookings').get() as { count: number },
      ratings: this.db.prepare('SELECT COUNT(*) as count FROM ratings').get() as { count: number }
    };

    return {
      users: stats.users.count,
      clients: stats.clients.count,
      providers: stats.providers.count,
      service_providers: stats.service_providers.count,
      bookings: stats.bookings.count,
      ratings: stats.ratings.count
    };
  }
}

// Convenience function to seed database with default options
export function seedDatabase(options?: MockDataOptions): void {
  const seeder = new DatabaseSeeder();
  seeder.seedAll(options);
}

// Function to get current database statistics
export function getDatabaseStats(): Record<string, number> {
  const seeder = new DatabaseSeeder();
  return seeder.getStats();
}