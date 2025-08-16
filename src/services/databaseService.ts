import { getDatabase } from '../lib/database';
import { 
  UserProfile, 
  ServiceProvider, 
  ServiceProviderWithUser,
  Booking, 
  BookingWithDetails,
  Rating, 
  RatingWithDetails,
  DatabaseResult 
} from '../types/database';

export class DatabaseService {
  private db = getDatabase();

  // User operations
  async createUser(user: Omit<UserProfile, 'created_at' | 'updated_at'>): Promise<DatabaseResult<UserProfile>> {
    try {
      const now = new Date().toISOString();
      const userWithTimestamps = {
        ...user,
        created_at: now,
        updated_at: now
      };

      const stmt = this.db.prepare(`
        INSERT INTO users (
          id, civic_auth_id, email, full_name, phone_number,
          location, user_type, avatar_url, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      stmt.run(
        userWithTimestamps.id,
        userWithTimestamps.civic_auth_id || null,
        userWithTimestamps.email || null,
        userWithTimestamps.full_name,
        userWithTimestamps.phone_number,
        userWithTimestamps.location,
        userWithTimestamps.user_type,
        userWithTimestamps.avatar_url || null,
        userWithTimestamps.created_at,
        userWithTimestamps.updated_at
      );

      return { success: true, data: userWithTimestamps };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to create user' 
      };
    }
  }

  async getUserById(id: string): Promise<DatabaseResult<UserProfile>> {
    try {
      const user = this.db.prepare('SELECT * FROM users WHERE id = ?').get(id) as UserProfile | undefined;
      
      if (!user) {
        return { success: false, error: 'User not found' };
      }

      return { success: true, data: user };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to get user' 
      };
    }
  }

  async getUserByCivicAuthId(civicAuthId: string): Promise<DatabaseResult<UserProfile>> {
    try {
      const user = this.db.prepare('SELECT * FROM users WHERE civic_auth_id = ?').get(civicAuthId) as UserProfile | undefined;
      
      if (!user) {
        return { success: false, error: 'User not found' };
      }

      return { success: true, data: user };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to get user' 
      };
    }
  }

  async getUserByEmail(email: string): Promise<DatabaseResult<UserProfile>> {
    try {
      const user = this.db.prepare('SELECT * FROM users WHERE email = ?').get(email) as UserProfile | undefined;
      
      if (!user) {
        return { success: false, error: 'User not found' };
      }

      return { success: true, data: user };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to get user' 
      };
    }
  }

  // Service Provider operations
  async getServiceProviders(limit?: number, offset?: number): Promise<DatabaseResult<ServiceProviderWithUser[]>> {
    try {
      let query = `
        SELECT 
          sp.*,
          u.id as user_id,
          u.civic_auth_id,
          u.email,
          u.full_name,
          u.phone_number,
          u.location,
          u.user_type,
          u.avatar_url,
          u.created_at as user_created_at,
          u.updated_at as user_updated_at
        FROM service_providers sp
        JOIN users u ON sp.user_id = u.id
        WHERE sp.availability = 1
        ORDER BY sp.average_rating DESC, sp.total_ratings DESC
      `;

      if (limit) {
        query += ` LIMIT ${limit}`;
        if (offset) {
          query += ` OFFSET ${offset}`;
        }
      }

      const rows = this.db.prepare(query).all() as any[];
      
      const providers: ServiceProviderWithUser[] = rows.map(row => ({
        id: row.id,
        user_id: row.user_id,
        business_name: row.business_name,
        services_offered: JSON.parse(row.services_offered || '[]'),
        price_range: row.price_range,
        description: row.description,
        availability: Boolean(row.availability),
        average_rating: row.average_rating,
        total_ratings: row.total_ratings,
        years_experience: row.years_experience,
        certifications: row.certifications ? JSON.parse(row.certifications) : undefined,
        created_at: row.created_at,
        updated_at: row.updated_at,
        user: {
          id: row.user_id,
          civic_auth_id: row.civic_auth_id,
          email: row.email,
          full_name: row.full_name,
          phone_number: row.phone_number,
          location: row.location,
          user_type: row.user_type,
          avatar_url: row.avatar_url,
          created_at: row.user_created_at,
          updated_at: row.user_updated_at
        }
      }));

      return { success: true, data: providers };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to get service providers' 
      };
    }
  }

  async getServiceProviderByUserId(userId: string): Promise<DatabaseResult<ServiceProviderWithUser>> {
    try {
      const row = this.db.prepare(`
        SELECT 
          sp.*,
          u.id as user_id,
          u.civic_auth_id,
          u.email,
          u.full_name,
          u.phone_number,
          u.location,
          u.user_type,
          u.avatar_url,
          u.created_at as user_created_at,
          u.updated_at as user_updated_at
        FROM service_providers sp
        JOIN users u ON sp.user_id = u.id
        WHERE sp.user_id = ?
      `).get(userId) as any;

      if (!row) {
        return { success: false, error: 'Service provider not found' };
      }

      const provider: ServiceProviderWithUser = {
        id: row.id,
        user_id: row.user_id,
        business_name: row.business_name,
        services_offered: JSON.parse(row.services_offered || '[]'),
        price_range: row.price_range,
        description: row.description,
        availability: Boolean(row.availability),
        average_rating: row.average_rating,
        total_ratings: row.total_ratings,
        years_experience: row.years_experience,
        certifications: row.certifications ? JSON.parse(row.certifications) : undefined,
        created_at: row.created_at,
        updated_at: row.updated_at,
        user: {
          id: row.user_id,
          civic_auth_id: row.civic_auth_id,
          email: row.email,
          full_name: row.full_name,
          phone_number: row.phone_number,
          location: row.location,
          user_type: row.user_type,
          avatar_url: row.avatar_url,
          created_at: row.user_created_at,
          updated_at: row.user_updated_at
        }
      };

      return { success: true, data: provider };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to get service provider' 
      };
    }
  }

  // Booking operations
  async createBooking(booking: Omit<Booking, 'created_at' | 'updated_at'>): Promise<DatabaseResult<Booking>> {
    try {
      const now = new Date().toISOString();
      const bookingWithTimestamps = {
        ...booking,
        created_at: now,
        updated_at: now
      };

      const stmt = this.db.prepare(`
        INSERT INTO bookings (
          id, client_id, provider_id, service_type, scheduled_date,
          scheduled_time, status, total_amount, payment_method,
          payment_status, notes, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      stmt.run(
        bookingWithTimestamps.id,
        bookingWithTimestamps.client_id,
        bookingWithTimestamps.provider_id,
        bookingWithTimestamps.service_type,
        bookingWithTimestamps.scheduled_date,
        bookingWithTimestamps.scheduled_time,
        bookingWithTimestamps.status,
        bookingWithTimestamps.total_amount || null,
        bookingWithTimestamps.payment_method || null,
        bookingWithTimestamps.payment_status,
        bookingWithTimestamps.notes || null,
        bookingWithTimestamps.created_at,
        bookingWithTimestamps.updated_at
      );

      return { success: true, data: bookingWithTimestamps };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to create booking' 
      };
    }
  }

  async getBookingsByClientId(clientId: string): Promise<DatabaseResult<BookingWithDetails[]>> {
    try {
      const rows = this.db.prepare(`
        SELECT 
          b.*,
          c.full_name as client_name,
          c.phone_number as client_phone,
          c.location as client_location,
          p.full_name as provider_name,
          p.phone_number as provider_phone,
          p.location as provider_location,
          sp.business_name,
          sp.average_rating
        FROM bookings b
        JOIN users c ON b.client_id = c.id
        JOIN users p ON b.provider_id = p.id
        LEFT JOIN service_providers sp ON sp.user_id = p.id
        WHERE b.client_id = ?
        ORDER BY b.scheduled_date DESC, b.scheduled_time DESC
      `).all(clientId) as any[];

      const bookings: BookingWithDetails[] = rows.map(row => ({
        id: row.id,
        client_id: row.client_id,
        provider_id: row.provider_id,
        service_type: row.service_type,
        scheduled_date: row.scheduled_date,
        scheduled_time: row.scheduled_time,
        status: row.status,
        total_amount: row.total_amount,
        payment_method: row.payment_method,
        payment_status: row.payment_status,
        notes: row.notes,
        created_at: row.created_at,
        updated_at: row.updated_at,
        client: {
          id: row.client_id,
          full_name: row.client_name,
          phone_number: row.client_phone,
          location: row.client_location,
          user_type: 'client'
        } as UserProfile,
        provider: {
          id: row.provider_id,
          full_name: row.provider_name,
          phone_number: row.provider_phone,
          location: row.provider_location,
          user_type: 'provider'
        } as UserProfile,
        provider_details: row.business_name ? {
          business_name: row.business_name,
          average_rating: row.average_rating
        } as Partial<ServiceProvider> : undefined
      }));

      return { success: true, data: bookings };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to get bookings' 
      };
    }
  }

  async getBookingsByProviderId(providerId: string): Promise<DatabaseResult<BookingWithDetails[]>> {
    try {
      const rows = this.db.prepare(`
        SELECT 
          b.*,
          c.full_name as client_name,
          c.phone_number as client_phone,
          c.location as client_location,
          p.full_name as provider_name,
          p.phone_number as provider_phone,
          p.location as provider_location
        FROM bookings b
        JOIN users c ON b.client_id = c.id
        JOIN users p ON b.provider_id = p.id
        WHERE b.provider_id = ?
        ORDER BY b.scheduled_date DESC, b.scheduled_time DESC
      `).all(providerId) as any[];

      const bookings: BookingWithDetails[] = rows.map(row => ({
        id: row.id,
        client_id: row.client_id,
        provider_id: row.provider_id,
        service_type: row.service_type,
        scheduled_date: row.scheduled_date,
        scheduled_time: row.scheduled_time,
        status: row.status,
        total_amount: row.total_amount,
        payment_method: row.payment_method,
        payment_status: row.payment_status,
        notes: row.notes,
        created_at: row.created_at,
        updated_at: row.updated_at,
        client: {
          id: row.client_id,
          full_name: row.client_name,
          phone_number: row.client_phone,
          location: row.client_location,
          user_type: 'client'
        } as UserProfile,
        provider: {
          id: row.provider_id,
          full_name: row.provider_name,
          phone_number: row.provider_phone,
          location: row.provider_location,
          user_type: 'provider'
        } as UserProfile
      }));

      return { success: true, data: bookings };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to get bookings' 
      };
    }
  }

  // Rating operations
  async createRating(rating: Omit<Rating, 'created_at'>): Promise<DatabaseResult<Rating>> {
    try {
      const ratingWithTimestamp = {
        ...rating,
        created_at: new Date().toISOString()
      };

      const stmt = this.db.prepare(`
        INSERT INTO ratings (
          id, booking_id, provider_id, client_id, rating, feedback, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `);

      stmt.run(
        ratingWithTimestamp.id,
        ratingWithTimestamp.booking_id,
        ratingWithTimestamp.provider_id,
        ratingWithTimestamp.client_id,
        ratingWithTimestamp.rating,
        ratingWithTimestamp.feedback || null,
        ratingWithTimestamp.created_at
      );

      // Update provider's average rating
      await this.updateProviderRating(rating.provider_id);

      return { success: true, data: ratingWithTimestamp };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to create rating' 
      };
    }
  }

  async getRatingsByProviderId(providerId: string): Promise<DatabaseResult<RatingWithDetails[]>> {
    try {
      const rows = this.db.prepare(`
        SELECT 
          r.*,
          u.full_name as client_name,
          u.avatar_url as client_avatar,
          b.service_type,
          b.scheduled_date
        FROM ratings r
        JOIN users u ON r.client_id = u.id
        JOIN bookings b ON r.booking_id = b.id
        WHERE r.provider_id = ?
        ORDER BY r.created_at DESC
      `).all(providerId) as any[];

      const ratings: RatingWithDetails[] = rows.map(row => ({
        id: row.id,
        booking_id: row.booking_id,
        provider_id: row.provider_id,
        client_id: row.client_id,
        rating: row.rating,
        feedback: row.feedback,
        created_at: row.created_at,
        client: {
          id: row.client_id,
          full_name: row.client_name,
          avatar_url: row.client_avatar,
          user_type: 'client'
        } as UserProfile,
        booking: {
          id: row.booking_id,
          service_type: row.service_type,
          scheduled_date: row.scheduled_date
        } as Booking
      }));

      return { success: true, data: ratings };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to get ratings' 
      };
    }
  }

  private async updateProviderRating(providerId: string): Promise<void> {
    const stats = this.db.prepare(`
      SELECT AVG(rating) as avg_rating, COUNT(*) as total_count
      FROM ratings 
      WHERE provider_id = ?
    `).get(providerId) as { avg_rating: number; total_count: number };

    if (stats.total_count > 0) {
      this.db.prepare(`
        UPDATE service_providers 
        SET average_rating = ?, total_ratings = ?, updated_at = ?
        WHERE user_id = ?
      `).run(
        Math.round(stats.avg_rating * 10) / 10,
        stats.total_count,
        new Date().toISOString(),
        providerId
      );
    }
  }
}

// Export singleton instance
export const databaseService = new DatabaseService();