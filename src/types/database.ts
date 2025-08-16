// User Profile Types
export interface UserProfile {
  id: string;
  civic_auth_id?: string;
  email?: string;
  full_name: string;
  phone_number: string;
  location: string;
  user_type: 'client' | 'provider';
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

// Service Provider Types
export interface ServiceProvider {
  id: string;
  user_id: string;
  business_name?: string;
  services_offered: string[]; // Will be stored as JSON string
  price_range: string;
  description: string;
  availability: boolean;
  average_rating: number;
  total_ratings: number;
  years_experience?: number;
  certifications?: string[]; // Will be stored as JSON string
  created_at: string;
  updated_at: string;
}

// Combined Service Provider with User Info
export interface ServiceProviderWithUser extends ServiceProvider {
  user: UserProfile;
}

// Booking Types
export type BookingStatus = 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
export type PaymentMethod = 'mpesa' | 'cash';
export type PaymentStatus = 'pending' | 'completed' | 'failed';

export interface Booking {
  id: string;
  client_id: string;
  provider_id: string;
  service_type: string;
  scheduled_date: string; // ISO date string
  scheduled_time: string; // HH:MM format
  status: BookingStatus;
  total_amount?: number;
  payment_method?: PaymentMethod;
  payment_status: PaymentStatus;
  notes?: string;
  created_at: string;
  updated_at: string;
}

// Booking with related data
export interface BookingWithDetails extends Booking {
  client: UserProfile;
  provider: UserProfile;
  provider_details?: ServiceProvider;
}

// Rating Types
export interface Rating {
  id: string;
  booking_id: string;
  provider_id: string;
  client_id: string;
  rating: number; // 1-5
  feedback?: string;
  created_at: string;
}

// Rating with related data
export interface RatingWithDetails extends Rating {
  client: UserProfile;
  booking: Booking;
}

// Database operation result types
export interface DatabaseResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Mock data generation types
export interface MockDataOptions {
  userCount?: number;
  providerCount?: number;
  bookingCount?: number;
  ratingCount?: number;
}

// Service types available in the marketplace
export const SERVICE_TYPES = [
  'Plumbing',
  'Electrical Work', 
  'House Cleaning',
  'Carpentry',
  'Painting',
  'Gardening',
  'Appliance Repair',
  'Upholstery Cleaning',
  'Roofing',
  'Tiling',
  'Security Installation',
  'Pest Control'
] as const;

export type ServiceType = typeof SERVICE_TYPES[number];

// Price ranges
export const PRICE_RANGES = [
  'KSH 500-1,000',
  'KSH 1,000-2,500', 
  'KSH 2,500-5,000',
  'KSH 5,000-10,000',
  'KSH 10,000+'
] as const;

export type PriceRange = typeof PRICE_RANGES[number];