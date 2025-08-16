import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useCivicAuth, CivicUser } from '@/contexts/CivicAuthContext';

export interface Profile {
  id: string;
  user_id: string;
  full_name: string | null;
  phone_number: string | null;
  location: string | null;
  user_type: 'client' | 'provider';
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Civic Auth integration
  const {
    civicUser,
    isLoading: civicLoading,
    error: civicError,
    signInWithCivic,
    signOut: civicSignOut,
    updateUserRole: updateCivicUserRole,
    getUserRole: getCivicUserRole
  } = useCivicAuth();

  // Handle Civic Auth user changes
  useEffect(() => {
    if (civicUser) {
      handleCivicAuthUser(civicUser);
    }
  }, [civicUser]);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          // Fetch user profile
          const { data: profileData } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', session.user.id)
            .single();

          setProfile(profileData);
        } else {
          setProfile(null);
        }

        setLoading(false);
      }
    );

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        supabase
          .from('profiles')
          .select('*')
          .eq('user_id', session.user.id)
          .single()
          .then(({ data: profileData }) => {
            setProfile(profileData);
            setLoading(false);
          });
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Handle Civic Auth user and create/update profile
  const handleCivicAuthUser = async (civicUser: CivicUser) => {
    try {
      setLoading(true);

      // Check if user profile exists with civic_auth_id
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('civic_auth_id', civicUser.id)
        .single();

      if (existingProfile) {
        // Update existing profile
        setProfile(existingProfile);
      } else {
        // Create new profile for Civic Auth user
        // Default to client role, can be changed later
        const newProfile = {
          id: civicUser.id,
          user_id: civicUser.id,
          civic_auth_id: civicUser.id,
          full_name: civicUser.name || 'Civic User',
          email: civicUser.email,
          phone_number: null,
          location: null,
          user_type: 'client' as const,
          avatar_url: null,
        };

        const { data: createdProfile, error } = await supabase
          .from('profiles')
          .insert(newProfile)
          .select()
          .single();

        if (error) {
          console.error('Error creating Civic Auth profile:', error);
          toast({
            title: "Profile Creation Error",
            description: "Failed to create user profile. Please try again.",
            variant: "destructive",
          });
        } else {
          setProfile(createdProfile);
          toast({
            title: "Profile Created",
            description: "Your profile has been created successfully!",
          });
        }
      }
    } catch (error) {
      console.error('Error handling Civic Auth user:', error);
    } finally {
      setLoading(false);
    }
  };



  const signUp = async (email: string, password: string, userData: {
    full_name: string;
    phone_number: string;
    location: string;
    user_type: 'client' | 'provider'
  }) => {
    try {
      const redirectUrl = `${window.location.origin}/`;

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: userData.full_name,
            phone_number: userData.phone_number,
            location: userData.location,
            user_type: userData.user_type
          }
        }
      });

      if (error) throw error;

      // Create profile after successful signup
      if (data.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            user_id: data.user.id,
            full_name: userData.full_name,
            phone_number: userData.phone_number,
            location: userData.location,
            user_type: userData.user_type
          });

        if (profileError) {
          console.error('Profile creation error:', profileError);
        }
      }

      toast({
        title: "Account created successfully!",
        description: "Please check your email to verify your account.",
      });

      return { data, error: null };
    } catch (error: any) {
      toast({
        title: "Sign up failed",
        description: error.message,
        variant: "destructive",
      });
      return { data: null, error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      toast({
        title: "Welcome back!",
        description: "You have successfully signed in.",
      });

      return { data, error: null };
    } catch (error: any) {
      toast({
        title: "Sign in failed",
        description: error.message,
        variant: "destructive",
      });
      return { data: null, error };
    }
  };

  const signOut = async () => {
    try {
      // Sign out from both Civic Auth and Supabase
      await Promise.all([
        civicSignOut(),
        supabase.auth.signOut()
      ]);

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

  // Update user role
  const updateUserRole = async (newRole: 'client' | 'provider') => {
    if (civicUser) {
      // Update Civic Auth user role
      await updateCivicUserRole(newRole);
    }

    if (!profile) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({ user_type: newRole })
        .eq('id', profile.id)
        .select()
        .single();

      if (error) throw error;

      setProfile(data);
      toast({
        title: "Role Updated",
        description: `Your role has been updated to ${newRole}`,
      });
    } catch (error: any) {
      toast({
        title: "Update Failed",
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

  const currentRole = getUserRole();

  return {
    user,
    session,
    profile,
    loading: loading || civicLoading,
    signUp,
    signIn,
    signOut,
    // Civic Auth methods
    signInWithCivic,
    civicUser,
    civicError,
    updateUserRole,
    // Authentication status
    isAuthenticated: !!user || !!civicUser,
    isProvider: currentRole === 'provider',
    isClient: currentRole === 'client',
    // Enhanced authentication info
    authMethod: civicUser ? 'civic' : user ? 'supabase' : null,
    hasProfile: !!profile,
    userRole: currentRole
  };
};