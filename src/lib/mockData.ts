import { 
  UserProfile, 
  ServiceProvider, 
  Booking, 
  Rating, 
  SERVICE_TYPES, 
  PRICE_RANGES,
  ServiceType,
  PriceRange 
} from '../types/database';

// Kenyan names and context data
export const KENYAN_NAMES = {
  male: [
    'John Mwangi', 'Peter Kiprotich', 'David Ochieng', 'Samuel Kiplagat',
    'James Kamau', 'Michael Wanjiku', 'Daniel Mutua', 'Joseph Kinyua',
    'Francis Njoroge', 'Paul Macharia', 'Simon Karanja', 'Anthony Mbugua',
    'Robert Kimani', 'Charles Gitonga', 'Stephen Maina', 'Patrick Waweru',
    'George Ndung\'u', 'Emmanuel Kibet', 'Vincent Otieno', 'Moses Cheruiyot'
  ],
  female: [
    'Aisha Njeri', 'Grace Wanjiku', 'Mary Wambui', 'Faith Nyokabi',
    'Sarah Muthoni', 'Jane Wairimu', 'Lucy Wangari', 'Catherine Njambi',
    'Margaret Wanjiru', 'Rose Nyawira', 'Agnes Mwikali', 'Joyce Kemunto',
    'Elizabeth Wanjala', 'Susan Chebet', 'Helen Akinyi', 'Esther Wangui',
    'Rebecca Moraa', 'Lydia Njoki', 'Ruth Chepkemoi', 'Priscilla Wanjugu'
  ]
};

export const KENYAN_LOCATIONS = [
  // Nairobi areas
  'Nairobi CBD', 'Westlands', 'Karen', 'Kilimani', 'Lavington',
  'Kileleshwa', 'Parklands', 'Eastleigh', 'South B', 'South C',
  'Kasarani', 'Roysambu', 'Thika Road', 'Ngong Road', 'Lang\'ata',
  
  // Other major cities and towns
  'Kiambu', 'Thika', 'Ruiru', 'Kikuyu', 'Limuru',
  'Mombasa Island', 'Nyali', 'Bamburi', 'Likoni', 'Changamwe',
  'Kisumu', 'Nakuru', 'Eldoret', 'Meru', 'Nyeri',
  'Machakos', 'Kitui', 'Garissa', 'Malindi', 'Lamu'
];

export const BUSINESS_NAMES = [
  'Reliable Home Services', 'Quick Fix Solutions', 'Professional Cleaners Kenya',
  'Maji Safi Plumbing', 'Umeme Power Services', 'Fundi Bora Repairs',
  'Clean House Kenya', 'Harambee Home Care', 'Skilled Hands Services',
  'Tumaini Technical Services', 'Upendo Cleaning Co.', 'Jua Kali Experts',
  'Bora Bora Services', 'Mambo Poa Repairs', 'Safi Sana Cleaning',
  'Poa Poa Plumbing', 'Hakuna Matata Fixes', 'Karibu Home Services'
];

export const KENYAN_PHONE_PREFIXES = [
  '+254701', '+254702', '+254703', '+254704', '+254705',
  '+254706', '+254707', '+254708', '+254709', '+254710',
  '+254711', '+254712', '+254713', '+254714', '+254715',
  '+254720', '+254721', '+254722', '+254723', '+254724',
  '+254725', '+254726', '+254727', '+254728', '+254729'
];

// Utility functions for random generation
function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function getRandomElements<T>(array: T[], count: number): T[] {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

function generateId(): string {
  return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
}

function generateKenyanPhoneNumber(): string {
  const prefix = getRandomElement(KENYAN_PHONE_PREFIXES);
  const suffix = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
  return `${prefix}${suffix}`;
}

function generateEmail(name: string): string {
  const cleanName = name.toLowerCase().replace(/[^a-z\s]/g, '').replace(/\s+/g, '.');
  const domains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com'];
  return `${cleanName}@${getRandomElement(domains)}`;
}

function getRandomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function getRandomFutureDate(daysFromNow: number = 30): Date {
  const now = new Date();
  const future = new Date(now.getTime() + daysFromNow * 24 * 60 * 60 * 1000);
  return getRandomDate(now, future);
}

function getRandomPastDate(daysAgo: number = 90): Date {
  const now = new Date();
  const past = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
  return getRandomDate(past, now);
}

// Mock data generators
export function generateMockUsers(count: number): UserProfile[] {
  const users: UserProfile[] = [];
  
  for (let i = 0; i < count; i++) {
    const isProvider = Math.random() < 0.3; // 30% providers, 70% clients
    const isMale = Math.random() < 0.6; // 60% male, 40% female
    const name = getRandomElement(isMale ? KENYAN_NAMES.male : KENYAN_NAMES.female);
    
    const user: UserProfile = {
      id: generateId(),
      civic_auth_id: Math.random() < 0.7 ? `civic_${generateId()}` : undefined,
      email: generateEmail(name),
      full_name: name,
      phone_number: generateKenyanPhoneNumber(),
      location: getRandomElement(KENYAN_LOCATIONS),
      user_type: isProvider ? 'provider' : 'client',
      avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name.replace(/\s+/g, '')}`,
      created_at: getRandomPastDate(180).toISOString(),
      updated_at: getRandomPastDate(30).toISOString()
    };
    
    users.push(user);
  }
  
  return users;
}

export function generateMockServiceProviders(users: UserProfile[]): ServiceProvider[] {
  const providers = users.filter(user => user.user_type === 'provider');
  const serviceProviders: ServiceProvider[] = [];
  
  for (const user of providers) {
    const servicesCount = Math.floor(Math.random() * 3) + 1; // 1-3 services
    const services = getRandomElements(SERVICE_TYPES as unknown as ServiceType[], servicesCount);
    const certificationsCount = Math.floor(Math.random() * 3); // 0-2 certifications
    const certifications = certificationsCount > 0 ? 
      getRandomElements([
        'NITA Certification', 'KASNEB Diploma', 'Technical Training Certificate',
        'Safety Training Certificate', 'First Aid Certificate'
      ], certificationsCount) : [];
    
    const provider: ServiceProvider = {
      id: generateId(),
      user_id: user.id,
      business_name: Math.random() < 0.7 ? getRandomElement(BUSINESS_NAMES) : undefined,
      services_offered: services,
      price_range: getRandomElement(PRICE_RANGES as unknown as PriceRange[]),
      description: generateProviderDescription(services),
      availability: Math.random() < 0.8, // 80% available
      average_rating: Math.round((Math.random() * 2 + 3) * 10) / 10, // 3.0-5.0 rating
      total_ratings: Math.floor(Math.random() * 50) + 5, // 5-54 ratings
      years_experience: Math.floor(Math.random() * 15) + 1, // 1-15 years
      certifications: certifications.length > 0 ? certifications : undefined,
      created_at: user.created_at,
      updated_at: user.updated_at
    };
    
    serviceProviders.push(provider);
  }
  
  return serviceProviders;
}

function generateProviderDescription(services: ServiceType[]): string {
  const descriptions = {
    'Plumbing': 'Professional plumbing services including pipe repairs, installations, and emergency fixes.',
    'Electrical Work': 'Licensed electrician providing safe and reliable electrical installations and repairs.',
    'House Cleaning': 'Thorough house cleaning services with eco-friendly products and attention to detail.',
    'Carpentry': 'Skilled carpenter offering custom furniture, repairs, and home improvement projects.',
    'Painting': 'Professional painting services for interior and exterior walls with quality materials.',
    'Gardening': 'Complete gardening services including landscaping, maintenance, and plant care.',
    'Appliance Repair': 'Expert repair services for all household appliances with genuine spare parts.',
    'Upholstery Cleaning': 'Specialized cleaning for furniture, carpets, and upholstery using modern equipment.',
    'Roofing': 'Professional roofing services including repairs, installations, and waterproofing.',
    'Tiling': 'Expert tiling services for floors, walls, and bathrooms with precision and quality.',
    'Security Installation': 'Professional security system installation and maintenance services.',
    'Pest Control': 'Safe and effective pest control solutions for homes and offices.'
  };
  
  const mainService = services[0];
  let description = descriptions[mainService] || 'Professional home services with quality guarantee.';
  
  if (services.length > 1) {
    description += ` Also offering ${services.slice(1).join(' and ').toLowerCase()} services.`;
  }
  
  description += ' Licensed, insured, and committed to customer satisfaction.';
  
  return description;
}

export function generateMockBookings(users: UserProfile[], providers: ServiceProvider[], count: number): Booking[] {
  const clients = users.filter(user => user.user_type === 'client');
  const bookings: Booking[] = [];
  
  for (let i = 0; i < count; i++) {
    const client = getRandomElement(clients);
    const provider = getRandomElement(providers);
    const providerUser = users.find(u => u.id === provider.user_id);
    
    if (!providerUser) continue;
    
    const serviceType = getRandomElement(provider.services_offered);
    const isCompleted = Math.random() < 0.6; // 60% completed bookings
    const scheduledDate = isCompleted ? getRandomPastDate(60) : getRandomFutureDate(30);
    
    const booking: Booking = {
      id: generateId(),
      client_id: client.id,
      provider_id: providerUser.id,
      service_type: serviceType,
      scheduled_date: scheduledDate.toISOString().split('T')[0],
      scheduled_time: generateRandomTime(),
      status: isCompleted ? 'completed' : getRandomElement(['pending', 'confirmed', 'in_progress']),
      total_amount: generateServicePrice(provider.price_range),
      payment_method: getRandomElement(['mpesa', 'cash']),
      payment_status: isCompleted ? 'completed' : getRandomElement(['pending', 'completed']),
      notes: Math.random() < 0.3 ? generateBookingNotes() : undefined,
      created_at: getRandomPastDate(90).toISOString(),
      updated_at: getRandomPastDate(7).toISOString()
    };
    
    bookings.push(booking);
  }
  
  return bookings;
}

function generateRandomTime(): string {
  const hours = Math.floor(Math.random() * 10) + 8; // 8 AM to 5 PM
  const minutes = Math.random() < 0.5 ? '00' : '30';
  return `${hours.toString().padStart(2, '0')}:${minutes}`;
}

function generateServicePrice(priceRange: string): number {
  const ranges = {
    'KSH 500-1,000': [500, 1000],
    'KSH 1,000-2,500': [1000, 2500],
    'KSH 2,500-5,000': [2500, 5000],
    'KSH 5,000-10,000': [5000, 10000],
    'KSH 10,000+': [10000, 25000]
  };
  
  const range = ranges[priceRange as keyof typeof ranges] || [1000, 5000];
  return Math.floor(Math.random() * (range[1] - range[0]) + range[0]);
}

function generateBookingNotes(): string {
  const notes = [
    'Please call before arriving',
    'Gate code: 1234',
    'Parking available in compound',
    'Bring all necessary tools',
    'Emergency repair needed',
    'Flexible with timing',
    'Cash payment preferred',
    'Second floor apartment'
  ];
  
  return getRandomElement(notes);
}

export function generateMockRatings(bookings: Booking[], count: number): Rating[] {
  const completedBookings = bookings.filter(booking => booking.status === 'completed');
  const ratings: Rating[] = [];
  
  // Ensure we don't generate more ratings than completed bookings
  const ratingsToGenerate = Math.min(count, completedBookings.length);
  const selectedBookings = getRandomElements(completedBookings, ratingsToGenerate);
  
  for (const booking of selectedBookings) {
    const rating: Rating = {
      id: generateId(),
      booking_id: booking.id,
      provider_id: booking.provider_id,
      client_id: booking.client_id,
      rating: Math.floor(Math.random() * 2) + 4, // 4-5 stars (mostly positive)
      feedback: Math.random() < 0.7 ? generateRatingFeedback() : undefined,
      created_at: new Date(booking.updated_at).toISOString()
    };
    
    ratings.push(rating);
  }
  
  return ratings;
}

function generateRatingFeedback(): string {
  const feedbacks = [
    'Excellent service! Very professional and punctual.',
    'Great work, highly recommended.',
    'Good service, will book again.',
    'Professional and efficient. Thank you!',
    'Outstanding work quality.',
    'Very satisfied with the service.',
    'Prompt and reliable service.',
    'Exceeded my expectations.',
    'Fair pricing and good work.',
    'Will definitely use again.',
    'Clean work and professional attitude.',
    'Solved the problem quickly.',
    'Very knowledgeable and helpful.',
    'Excellent customer service.',
    'High quality work, very pleased.'
  ];
  
  return getRandomElement(feedbacks);
}