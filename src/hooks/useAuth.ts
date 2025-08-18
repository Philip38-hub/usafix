import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useCivicAuth, CivicUser } from '@/contexts/CivicAuthContext';
import { DATABASE_TYPE } from '@/config';

export interface Profile {
  id: string;
  user_id: string;
  full_name: string | null;
  phone_number: string | null;
  location: string | null;
  user_type: 'client' | 'provider';
  avatar_url: string | null;
  civic_auth_id?: string | null;
  created_at: string;
  updated_at: string;
}

export const useAuth = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Civic Auth integration - this is now our primary authentication method
  const {
    civicUser,
    isLoading: civicLoading,
    error: civicError,
    signInWithCivic,
    signOut: civicSignOut,
    updateUserRole: updateCivicUserRole,
    getUserRole: getCivicUserRole
  } = useCivicAuth();

  // Handle Civic Auth user changes and create/update profile
  useEffect(() => {
    if (civicUser) {
      handleCivicAuthUser(civicUser);
    } else {
      setProfile(null);
      setLoading(false);
    }
  }, [civicUser]);

  // Initialize loading state
  useEffect(() => {
    if (!civicUser) {
      setLoading(false);
    }
  }, [civicUser]);
  // Handle Civic Auth user and create/update profile
  const handleCivicAuthUser = async (civicUser: CivicUser) => {
    try {
      setLoading(true);

      // Create a local profile for Civic Auth user
      // Since we're using Civic Auth only and local database, we'll create a local profile
      const localProfile: Profile = {
        id: civicUser.id,
        user_id: civicUser.id,
        civic_auth_id: civicUser.id,
        full_name: civicUser.name || 'Civic User',
        phone_number: null,
        location: null,
        user_type: 'client', // Default, will be updated during role selection
        avatar_url: civicUser.metadata?.picture || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // If using Supabase, try to sync with database
      if (DATABASE_TYPE === 'supabase') {
        try {
          // Dynamic import to avoid loading Supabase client if not needed
          const { supabase } = await import('@/integrations/supabase/client');

          // Try to fetch existing profile
          const { data: existingProfile } = await supabase
            .from('profiles')
            .select('*')
            .eq('civic_auth_id', civicUser.id)
            .single();

          if (existingProfile) {
            setProfile(existingProfile as Profile);
          } else {
            // Create new profile in Supabase
            const { data: createdProfile, error } = await supabase
              .from('profiles')
              .insert([{
                civic_auth_id: civicUser.id,
                full_name: civicUser.name || 'Civic User',
                phone_number: null,
                location: null,
                user_type: 'client',
                avatar_url: civicUser.metadata?.picture || null,
              }])
              .select()
              .single();

            if (error) throw error;
            setProfile(createdProfile as Profile);
          }
        } catch (dbError) {
          console.warn('Supabase operation failed, using local profile:', dbError);
          setProfile(localProfile);
        }
      } else {
        // Using local database only
        setProfile(localProfile);
      }
    } catch (error) {
      console.error('Error handling Civic Auth user:', error);
    } finally {
      setLoading(false);
    }
  };



  // Update user role after Civic Auth
  const updateUserRole = async (role: 'client' | 'provider') => {
    if (!civicUser || !profile) {
      throw new Error('No authenticated user found');
    }

    try {
      // Update role in Civic Auth context
      await updateCivicUserRole(role);

      // Update profile locally first
      setProfile(prev => prev ? { ...prev, user_type: role } : null);

      // If using Supabase, try to sync with database
      if (DATABASE_TYPE === 'supabase') {
        try {
          const { supabase } = await import('@/integrations/supabase/client');

          const { error } = await supabase
            .from('profiles')
            .update({ user_type: role, updated_at: new Date().toISOString() })
            .eq('civic_auth_id', civicUser.id);

          if (error) throw error;
        } catch (dbError) {
          console.warn('Supabase update failed, but local update succeeded:', dbError);
        }
      }

      toast({
        title: "Role Updated",
        description: `You are now registered as a ${role}`,
      });
    } catch (error: any) {
      toast({
        title: "Role update failed",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  // Sign out from Civic Auth
  const signOut = async () => {
    try {
      await civicSignOut();
      setProfile(null);

      toast({
        title: "Signed out successfully",
        description: "See you next time!",
      });
    } catch (error: any) {
      toast({
        title: "Sign out failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };
  // Determine user role from either profile or Civic Auth
  const getUserRole = (): 'client' | 'provider' | null => {
    if (profile?.user_type) {
      return profile.user_type;
    }
    if (civicUser) {
      return getCivicUserRole();
    }
    return null;
  };

  // Check if user needs role selection
  const needsRoleSelection = (): boolean => {
    return !!civicUser && !getUserRole();
  };

  const currentRole = getUserRole();

  return {
    // User data
    profile,
    civicUser,
    loading: loading || civicLoading,

    // Authentication methods (Civic Auth only)
    signInWithCivic,
    signOut,
    updateUserRole,

    // Authentication status
    isAuthenticated: !!civicUser,
    isProvider: currentRole === 'provider',
    isClient: currentRole === 'client',

    // Role management
    userRole: currentRole,
    needsRoleSelection: needsRoleSelection(),

    // Error handling
    error: civicError,

    // Additional info
    hasProfile: !!profile,
    authMethod: 'civic' as const
  };
};