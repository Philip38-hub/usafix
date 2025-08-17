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
  return user ? toCamelCase(user) : null;
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
  return toCamelCase(user);
};

export const seedInitialData = async () => {
  const db = await getDB();
  
  // Check if we already have data
  const count = await db.count('service_providers');
  if (count > 0) return;
  
  try {
    // Fetch the seed data from the public directory
    const response = await fetch('/seed-data.json');
    if (!response.ok) {
      throw new Error(`Failed to fetch seed data: ${response.statusText}`);
    }
    
    const seedData = await response.json();
    
    // Add users
    const userTx = db.transaction('users', 'readwrite');
    for (const user of seedData.users) {
      await userTx.store.put(user);
    }
    await userTx.done;
    
    // Add service providers
    const providerTx = db.transaction('service_providers', 'readwrite');
    for (const provider of seedData.service_providers) {
      await providerTx.store.put(provider);
    }
    await providerTx.done;
    
    console.log('Successfully seeded initial data');
  } catch (error) {
    console.error('Error seeding initial data:', error);
  }
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
