import { createClient } from '@supabase/supabase-js';
import { SUPABASE_CONFIG } from '@/config';

// Initialize Supabase client - this is the only database we use
const supabase = createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);
console.log('✅ Supabase client initialized successfully');
console.log('🗄️ Using Supabase database for all operations');

// Normalize provider data from Supabase format to our app format
const normalizeProvider = (provider: any) => {
  if (!provider) return null;

  return {
    id: provider.id,
    user_id: provider.user_id,
    business_name: provider.business_name,
    full_name: provider.business_name, // Use business_name as full_name fallback
    description: provider.description || '',
    services: provider.services || [], // services is already an array in Supabase
    location: provider.location || '',
    county: provider.county || provider.location || '',
    price_range: provider.price_range || '',
    phone_number: provider.phone_number || '',
    whatsapp_number: provider.whatsapp_number || provider.phone_number || '',
    is_verified: provider.is_verified || false,
    rating: provider.rating || 0, // Ensure rating is never undefined
    total_jobs: provider.total_jobs || 0,
    profile_image_url: provider.profile_image_url,
    years_experience: provider.years_experience || 0,
    certifications: provider.certifications || [],
    created_at: provider.created_at,
    updated_at: provider.updated_at,
  };
};

export const getServiceProviders = async (): Promise<any[]> => {
  try {
    const { data, error } = await supabase
      .from('service_providers')
      .select('*')
      .order('rating', { ascending: false }); // Use 'rating' instead of 'average_rating'

    if (error) throw error;
    return data ? data.map(normalizeProvider) : [];
  } catch (error) {
    console.error('Error fetching service providers:', error);
    throw error;
  }
};

export const getServiceProviderById = async (id: string): Promise<any | null> => {
  try {
    const { data, error } = await supabase
      .from('service_providers')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data ? normalizeProvider(data) : null;
  } catch (error) {
    console.error(`Error fetching service provider ${id}:`, error);
    throw error;
  }
};

export const createServiceProvider = async (data: any) => {
  try {
    const now = new Date().toISOString();
    
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
  } catch (error) {
    console.error('Error creating service provider:', error);
    throw error;
  }
};

export const updateServiceProvider = async (id: string, updates: any) => {
  try {
    const now = new Date().toISOString();
    
    const { data: provider, error } = await supabase
      .from('service_providers')
      .update({
        business_name: updates.businessName,
        services_offered: updates.services ? JSON.stringify(updates.services) : undefined,
        price_range: updates.priceRange,
        description: updates.description,
        is_available: updates.availability,
        average_rating: updates.averageRating,
        total_ratings: updates.totalRatings,
        years_experience: updates.yearsExperience,
        certifications: updates.certifications,
        phone_number: updates.phoneNumber,
        location: updates.county,
        updated_at: now
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return provider ? normalizeProvider(provider) : null;
  } catch (error) {
    console.error(`Error updating service provider ${id}:`, error);
    throw error;
  }
};

export const searchServiceProviders = async (query: string): Promise<any[]> => {
  try {
    const { data, error } = await supabase
      .from('service_providers')
      .select('*')
      .or(`business_name.ilike.%${query}%,services_offered.ilike.%${query}%,description.ilike.%${query}%`)
      .order('average_rating', { ascending: false });
    
    if (error) throw error;
    return data ? data.map(normalizeProvider) : [];
  } catch (error) {
    console.error('Error searching service providers:', error);
    throw error;
  }
};

export const getServiceProvidersByLocation = async (location: string): Promise<any[]> => {
  try {
    const { data, error } = await supabase
      .from('service_providers')
      .select('*')
      .eq('location', location)
      .order('average_rating', { ascending: false });
    
    if (error) throw error;
    return data ? data.map(normalizeProvider) : [];
  } catch (error) {
    console.error(`Error fetching service providers for location ${location}:`, error);
    throw error;
  }
};
