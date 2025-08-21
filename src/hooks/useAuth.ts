import { useState, useEffect, useMemo, useCallback } from 'react';
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
    console.log('🔄 useAuth useEffect triggered:', { civicUser: civicUser ? { id: civicUser.id, name: civicUser.name } : null });

    if (civicUser) {
      console.log('📞 Calling handleCivicAuthUser for:', civicUser.id);
      handleCivicAuthUser(civicUser);
    } else {
      console.log('❌ No civicUser, clearing profile');
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
    console.log('🚀 handleCivicAuthUser started for:', { id: civicUser.id, name: civicUser.name, email: civicUser.email });

    try {
      setLoading(true);

      // Check for pending role selection
      const pendingRole = localStorage.getItem('pending_role_selection') as 'client' | 'provider' | null;
      console.log('📋 Pending role from localStorage:', pendingRole);
      console.log('🔧 DATABASE_TYPE:', DATABASE_TYPE);

      if (DATABASE_TYPE === 'supabase') {
        console.log('✅ Using Supabase database path');
        try {
          // Dynamic import to avoid loading Supabase client if not needed
          const { supabase } = await import('@/integrations/supabase/client');

          // Try to fetch existing profile by civic_auth_id (primary identifier)
          console.log('🔍 Searching for existing profile with civic_auth_id:', civicUser.id);
          const { data: existingProfile, error: fetchError } = await supabase
            .from('profiles')
            .select('*')
            .eq('civic_auth_id', civicUser.id)
            .single();

          // Handle fetch errors (ignore "not found" errors)
          if (fetchError && fetchError.code !== 'PGRST116') {
            console.error('❌ Supabase fetch error:', fetchError);
            throw fetchError;
          }

          console.log('🔍 Profile search result:', { found: !!existingProfile, error: fetchError?.code });

          if (existingProfile) {
            // User exists, convert to our Profile format
            const profileData = existingProfile as any; // Type assertion to handle missing civic_auth_id in types
            const dbProfile: Profile = {
              id: profileData.id,
              user_id: profileData.civic_auth_id, // Use civic_auth_id as user_id
              civic_auth_id: profileData.civic_auth_id,
              full_name: profileData.full_name,
              phone_number: profileData.phone_number,
              location: profileData.location,
              user_type: profileData.user_type as 'client' | 'provider',
              avatar_url: profileData.avatar_url,
              created_at: profileData.created_at,
              updated_at: profileData.updated_at,
              role_selected: profileData.role_selected ?? false, // Default to false for proper role selection flow
            };
            setProfile(dbProfile);
            console.log('✅ Existing profile loaded:', {
              civic_auth_id: dbProfile.civic_auth_id,
              user_type: dbProfile.user_type,
              role_selected: dbProfile.role_selected
            });
          } else {
            // Create new profile in Supabase
            console.log('📝 Creating new profile for:', civicUser.id);
            const { data: createdProfile, error } = await supabase
              .from('profiles')
              .insert([{
                civic_auth_id: civicUser.id, // Primary identifier
                user_id: civicUser.id, // For compatibility, store same value
                full_name: civicUser.name || 'Civic User',
                phone_number: null,
                location: 'Nairobi',
                user_type: pendingRole || 'client', // Default to client
                avatar_url: civicUser.metadata?.picture || null,
                role_selected: !!pendingRole, // True only if role was pre-selected
              }])
              .select()
              .single();

            if (error) {
              console.error('❌ Supabase insert error:', error);
              console.error('   Code:', error.code);
              console.error('   Message:', error.message);
              console.error('   Details:', error.details);
              throw error;
            }

            console.log('✅ Profile created successfully:', createdProfile);
            const profileData = createdProfile as any; // Type assertion
            const dbProfile: Profile = {
              id: profileData.id,
              user_id: profileData.civic_auth_id,
              civic_auth_id: profileData.civic_auth_id,
              full_name: profileData.full_name,
              phone_number: profileData.phone_number,
              location: profileData.location,
              user_type: profileData.user_type as 'client' | 'provider',
              avatar_url: profileData.avatar_url,
              created_at: profileData.created_at,
              updated_at: profileData.updated_at,
              role_selected: profileData.role_selected,
            };
            setProfile(dbProfile);
            console.log('✅ New profile created and set:', {
              civic_auth_id: dbProfile.civic_auth_id,
              user_type: dbProfile.user_type,
              role_selected: dbProfile.role_selected
            });
          }
        } catch (dbError) {
          console.error('❌ Supabase operation failed:', dbError);
          // Create a fallback local profile
          const fallbackProfile: Profile = {
            id: civicUser.id,
            user_id: civicUser.id,
            civic_auth_id: civicUser.id,
            full_name: civicUser.name || 'Civic User',
            phone_number: null,
            location: 'Nairobi',
            user_type: pendingRole || 'client',
            avatar_url: civicUser.metadata?.picture || null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            role_selected: false,
          };
          setProfile(fallbackProfile);
          console.log('⚠️ Using fallback local profile due to database error');
        }
      } else {
        // Using local database - check if user exists, create if not
        try {
          const { getUserByCivicId, createUser } = await import('@/lib/db');

          // Try to get existing user from local database
          const existingUser = await getUserByCivicId(civicUser.id);

          if (existingUser) {
            // User exists, use their stored profile
            const user = existingUser as any; // Type assertion for database result
            const dbProfile: Profile = {
              id: user.id,
              user_id: user.id,
              civic_auth_id: user.civicAuthId,
              full_name: user.fullName,
              phone_number: user.phoneNumber,
              location: user.location,
              user_type: user.userType,
              avatar_url: user.avatarUrl,
              created_at: user.createdAt,
              updated_at: user.updatedAt,
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
              roleSelected: !!pendingRole, // Only true if there was a pending role selection
            });

            const user = newUser as any; // Type assertion for database result
            const dbProfile: Profile = {
              id: user.id,
              user_id: user.id,
              civic_auth_id: user.civicAuthId,
              full_name: user.fullName,
              phone_number: user.phoneNumber,
              location: user.location,
              user_type: user.userType,
              avatar_url: user.avatarUrl,
              created_at: user.createdAt,
              updated_at: user.updatedAt,
              role_selected: !!pendingRole, // Track if role was explicitly selected
            };
            setProfile(dbProfile);
          }
        } catch (dbError) {
          console.warn('Local database operation failed, using fallback profile:', dbError);
          // Create a fallback local profile
          const fallbackProfile: Profile = {
            id: civicUser.id,
            user_id: civicUser.id,
            civic_auth_id: civicUser.id,
            full_name: civicUser.name || 'Civic User',
            phone_number: null,
            location: 'Nairobi',
            user_type: pendingRole || 'client',
            avatar_url: civicUser.metadata?.picture || null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            role_selected: false,
          };
          setProfile(fallbackProfile);
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
      console.error('❌ Error handling Civic Auth user:', error);
      console.error('   Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        civicUserId: civicUser.id,
        civicUserName: civicUser.name
      });
    } finally {
      console.log('🏁 handleCivicAuthUser completed, setting loading to false');
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
          console.log('📦 Importing Supabase client...');
          const { supabase } = await import('@/integrations/supabase/client');
          console.log('✅ Supabase client imported successfully');

          // Update role using civic_auth_id (primary identifier)
          const { error } = await supabase
            .from('profiles')
            .update({
              user_type: role,
              role_selected: true,
              updated_at: new Date().toISOString()
            })
            .eq('civic_auth_id', civicUser.id);

          console.log('✅ Role updated in database:', { civic_auth_id: civicUser.id, role });

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
          await updateUser(civicUser.id, { userType: role, roleSelected: true });
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
  const getUserRole = useMemo((): 'client' | 'provider' | null => {
    // Primary source: database profile
    if (profile?.user_type) {
      return profile.user_type;
    }

    // Fallback: Civic Auth context (localStorage)
    if (civicUser) {
      const civicRole = getCivicUserRole();
      return civicRole;
    }

    return null;
  }, [profile?.user_type, civicUser, getCivicUserRole]);

  // Check if user needs role selection
  const needsRoleSelection = useMemo((): boolean => {
    // User must be authenticated and have a profile
    if (!civicUser || !profile) {
      return false;
    }

    // If role_selected is explicitly false, user needs role selection
    if (profile.role_selected === false) {
      return true;
    }

    // If role_selected is null/undefined and user_type is default 'client', they likely need role selection
    if (profile.role_selected == null && profile.user_type === 'client') {
      return true;
    }

    return false;
  }, [civicUser, profile?.role_selected, profile?.user_type]);

  // Profile update function
  const updateProfile = useCallback(async (updates: {
    full_name?: string | null;
    phone_number?: string | null;
    location?: string | null;
    avatar_url?: string | null;
  }) => {
    if (!civicUser) {
      throw new Error('User not authenticated');
    }

    console.log('🔄 Updating profile:', updates);

    // Update profile in database
    if (DATABASE_TYPE === 'supabase') {
      try {
        console.log('📦 Importing Supabase client...');
        const { supabase } = await import('@/integrations/supabase/client');
        console.log('✅ Supabase client imported successfully');

        // Update profile using civic_auth_id (primary identifier)
        const { error } = await supabase
          .from('profiles')
          .update({
            ...updates,
            updated_at: new Date().toISOString()
          })
          .eq('civic_auth_id', civicUser.id);

        console.log('✅ Profile updated in database:', { civic_auth_id: civicUser.id, updates });

        if (error) {
          console.error('Supabase update error:', error);
          throw error;
        }
      } catch (dbError) {
        console.warn('Supabase update failed:', dbError);
        throw dbError;
      }
    } else {
      // Update profile in local database
      try {
        const { updateUser } = await import('@/lib/db');
        await updateUser(civicUser.id, {
          fullName: updates.full_name,
          phoneNumber: updates.phone_number,
          location: updates.location,
          avatarUrl: updates.avatar_url
        });
      } catch (dbError) {
        console.warn('Local database update failed:', dbError);
        throw dbError;
      }
    }

    // Update the profile state to reflect the changes
    const updatedProfile = profile ? {
      ...profile,
      ...updates,
      updated_at: new Date().toISOString(),
    } : null;

    setProfile(updatedProfile);
    console.log('✅ Profile state updated locally');
  }, [civicUser, profile]);

  const currentRole = getUserRole;

  return {
    // User data
    profile,
    civicUser,
    loading: loading || civicLoading,

    // Authentication methods (Civic Auth only)
    signInWithCivic,
    signOut,
    updateUserRole,
    updateProfile,

    // Authentication status
    isAuthenticated: !!civicUser,
    isProvider: currentRole === 'provider',
    isClient: currentRole === 'client',

    // Role management
    userRole: currentRole,
    needsRoleSelection: needsRoleSelection,

    // Error handling
    error: civicError,

    // Additional info
    hasProfile: !!profile,
    authMethod: 'civic' as const
  };
};