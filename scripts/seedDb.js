#!/usr/bin/env node

import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'data', 'marketplace.db');
console.log('Seeding database at:', dbPath);

const db = new Database(dbPath);

// Kenyan context data
const KENYAN_NAMES = {
  male: [
    'John Mwangi', 'Peter Kiprotich', 'David Ochieng', 'Samuel Kiplagat',
    'James Kamau', 'Michael Wanjiku', 'Daniel Mutua', 'Joseph Kinyua',
    'Francis Njoroge', 'Paul Macharia', 'Simon Karanja', 'Anthony Mbugua',
    'Robert Kimani', 'Charles Gitonga', 'Stephen Maina', 'Patrick Waweru'
  ],
  female: [
    'Aisha Njeri', 'Grace Wanjiku', 'Mary Wambui', 'Faith Nyokabi',
    'Sarah Muthoni', 'Jane Wairimu', 'Lucy Wangari', 'Catherine Njambi',
    'Margaret Wanjiru', 'Rose Nyawira', 'Agnes Mwikali', 'Joyce Kemunto'
  ]
};

const KENYAN_LOCATIONS = [
  'Nairobi CBD', 'Westlands', 'Karen', 'Kilimani', 'Lavington',
  'Kileleshwa', 'Parklands', 'Eastleigh', 'South B', 'South C',
  'Kasarani', 'Roysambu', 'Kiambu', 'Thika', 'Ruiru',
  'Mombasa Island', 'Nyali', 'Bamburi', 'Kisumu', 'Nakuru'
];

const SERVICE_TYPES = [
  'Plumbing', 'Electrical Work', 'House Cleaning', 'Carpentry',
  'Painting', 'Gardening', 'Appliance Repair', 'Upholstery Cleaning'
];

const PRICE_RANGES = [
  'KSH 500-1,000', 'KSH 1,000-2,500', 'KSH 2,500-5,000', 
  'KSH 5,000-10,000', 'KSH 10,000+'
];

const BUSINESS_NAMES = [
  'Reliable Home Services', 'Quick Fix Solutions', 'Professional Cleaners Kenya',
  'Maji Safi Plumbing', 'Umeme Power Services', 'Fundi Bora Repairs',
  'Clean House Kenya', 'Harambee Home Care', 'Skilled Hands Services'
];

// Utility functions
function getRandomElement(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function getRandomElements(array, count) {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

function generateId() {
  return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
}

function generateKenyanPhoneNumber() {
  const prefixes = ['+254701', '+254702', '+254720', '+254721', '+254722'];
  const prefix = getRandomElement(prefixes);
  const suffix = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
  return `${prefix}${suffix}`;
}

function generateEmail(name) {
  const cleanName = name.toLowerCase().replace(/[^a-z\s]/g, '').replace(/\s+/g, '.');
  const domains = ['gmail.com', 'yahoo.com', 'hotmail.com'];
  return `${cleanName}@${getRandomElement(domains)}`;
}

function getRandomPastDate(daysAgo = 90) {
  const now = new Date();
  const past = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
  return new Date(past.getTime() + Math.random() * (now.getTime() - past.getTime()));
}

function getRandomFutureDate(daysFromNow = 30) {
  const now = new Date();
  const future = new Date(now.getTime() + daysFromNow * 24 * 60 * 60 * 1000);
  return new Date(now.getTime() + Math.random() * (future.getTime() - now.getTime()));
}

// Clear existing data
console.log('Clearing existing data...');
db.prepare('DELETE FROM ratings').run();
db.prepare('DELETE FROM bookings').run();
db.prepare('DELETE FROM service_providers').run();
db.prepare('DELETE FROM users').run();

// Generate and insert users
console.log('Generating users...');
const users = [];
const userCount = 50;

for (let i = 0; i < userCount; i++) {
  const isProvider = Math.random() < 0.3; // 30% providers
  const isMale = Math.random() < 0.6;
  const name = getRandomElement(isMale ? KENYAN_NAMES.male : KENYAN_NAMES.female);
  
  const user = {
    id: generateId(),
    civic_auth_id: Math.random() < 0.7 ? `civic_${generateId()}` : null,
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

// Insert users
const insertUser = db.prepare(`
  INSERT INTO users (
    id, civic_auth_id, email, full_name, phone_number,
    location, user_type, avatar_url, created_at, updated_at
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const insertUsers = db.transaction((users) => {
  for (const user of users) {
    insertUser.run(
      user.id, user.civic_auth_id, user.email, user.full_name,
      user.phone_number, user.location, user.user_type,
      user.avatar_url, user.created_at, user.updated_at
    );
  }
});

insertUsers(users);
console.log(`Inserted ${users.length} users`);

// Generate and insert service providers
const providers = users.filter(user => user.user_type === 'provider');
console.log(`Generating ${providers.length} service providers...`);

const serviceProviders = [];
const insertProvider = db.prepare(`
  INSERT INTO service_providers (
    id, user_id, business_name, services_offered, price_range,
    description, availability, average_rating, total_ratings,
    years_experience, certifications, created_at, updated_at
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const insertProviders = db.transaction((providers) => {
  for (const user of providers) {
    const servicesCount = Math.floor(Math.random() * 3) + 1;
    const services = getRandomElements(SERVICE_TYPES, servicesCount);
    
    const provider = {
      id: generateId(),
      user_id: user.id,
      business_name: Math.random() < 0.7 ? getRandomElement(BUSINESS_NAMES) : null,
      services_offered: JSON.stringify(services),
      price_range: getRandomElement(PRICE_RANGES),
      description: `Professional ${services.join(' and ').toLowerCase()} services with quality guarantee.`,
      availability: Math.random() < 0.8 ? 1 : 0,
      average_rating: Math.round((Math.random() * 2 + 3) * 10) / 10,
      total_ratings: Math.floor(Math.random() * 50) + 5,
      years_experience: Math.floor(Math.random() * 15) + 1,
      certifications: null,
      created_at: user.created_at,
      updated_at: user.updated_at
    };
    
    serviceProviders.push(provider);
    
    insertProvider.run(
      provider.id, provider.user_id, provider.business_name,
      provider.services_offered, provider.price_range, provider.description,
      provider.availability, provider.average_rating, provider.total_ratings,
      provider.years_experience, provider.certifications,
      provider.created_at, provider.updated_at
    );
  }
});

insertProviders(providers);
console.log(`Inserted ${serviceProviders.length} service providers`);

// Generate and insert bookings
const clients = users.filter(user => user.user_type === 'client');
const bookingCount = 100;
console.log(`Generating ${bookingCount} bookings...`);

const bookings = [];
const insertBooking = db.prepare(`
  INSERT INTO bookings (
    id, client_id, provider_id, service_type, scheduled_date,
    scheduled_time, status, total_amount, payment_method,
    payment_status, notes, created_at, updated_at
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const insertBookings = db.transaction(() => {
  for (let i = 0; i < bookingCount; i++) {
    const client = getRandomElement(clients);
    const provider = getRandomElement(serviceProviders);
    const providerUser = users.find(u => u.id === provider.user_id);
    
    if (!providerUser) continue;
    
    const services = JSON.parse(provider.services_offered);
    const serviceType = getRandomElement(services);
    const isCompleted = Math.random() < 0.6;
    const scheduledDate = isCompleted ? getRandomPastDate(60) : getRandomFutureDate(30);
    
    const booking = {
      id: generateId(),
      client_id: client.id,
      provider_id: providerUser.id,
      service_type: serviceType,
      scheduled_date: scheduledDate.toISOString().split('T')[0],
      scheduled_time: `${Math.floor(Math.random() * 10) + 8}:00`,
      status: isCompleted ? 'completed' : getRandomElement(['pending', 'confirmed']),
      total_amount: Math.floor(Math.random() * 4000) + 1000,
      payment_method: getRandomElement(['mpesa', 'cash']),
      payment_status: isCompleted ? 'completed' : 'pending',
      notes: null,
      created_at: getRandomPastDate(90).toISOString(),
      updated_at: getRandomPastDate(7).toISOString()
    };
    
    bookings.push(booking);
    
    insertBooking.run(
      booking.id, booking.client_id, booking.provider_id,
      booking.service_type, booking.scheduled_date, booking.scheduled_time,
      booking.status, booking.total_amount, booking.payment_method,
      booking.payment_status, booking.notes, booking.created_at, booking.updated_at
    );
  }
});

insertBookings();
console.log(`Inserted ${bookings.length} bookings`);

// Generate and insert ratings
const completedBookings = bookings.filter(b => b.status === 'completed');
const ratingCount = Math.min(60, completedBookings.length);
console.log(`Generating ${ratingCount} ratings...`);

const insertRating = db.prepare(`
  INSERT INTO ratings (
    id, booking_id, provider_id, client_id, rating, feedback, created_at
  ) VALUES (?, ?, ?, ?, ?, ?, ?)
`);

const feedbacks = [
  'Excellent service! Very professional.',
  'Great work, highly recommended.',
  'Good service, will book again.',
  'Professional and efficient.',
  'Outstanding work quality.',
  'Very satisfied with the service.'
];

const insertRatings = db.transaction(() => {
  const selectedBookings = getRandomElements(completedBookings, ratingCount);
  
  for (const booking of selectedBookings) {
    const rating = {
      id: generateId(),
      booking_id: booking.id,
      provider_id: booking.provider_id,
      client_id: booking.client_id,
      rating: Math.floor(Math.random() * 2) + 4, // 4-5 stars
      feedback: Math.random() < 0.7 ? getRandomElement(feedbacks) : null,
      created_at: new Date(booking.updated_at).toISOString()
    };
    
    insertRating.run(
      rating.id, rating.booking_id, rating.provider_id,
      rating.client_id, rating.rating, rating.feedback, rating.created_at
    );
  }
});

insertRatings();
console.log(`Inserted ${ratingCount} ratings`);

// Update provider ratings based on actual ratings
console.log('Updating provider average ratings...');
const updateRating = db.prepare(`
  UPDATE service_providers 
  SET average_rating = ?, total_ratings = ?
  WHERE user_id = ?
`);

const ratingStats = db.prepare(`
  SELECT 
    provider_id,
    AVG(rating) as avg_rating,
    COUNT(*) as total_count
  FROM ratings 
  GROUP BY provider_id
`).all();

const updateRatings = db.transaction(() => {
  for (const stat of ratingStats) {
    updateRating.run(
      Math.round(stat.avg_rating * 10) / 10,
      stat.total_count,
      stat.provider_id
    );
  }
});

updateRatings();
console.log(`Updated ratings for ${ratingStats.length} providers`);

// Final statistics
console.log('\nSeeding completed! Final statistics:');
const finalStats = {
  users: db.prepare('SELECT COUNT(*) as count FROM users').get().count,
  providers: db.prepare('SELECT COUNT(*) as count FROM service_providers').get().count,
  bookings: db.prepare('SELECT COUNT(*) as count FROM bookings').get().count,
  ratings: db.prepare('SELECT COUNT(*) as count FROM ratings').get().count
};

console.log(`- Users: ${finalStats.users}`);
console.log(`- Service Providers: ${finalStats.providers}`);
console.log(`- Bookings: ${finalStats.bookings}`);
console.log(`- Ratings: ${finalStats.ratings}`);

db.close();
console.log('\nDatabase seeding completed successfully!');