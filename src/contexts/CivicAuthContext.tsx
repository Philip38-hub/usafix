import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { CivicAuthProvider as CivicSDKProvider, UserButton, useUser } from '@civic/auth/react';
import { useToast } from '@/hooks/use-toast';
import { AuthErrorHandler } from '@/utils/authErrorHandler';

// Civic Auth user interface
export interface CivicUser {
  id: string;
  email?: string;
  name?: string;
  verified?: boolean;
  metadata?: Record<string, any>;
}

// Auth error interface (re-export from utils)
export interface AuthError {
  type: 'civic_auth_error' | 'supabase_error' | 'network_error' | 'validation_error';
  message: string;
  code?: string;
  retryable: boolean;
}

// Enhanced Civic Auth context interface
interface EnhancedCivicAuthContextType {
  civicUser: CivicUser | null;
  isLoading: boolean;
  error: AuthError | null;
  signInWithCivic: () => Promise<void>;
  signOut: () => Promise<void>;
  clearError: () => void;
  // Additional methods for role management
  updateUserRole: (role: 'client' | 'provider') => Promise<void>;
  getUserRole: () => 'client' | 'provider' | null;
  // Civic SDK user data
  civicSDKUser: any;
}

const EnhancedCivicAuthContext = createContext<EnhancedCivicAuthContextType | undefined>(undefined);

// Civic Auth Provider Props
interface CivicAuthProviderProps {
  children: ReactNode;
  clientId?: string;
  displayMode?: 'iframe' | 'redirect' | 'new_tab';
  onSignIn?: (user: CivicUser) => void;
  onSignOut?: () => void;
}

// Enhanced Civic Auth Provider Implementation
const CivicAuthProviderInner: React.FC<{
  children: ReactNode;
  onSignIn?: (user: CivicUser) => void;
  onSignOut?: () => void;
  clientId?: string;
}> = ({ children, onSignIn, onSignOut, clientId }) => {
  const [civicUser, setCivicUser] = useState<CivicUser | null>(null);
  const [error, setError] = useState<AuthError | null>(null);
  const { toast } = useToast();

  // Use the real Civic Auth SDK
  const { user: civicSDKUser, signIn, signOut: civicSignOut, isLoading } = useUser();

  // Convert Civic SDK user to our CivicUser format
  useEffect(() => {
    if (civicSDKUser) {
      const convertedUser: CivicUser = {
        id: civicSDKUser.id,
        email: civicSDKUser.email,
        name: civicSDKUser.name || civicSDKUser.given_name || 'Civic User',
        verified: true, // Civic users are verified by default
        metadata: {
          given_name: civicSDKUser.given_name,
          family_name: civicSDKUser.family_name,
          picture: civicSDKUser.picture,
          updated_at: civicSDKUser.updated_at,
        },
      };

      setCivicUser(convertedUser);
      onSignIn?.(convertedUser);

      toast({
        title: "Welcome to Konnect!",
        description: `Successfully signed in with Civic Auth`,
      });
    } else {
      // Only clear user if we're not in a loading state
      if (!isLoading) {
        setCivicUser(null);
      }
    }
  }, [civicSDKUser, onSignIn, toast, isLoading]);

  const signInWithCivic = async (): Promise<void> => {
    try {
      setError(null);
      await signIn();
    } catch (err: any) {
      const error = AuthErrorHandler.handleCivicAuthError(err);
      setError(error);
      AuthErrorHandler.logError(error, 'CivicAuth sign in');

      toast({
        title: "Sign In Failed",
        description: AuthErrorHandler.displayUserFriendlyMessage(error),
        variant: "destructive",
      });
    }
  };

  const signOut = async (): Promise<void> => {
    try {
      await civicSignOut();
      setCivicUser(null);
      setError(null);
      onSignOut?.();

      toast({
        title: "Signed Out",
        description: "You have been signed out successfully",
      });
    } catch (err: any) {
      console.error('Civic Auth sign out error:', err);
    }
  };

  const clearError = (): void => {
    setError(null);
  };

  // Role management methods
  const updateUserRole = async (role: 'client' | 'provider'): Promise<void> => {
    if (civicUser) {
      localStorage.setItem(`civic_user_role_${civicUser.id}`, role);
      toast({
        title: "Role Updated",
        description: `Your role has been updated to ${role}`,
      });
    }
  };

  const getUserRole = (): 'client' | 'provider' | null => {
    if (!civicUser) return null;
    
    // Check metadata first
    if (civicUser.metadata?.userType) {
      return civicUser.metadata.userType === 'provider' ? 'provider' : 'client';
    }
    
    if (civicUser.metadata?.role) {
      return civicUser.metadata.role === 'provider' ? 'provider' : 'client';
    }
    
    // Check localStorage
    const storedRole = localStorage.getItem(`civic_user_role_${civicUser.id}`);
    if (storedRole === 'provider' || storedRole === 'client') {
      return storedRole;
    }
    
    // Return null to indicate role selection is needed
    return null;
  };

  const contextValue: EnhancedCivicAuthContextType = {
    civicUser,
    isLoading,
    error,
    signInWithCivic,
    signOut,
    clearError,
    updateUserRole,
    getUserRole,
    civicSDKUser,
  };

  return (
    <EnhancedCivicAuthContext.Provider value={contextValue}>
      {children}
    </EnhancedCivicAuthContext.Provider>
  );
};

export const CivicAuthProvider: React.FC<CivicAuthProviderProps> = ({
  children,
  clientId,
  displayMode = 'iframe',
  onSignIn,
  onSignOut,
}) => {
  // Get client ID from environment or props
  const effectiveClientId = clientId || import.meta.env.VITE_CIVIC_AUTH_CLIENT_ID;

  if (!effectiveClientId) {
    console.error('Civic Auth Client ID is required. Please set VITE_CIVIC_AUTH_CLIENT_ID in your .env file');
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center p-8 max-w-md">
          <h2 className="text-xl font-semibold text-destructive mb-2">Configuration Error</h2>
          <p className="text-muted-foreground">
            Civic Auth Client ID is missing. Please add your Client ID to the .env file.
          </p>
        </div>
      </div>
    );
  }

  return (
    <CivicSDKProvider
      clientId={effectiveClientId}
      displayMode={displayMode}
      onSignIn={(error?: Error) => {
        if (error) {
          console.error('Civic Auth sign in error:', error);
        } else {
          console.log('Civic Auth sign in successful');
        }
      }}
      onSignOut={() => {
        console.log('User signed out from Civic Auth');
      }}
    >
      <CivicAuthProviderInner
        onSignIn={onSignIn}
        onSignOut={onSignOut}
        clientId={effectiveClientId}
      >
        {children}
      </CivicAuthProviderInner>
    </CivicSDKProvider>
  );
};

// Custom hook to use enhanced Civic Auth context
export const useCivicAuth = (): EnhancedCivicAuthContextType => {
  const context = useContext(EnhancedCivicAuthContext);
  if (context === undefined) {
    throw new Error('useCivicAuth must be used within a CivicAuthProvider');
  }
  return context;
};