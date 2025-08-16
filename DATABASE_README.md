# Database Infrastructure Setup

This document describes the local SQLite database infrastructure and mock data foundation for the Civic Auth Marketplace.

## Overview

The application uses a local SQLite database for development and testing, populated with comprehensive mock data representing a Kenyan house repair and cleaning services marketplace.

## Database Schema

### Tables

1. **users** - User profiles for both clients and service providers
2. **service_providers** - Extended profiles for service providers
3. **bookings** - Service booking records
4. **ratings** - Customer ratings and feedback
5. **migrations** - Database migration tracking

### Key Features

- Foreign key constraints for data integrity
- Indexes for optimal query performance
- JSON fields for flexible data storage (services, certifications)
- Kenyan context in all mock data (names, locations, phone numbers)

## Setup Instructions

### 1. Install Dependencies

```bash
npm install better-sqlite3 @types/better-sqlite3
```

### 2. Initialize Database

```bash
npm run init-db
```

This creates the database file at `data/marketplace.db` with the complete schema.

### 3. Seed with Mock Data

```bash
npm run seed-db
```

This populates the database with:
- 50 users (36 clients, 14 providers)
- 14 service provider profiles
- 100 bookings (mix of completed and pending)
- 59 ratings and reviews

### 4. Test Database

```bash
npm run test-db
```

Verifies database connectivity and displays current statistics.

## Mock Data Context

### Kenyan Names
- Male: John Mwangi, Peter Kiprotich, David Ochieng, etc.
- Female: Aisha Njeri, Grace Wanjiku, Mary Wambui, etc.

### Locations
- Nairobi areas: CBD, Westlands, Karen, Kilimani, etc.
- Other cities: Mombasa, Kisumu, Nakuru, Eldoret, etc.

### Services
- Plumbing, Electrical Work, House Cleaning
- Carpentry, Painting, Gardening
- Appliance Repair, Upholstery Cleaning

### Business Names
- Reliable Home Services, Maji Safi Plumbing
- Professional Cleaners Kenya, Fundi Bora Repairs
- Harambee Home Care, Skilled Hands Services

### Phone Numbers
- Kenyan format: +254701xxxxxx, +254720xxxxxx, etc.
- Realistic prefixes for major networks

## File Structure

```
src/
├── lib/
│   ├── database.ts          # Database connection and schema
│   ├── mockData.ts          # Mock data generators
│   ├── seedDatabase.ts      # Database seeding functions
│   └── initDatabase.ts      # Database initialization
├── services/
│   └── databaseService.ts   # CRUD operations service layer
├── types/
│   └── database.ts          # TypeScript interfaces
├── hooks/
│   └── useDatabase.ts       # React hooks for database
└── components/
    └── DatabaseStatus.tsx   # Database status component

scripts/
├── initDb.js               # Database initialization script
├── seedDb.js              # Database seeding script
└── testDb.js              # Database testing script

data/
└── marketplace.db         # SQLite database file
```

## Usage in React Components

### Database Service

```typescript
import { databaseService } from '@/services/databaseService';

// Get service providers
const result = await databaseService.getServiceProviders(10, 0);
if (result.success) {
  console.log(result.data);
}

// Create booking
const booking = await databaseService.createBooking({
  id: generateId(),
  client_id: 'client_id',
  provider_id: 'provider_id',
  service_type: 'Plumbing',
  scheduled_date: '2024-08-20',
  scheduled_time: '10:00',
  status: 'pending',
  payment_status: 'pending'
});
```

### React Hooks

```typescript
import { useDatabase } from '@/hooks/useDatabase';

function MyComponent() {
  const { isInitialized, stats, error } = useDatabase();
  
  if (!isInitialized) {
    return <div>Loading database...</div>;
  }
  
  return <div>Users: {stats.users}</div>;
}
```

## Database Operations

### Available Scripts

- `npm run init-db` - Initialize empty database with schema
- `npm run seed-db` - Populate database with mock data
- `npm run test-db` - Test database connectivity and show stats

### Manual Operations

```javascript
// Connect to database
import Database from 'better-sqlite3';
const db = new Database('data/marketplace.db');

// Query data
const users = db.prepare('SELECT * FROM users LIMIT 10').all();
const providers = db.prepare(`
  SELECT u.full_name, sp.business_name, sp.services_offered 
  FROM service_providers sp 
  JOIN users u ON sp.user_id = u.id
`).all();

// Close connection
db.close();
```

## Data Relationships

```
users (1) ←→ (1) service_providers
users (1) ←→ (many) bookings (as client)
users (1) ←→ (many) bookings (as provider)
bookings (1) ←→ (0..1) ratings
users (1) ←→ (many) ratings (as provider)
users (1) ←→ (many) ratings (as client)
```

## Performance Considerations

- Indexes on frequently queried columns
- JSON fields for flexible data without additional tables
- Transaction-based bulk operations for seeding
- Connection pooling through singleton pattern

## Development Notes

- Database file is gitignored but can be recreated anytime
- Mock data is deterministic for consistent testing
- All timestamps use ISO 8601 format
- Phone numbers follow Kenyan mobile format
- Ratings are skewed positive (4-5 stars) for realistic marketplace feel

## Next Steps

This database infrastructure supports:
- User authentication and role management
- Service provider browsing and filtering
- Booking creation and management
- Rating and feedback system
- Real-time data updates simulation

The foundation is ready for implementing the remaining marketplace features in subsequent tasks.