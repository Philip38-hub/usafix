import { createClient } from '@supabase/supabase-js';
import * as localDb from '@/lib/db';
import { DATABASE_TYPE, SUPABASE_CONFIG } from '@/config';

// Initialize Supabase client
const supabase = createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);

interface ServiceProvider {
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
}

// Helper function to normalize provider data
const normalizeProvider = (provider: any): ServiceProvider => ({
  id: provider.id,
  userId: provider.user_id || provider.userId,
  businessName: provider.business_name || provider.businessName || `Service Provider ${provider.id?.slice(0, 6) || 'Unknown'}`,
  services: Array.isArray(provider.services) 
    ? provider.services 
    : (provider.services_offered ? JSON.parse(provider.services_offered) : []),
  priceRange: provider.price_range || provider.priceRange || '$$',
  description: provider.description || 'No description available',
  availability: Boolean(provider.availability || provider.is_available),
  averageRating: provider.average_rating || provider.averageRating || 0,
  totalRatings: provider.total_ratings || provider.totalRatings || 0,
  yearsExperience: provider.years_experience || provider.yearsExperience || 0,
  certifications: provider.certifications || null,
  phoneNumber: provider.phone_number || provider.phoneNumber || '',
  county: provider.county || provider.location || 'Nairobi',
  createdAt: provider.created_at || provider.createdAt || new Date().toISOString(),
  updatedAt: provider.updated_at || provider.updatedAt || new Date().toISOString(),
});

export const getServiceProviders = async (): Promise<ServiceProvider[]> => {
  try {
    if (DATABASE_TYPE === 'supabase') {
      const { data, error } = await supabase
        .from('service_providers')
        .select('*')
        .order('average_rating', { ascending: false });
      
      if (error) throw error;
      return data ? data.map(normalizeProvider) : [];
    } else {
      // Local database
      await localDb.seedInitialData();
      const providers = await localDb.getServiceProviders();
      return providers.map(normalizeProvider);
    }
  } catch (error) {
    console.error('Error fetching service providers:', error);
    throw error;
  }
};

export const getServiceProviderById = async (id: string): Promise<ServiceProvider | null> => {
  try {
    if (DATABASE_TYPE === 'supabase') {
      const { data, error } = await supabase
        .from('service_providers')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data ? normalizeProvider(data) : null;
    } else {
      // Local database
      await localDb.seedInitialData();
      const provider = await localDb.getServiceProviderById(id);
      return provider ? normalizeProvider(provider) : null;
    }
  } catch (error) {
    console.error(`Error fetching service provider ${id}:`, error);
    throw error;
  }
};

export const createServiceProvider = async (data: Omit<ServiceProvider, 'id' | 'createdAt' | 'updatedAt'>) => {
  try {
    const now = new Date().toISOString();
    
    if (DATABASE_TYPE === 'supabase') {
      const { data: provider, error } = await supabase
        .from('service_providers')
        .insert({
          user_id: data.userId,
          business_name: data.businessName,
          services_offered: JSON.stringify(data.services),
          price_range: data.priceRange,
          description: data.description,
          is_available: data.availability,
          average_rating: data.averageRating,
          total_ratings: data.totalRatings,
          years_experience: data.yearsExperience,
          certifications: data.certifications,
          phone_number: data.phoneNumber,
          location: data.county,
          created_at: now,
          updated_at: now
        })
        .select()
        .single();
      
      if (error) throw error;
      return provider ? normalizeProvider(provider) : null;
    } else {
      // Local database
      await localDb.seedInitialData();
      const provider = await localDb.createServiceProvider({
        ...data,
        id: `sp_${Date.now()}`,
        createdAt: now,
        updatedAt: now
      });
      return provider ? normalizeProvider(provider) : null;
    }
  } catch (error) {
    console.error('Error creating service provider:', error);
    throw error;
  }
};

export const updateServiceProvider = async (id: string, updates: Partial<ServiceProvider>) => {
  try {
    const now = new Date().toISOString();
    
    if (DATABASE_TYPE === 'supabase') {
      const { data: provider, error } = await supabase
        .from('service_providers')
        .update({
          ...updates,
          updated_at: now,
          // Handle any field name conversions
          ...(updates.businessName && { business_name: updates.businessName }),
          ...(updates.services && { services_offered: JSON.stringify(updates.services) }),
          ...(updates.priceRange && { price_range: updates.priceRange }),
          ...(updates.availability !== undefined && { is_available: updates.availability }),
          ...(updates.averageRating && { average_rating: updates.averageRating }),
          ...(updates.totalRatings && { total_ratings: updates.totalRatings }),
          ...(updates.yearsExperience && { years_experience: updates.yearsExperience }),
          ...(updates.phoneNumber && { phone_number: updates.phoneNumber })
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return provider ? normalizeProvider(provider) : null;
    } else {
      // Local database
      await localDb.seedInitialData();
      const existing = await localDb.getServiceProviderById(id);
      if (!existing) return null;
      
      const updatedProvider = {
        ...existing,
        ...updates,
        updatedAt: now
      };
      
      await localDb.updateServiceProvider(id, updatedProvider);
      return normalizeProvider(updatedProvider);
    }
  } catch (error) {
    console.error(`Error updating service provider ${id}:`, error);
    throw error;
  }
};
