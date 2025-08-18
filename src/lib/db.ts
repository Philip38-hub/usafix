import { openDB, DBSchema, IDBPDatabase } from 'idb';

// Define the database schema
interface MarketplaceDB extends DBSchema {
  service_providers: {
    key: string;
    value: {
      id: string;
      user_id: string;
      business_name: string | null;
      services_offered: string;
      price_range: string;
      description: string;
      availability: number;
      average_rating: number;
      total_ratings: number;
      years_experience: number;
      certifications: string | null;
      phone_number: string;
      county: string;
      created_at: string;
      updated_at: string;
    };
    indexes: {
      'by-user-id': string;
      'by-rating': number;
    };
  };
  users: {
    key: string;
    value: {
      id: string;
      civic_auth_id: string | null;
      email: string | null;
      full_name: string;
      phone_number: string;
      location: string;
      user_type: 'client' | 'provider';
      avatar_url: string | null;
      created_at: string;
      updated_at: string;
    };
    indexes: {
      'by-civic-id': string | null;
      'by-email': string | null;
    };
  };
}

const DB_NAME = 'marketplace-db';
const DB_VERSION = 1;

// Initialize the database
const initDB = async () => {
  const db = await openDB<MarketplaceDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Create users store
      const userStore = db.createObjectStore('users', {
        keyPath: 'id',
      });
      userStore.createIndex('by-civic-id', 'civic_auth_id', { unique: true });
      userStore.createIndex('by-email', 'email', { unique: true });

      // Create service_providers store
      const providerStore = db.createObjectStore('service_providers', {
        keyPath: 'id',
      });
      providerStore.createIndex('by-user-id', 'user_id');
      providerStore.createIndex('by-rating', 'average_rating');
    },
  });

  return db;
};

let dbPromise: Promise<IDBPDatabase<MarketplaceDB>> | null = null;

const getDB = () => {
  if (!dbPromise) {
    dbPromise = initDB();
  }
  return dbPromise;
};

// Helper function to convert snake_case to camelCase
function toCamelCase<T>(obj: any): T {
  if (obj === null || typeof obj !== 'object') return obj;
  
  if (Array.isArray(obj)) {
    return obj.map(item => toCamelCase(item)) as unknown as T;
  }
  
  const result: any = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
      result[camelKey] = toCamelCase(obj[key]);
    }
  }
  return result as T;
}

// Service Providers
export const getServiceProviders = async (): Promise<Array<{
  id: string;
  userId: string;
  businessName: string | null;
  services: string[];
  priceRange: string;
  description: string;
  availability: boolean;
  averageRating: number;
  totalRatings: number;
  yearsExperience: number;
  certifications: string | null;
  phoneNumber: string;
  county: string;
  createdAt: string;
  updatedAt: string;
}>> => {
  const db = await getDB();
  const providers = await db.getAllFromIndex(
    'service_providers',
    'by-rating'
  );
  
  return providers.map(provider => {
    const camelCaseProvider = toCamelCase(provider) as any;
    return {
      id: camelCaseProvider.id,
      userId: camelCaseProvider.userId,
      businessName: camelCaseProvider.businessName,
      services: JSON.parse(provider.services_offered || '[]'),
      priceRange: camelCaseProvider.priceRange,
      description: camelCaseProvider.description,
      availability: Boolean(provider.availability),
      averageRating: camelCaseProvider.averageRating || 0,
      totalRatings: camelCaseProvider.totalRatings || 0,
      yearsExperience: camelCaseProvider.yearsExperience || 0,
      certifications: camelCaseProvider.certifications || null,
      phoneNumber: camelCaseProvider.phoneNumber || '',
      county: camelCaseProvider.county || 'Nairobi',
      createdAt: camelCaseProvider.createdAt,
      updatedAt: camelCaseProvider.updatedAt
    };
  });
};

export const getServiceProviderById = async (id: string): Promise<{
  id: string;
  userId: string;
  businessName: string | null;
  services: string[];
  priceRange: string;
  description: string;
  availability: boolean;
  averageRating: number;
  totalRatings: number;
  yearsExperience: number;
  certifications: string | null;
  phoneNumber: string;
  county: string;
  createdAt: string;
  updatedAt: string;
} | null> => {
  const db = await getDB();
  const provider = await db.get('service_providers', id);
  
  if (!provider) return null;
  
  const camelCaseProvider = toCamelCase(provider) as any;
  return {
    id: camelCaseProvider.id,
    userId: camelCaseProvider.userId,
    businessName: camelCaseProvider.businessName,
    services: JSON.parse(provider.services_offered || '[]'),
    priceRange: camelCaseProvider.priceRange,
    description: camelCaseProvider.description,
    availability: Boolean(provider.availability),
    averageRating: camelCaseProvider.averageRating || 0,
    totalRatings: camelCaseProvider.totalRatings || 0,
    yearsExperience: camelCaseProvider.yearsExperience || 0,
    certifications: camelCaseProvider.certifications || null,
    phoneNumber: camelCaseProvider.phoneNumber || '',
    county: camelCaseProvider.county || 'Nairobi',
    createdAt: camelCaseProvider.createdAt,
    updatedAt: camelCaseProvider.updatedAt
  };
};

export const createServiceProvider = async (data: any) => {
  const db = await getDB();
  const now = new Date().toISOString();
  
  const provider = {
    id: data.id || `sp_${Date.now()}`,
    user_id: data.userId,
    business_name: data.businessName,
    services_offered: JSON.stringify(data.services || []),
    price_range: data.priceRange,
    description: data.description,
    availability: data.availability ? 1 : 0,
    average_rating: data.averageRating || 0,
    total_ratings: data.totalRatings || 0,
    years_experience: data.yearsExperience || 0,
    certifications: data.certifications || null,
    phone_number: data.phoneNumber || '',
    county: data.county || 'Nairobi',
    created_at: data.createdAt || now,
    updated_at: now,
  };
  
  await db.put('service_providers', provider);
  return toCamelCase(provider);
};

// Users
export const getUserByCivicId = async (civicId: string) => {
  const db = await getDB();
  const user = await db.getFromIndex('users', 'by-civic-id', civicId);

  if (user) {
    return toCamelCase(user);
  }

  // Fallback: check enhanced localStorage for user data
  const { retrieveUserData } = await import('./userStorage');
  const storedUserData = retrieveUserData(civicId);
  if (storedUserData) {
    // Create a minimal user object from stored data
    return {
      id: civicId,
      civicAuthId: civicId,
      fullName: storedUserData.fullName,
      userType: storedUserData.userType,
      phoneNumber: null,
      location: 'Nairobi',
      avatarUrl: null,
      email: storedUserData.email || null,
      createdAt: storedUserData.updatedAt,
      updatedAt: storedUserData.updatedAt,
    };
  }

  return null;
};

export const createUser = async (data: any) => {
  const db = await getDB();
  const now = new Date().toISOString();

  const user = {
    id: data.id || `user_${Date.now()}`,
    civic_auth_id: data.civicAuthId || null,
    email: data.email || null,
    full_name: data.fullName,
    phone_number: data.phoneNumber,
    location: data.location || 'Nairobi',
    user_type: data.userType || 'client',
    avatar_url: data.avatarUrl || null,
    created_at: data.createdAt || now,
    updated_at: now,
  };

  await db.put('users', user);

  // Store in enhanced localStorage for cross-browser scenarios
  if (user.civic_auth_id) {
    const { storeUserData } = await import('./userStorage');
    storeUserData(user.civic_auth_id, {
      userType: user.user_type as 'client' | 'provider',
      fullName: user.full_name,
      email: user.email || undefined,
      updatedAt: user.updated_at
    });
  }

  return toCamelCase(user);
};

export const updateUser = async (civicAuthId: string, updates: any) => {
  const db = await getDB();

  // Get existing user
  const existingUser = await db.getFromIndex('users', 'by-civic-id', civicAuthId);
  if (!existingUser) {
    throw new Error('User not found');
  }

  // Update user data
  const updatedUser = {
    ...existingUser,
    ...updates,
    user_type: updates.userType || existingUser.user_type,
    updated_at: new Date().toISOString(),
  };

  await db.put('users', updatedUser);

  // Store in enhanced localStorage for cross-browser scenarios
  const { storeUserData } = await import('./userStorage');
  storeUserData(civicAuthId, {
    userType: updatedUser.user_type as 'client' | 'provider',
    fullName: updatedUser.full_name,
    email: updatedUser.email || undefined,
    updatedAt: updatedUser.updated_at
  });

  return toCamelCase(updatedUser);
};

export const seedInitialData = async () => {
  const db = await getDB();
  
  // Check if we already have data
  const count = await db.count('service_providers');
  if (count > 0) return;
  
  try {
    // Try to fetch the seed data from the public directory
    const response = await fetch('/seed-data.json');
    if (!response.ok) {
      console.log('No seed data file found, creating minimal data');
      // Create minimal seed data if file doesn't exist
      await createMinimalSeedData(db);
      return;
    }

    const seedData = await response.json();

    // Add users with error handling
    const userTx = db.transaction('users', 'readwrite');
    for (const user of seedData.users) {
      try {
        await userTx.store.put(user);
      } catch (userError) {
        console.warn('Failed to add user:', user.id, userError);
      }
    }
    await userTx.done;

    // Add service providers with error handling
    const providerTx = db.transaction('service_providers', 'readwrite');
    for (const provider of seedData.service_providers) {
      try {
        await providerTx.store.put(provider);
      } catch (providerError) {
        console.warn('Failed to add provider:', provider.id, providerError);
      }
    }
    await providerTx.done;

    console.log('Successfully seeded initial data');
  } catch (error) {
    console.error('Error seeding initial data:', error);
    // Create minimal data as fallback
    try {
      await createMinimalSeedData(db);
    } catch (fallbackError) {
      console.error('Failed to create minimal seed data:', fallbackError);
    }
  }
};

// Create minimal seed data as fallback
const createMinimalSeedData = async (db: IDBPDatabase<MarketplaceDB>) => {
  console.log('Creating minimal seed data...');

  // Create a few sample service providers
  const sampleProviders = [
    {
      id: 'provider-1',
      user_id: 'user-1',
      business_name: 'Quick Fix Services',
      services_offered: JSON.stringify(['Plumbing', 'Electrical']),
      price_range: '1000-5000',
      description: 'Professional home repair services',
      availability: 1,
      average_rating: 4.5,
      total_ratings: 10,
      years_experience: 5,
      certifications: null,
      phone_number: '+254712345678',
      county: 'Nairobi',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'provider-2',
      user_id: 'user-2',
      business_name: 'Clean Home Services',
      services_offered: JSON.stringify(['House Cleaning']),
      price_range: '500-2000',
      description: 'Professional cleaning services',
      availability: 1,
      average_rating: 4.8,
      total_ratings: 15,
      years_experience: 3,
      certifications: null,
      phone_number: '+254723456789',
      county: 'Nairobi',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
  ];

  // Add sample users
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
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'user-2',
      civic_auth_id: null,
      email: 'provider2@example.com',
      full_name: 'Jane Smith',
      phone_number: '+254723456789',
      location: 'Nairobi',
      user_type: 'provider',
      avatar_url: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
  ];

  // Add users
  const userTx = db.transaction('users', 'readwrite');
  for (const user of sampleUsers) {
    try {
      await userTx.store.put(user);
    } catch (error) {
      console.warn('Failed to add sample user:', user.id);
    }
  }
  await userTx.done;

  // Add providers
  const providerTx = db.transaction('service_providers', 'readwrite');
  for (const provider of sampleProviders) {
    try {
      await providerTx.store.put(provider);
    } catch (error) {
      console.warn('Failed to add sample provider:', provider.id);
    }
  }
  await providerTx.done;

  console.log('Minimal seed data created successfully');
};

export const updateServiceProvider = async (id: string, data: Partial<ServiceProvider>): Promise<ServiceProvider | null> => {
  try {
    const db = await getDB();
    const tx = db.transaction('service_providers', 'readwrite');
    const store = tx.objectStore('service_providers');
    
    // Get the existing provider
    const existing = await store.get(id);
    if (!existing) return null;
    
    // Merge the updates
    const updatedProvider = {
      ...existing,
      ...data,
      updatedAt: new Date().toISOString()
    };
    
    // Save the updated provider
    await store.put(updatedProvider);
    await tx.done;
    
    return updatedProvider;
  } catch (error) {
    console.error('Error updating service provider:', error);
    throw error;
  }
};

export default {
  getServiceProviders,
  getServiceProviderById,
  createServiceProvider,
  updateServiceProvider,
  getUserByCivicId,
  createUser,
  seedInitialData,
};
