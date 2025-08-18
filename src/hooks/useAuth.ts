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
  // Flag to track if user has completed role selection
  role_selected?: boolean;
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

      // Check for pending role selection
      const pendingRole = localStorage.getItem('pending_role_selection') as 'client' | 'provider' | null;

      // Create a local profile for Civic Auth user
      // Since we're using Civic Auth only and local database, we'll create a local profile
      const localProfile: Profile = {
        id: civicUser.id,
        user_id: civicUser.id,
        civic_auth_id: civicUser.id,
        full_name: civicUser.name || 'Civic User',
        phone_number: null,
        location: null,
        user_type: pendingRole || 'client', // Default to client, but track if role was actually selected
        avatar_url: civicUser.metadata?.picture || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        role_selected: !!pendingRole, // Only true if there was a pending role selection
      };

      // If using Supabase, try to sync with database
      if (DATABASE_TYPE === 'supabase') {
        try {
          // Dynamic import to avoid loading Supabase client if not needed
          const { supabase } = await import('@/integrations/supabase/client');

          // Use user_id field to store civic_auth_id since we're not using Supabase Auth
          // Try to fetch existing profile by user_id (which contains civic_auth_id)
          const { data: existingProfile } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', civicUser.id)
            .single();

          if (existingProfile) {
            // User exists, convert to our Profile format
            const dbProfile: Profile = {
              id: existingProfile.id,
              user_id: existingProfile.user_id, // This contains civic_auth_id
              civic_auth_id: existingProfile.user_id, // Same as user_id in our case
              full_name: existingProfile.full_name,
              phone_number: existingProfile.phone_number,
              location: existingProfile.location,
              user_type: existingProfile.user_type,
              avatar_url: existingProfile.avatar_url,
              created_at: existingProfile.created_at,
              updated_at: existingProfile.updated_at,
              role_selected: true, // Existing users have already selected their role
            };
            setProfile(dbProfile);
          } else {
            // Create new profile in Supabase
            const { data: createdProfile, error } = await supabase
              .from('profiles')
              .insert([{
                user_id: civicUser.id, // Store civic_auth_id in user_id field
                full_name: civicUser.name || 'Civic User',
                phone_number: null,
                location: 'Nairobi',
                user_type: pendingRole || 'client', // Default to client
                avatar_url: civicUser.metadata?.picture || null,
              }])
              .select()
              .single();

            if (error) {
              console.error('Supabase insert error:', error);
              throw error;
            }

            const dbProfile: Profile = {
              id: createdProfile.id,
              user_id: createdProfile.user_id,
              civic_auth_id: createdProfile.user_id, // Same as user_id
              full_name: createdProfile.full_name,
              phone_number: createdProfile.phone_number,
              location: createdProfile.location,
              user_type: createdProfile.user_type,
              avatar_url: createdProfile.avatar_url,
              created_at: createdProfile.created_at,
              updated_at: createdProfile.updated_at,
              role_selected: !!pendingRole, // Track if role was explicitly selected
            };
            setProfile(dbProfile);
          }
        } catch (dbError) {
          console.warn('Supabase operation failed, using local profile:', dbError);
          setProfile(localProfile);
        }
      } else {
        // Using local database - check if user exists, create if not
        try {
          const { getUserByCivicId, createUser } = await import('@/lib/db');

          // Try to get existing user from local database
          const existingUser = await getUserByCivicId(civicUser.id);

          if (existingUser) {
            // User exists, use their stored profile
            const dbProfile: Profile = {
              id: existingUser.id,
              user_id: existingUser.id,
              civic_auth_id: existingUser.civicAuthId,
              full_name: existingUser.fullName,
              phone_number: existingUser.phoneNumber,
              location: existingUser.location,
              user_type: existingUser.userType,
              avatar_url: existingUser.avatarUrl,
              created_at: existingUser.createdAt,
              updated_at: existingUser.updatedAt,
              role_selected: true, // Existing users have already selected their role
            };
            setProfile(dbProfile);
          } else {
            // User doesn't exist, create new user in database
            const newUser = await createUser({
              id: civicUser.id,
              civicAuthId: civicUser.id,
              email: civicUser.email,
              fullName: civicUser.name || 'Civic User',
              phoneNumber: null,
              location: 'Nairobi', // Default location
              userType: pendingRole || 'client', // Local DB might require a default, but we'll handle this in the DB layer
              avatarUrl: civicUser.metadata?.picture || null,
            });

            const dbProfile: Profile = {
              id: newUser.id,
              user_id: newUser.id,
              civic_auth_id: newUser.civicAuthId,
              full_name: newUser.fullName,
              phone_number: newUser.phoneNumber,
              location: newUser.location,
              user_type: newUser.userType,
              avatar_url: newUser.avatarUrl,
              created_at: newUser.createdAt,
              updated_at: newUser.updatedAt,
              role_selected: !!pendingRole, // Track if role was explicitly selected
            };
            setProfile(dbProfile);
          }
        } catch (dbError) {
          console.warn('Local database operation failed, using memory profile:', dbError);
          setProfile(localProfile);
        }
      }

      // If there was a pending role selection, apply it and clean up
      if (pendingRole) {
        try {
          await updateCivicUserRole(pendingRole);
          localStorage.removeItem('pending_role_selection');

          toast({
            title: "Role Applied",
            description: `Your role has been set to ${pendingRole}`,
          });
        } catch (error) {
          console.error('Error applying pending role:', error);
        }
      }
    } catch (error) {
      console.error('Error handling Civic Auth user:', error);
    } finally {
      setLoading(false);
    }
  };



  // Update user role after Civic Auth
  const updateUserRole = async (role: 'client' | 'provider') => {
    if (!civicUser) {
      throw new Error('No authenticated user found');
    }

    try {
      // Update role in Civic Auth context
      await updateCivicUserRole(role);

      // Update role in database
      if (DATABASE_TYPE === 'supabase') {
        try {
          const { supabase } = await import('@/integrations/supabase/client');

          // Update role using user_id (which contains civic_auth_id)
          const { error } = await supabase
            .from('profiles')
            .update({ user_type: role, updated_at: new Date().toISOString() })
            .eq('user_id', civicUser.id);

          if (error) {
            console.error('Supabase update error:', error);
            throw error;
          }
        } catch (dbError) {
          console.warn('Supabase update failed, but local update succeeded:', dbError);
        }
      } else {
        // Update role in local database
        try {
          const { updateUser } = await import('@/lib/db');
          await updateUser(civicUser.id, { userType: role });
        } catch (dbError) {
          console.warn('Local database update failed, but memory update succeeded:', dbError);
        }
      }

      // Update the profile state to reflect the new role
      const updatedProfile = profile ? {
        ...profile,
        user_type: role,
        updated_at: new Date().toISOString(),
        role_selected: true, // Mark that role has been explicitly selected
      } : null;

      console.log('Updating profile state with new role:', { role, updatedProfile });
      setProfile(updatedProfile);

      // Clear localStorage role since we now have it in the database
      localStorage.removeItem(`civic_user_role_${civicUser.id}`);

      toast({
        title: "Role Updated",
        description: `You are now registered as a ${role}`,
      });

      console.log('Role update completed successfully:', { role, profile: updatedProfile });

      // Small delay to ensure state is updated before navigation
      await new Promise(resolve => setTimeout(resolve, 100));

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
  // Determine user role from profile (database) first, then fallback to Civic Auth
  const getUserRole = (): 'client' | 'provider' | null => {
    // Primary source: database profile
    if (profile?.user_type) {
      console.log('getUserRole: Found role in profile:', profile.user_type);
      return profile.user_type;
    }

    // Fallback: Civic Auth context (localStorage)
    if (civicUser) {
      const civicRole = getCivicUserRole();
      console.log('getUserRole: Found role in Civic Auth:', civicRole);
      return civicRole;
    }

    console.log('getUserRole: No role found');
    return null;
  };

  // Check if user needs role selection
  const needsRoleSelection = (): boolean => {
    const hasUser = !!civicUser;
    const hasProfile = !!profile;
    const roleSelected = profile?.role_selected ?? true; // Default to true for existing users without this flag
    const needsRole = hasUser && hasProfile && !roleSelected;

    console.log('needsRoleSelection:', { hasUser, hasProfile, roleSelected, needsRole, profile });
    return needsRole;
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