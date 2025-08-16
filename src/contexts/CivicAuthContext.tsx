import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { 
  CivicAuthProvider as CivicSDKProvider, 
  useCivicAuthContext
} from '@civic/auth/react';
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

// Inner component that uses the Civic Auth SDK context
const CivicAuthProviderInner: React.FC<{ 
  children: ReactNode; 
  onSignIn?: (user: CivicUser) => void;
  onSignOut?: () => void;
}> = ({ children, onSignIn, onSignOut }) => {
  const [civicUser, setCivicUser] = useState<CivicUser | null>(null);
  const [error, setError] = useState<AuthError | null>(null);
  const { toast } = useToast();
  
  // Use the Civic Auth SDK context
  const civicAuthContext = useCivicAuthContext();
  const { user, isLoading, signIn, signOut: sdkSignOut } = civicAuthContext;

  // Convert SDK user to our CivicUser format
  useEffect(() => {
    if (user) {
      const civicUser: CivicUser = {
        id: user.id,
        email: user.email,
        name: user.name,
        verified: true, // Assume verified if user exists
        metadata: {},
      };
      
      setCivicUser(civicUser);
      setError(null);
      
      onSignIn?.(civicUser);
      
      toast({
        title: "Civic Auth Success",
        description: `Welcome, ${civicUser.name || 'User'}!`,
      });
    } else {
      setCivicUser(null);
    }
  }, [user, onSignIn, toast]);

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
      await sdkSignOut();
      setCivicUser(null);
      setError(null);
      onSignOut?.();
      
      toast({
        title: "Signed Out",
        description: "You have been signed out of Civic Auth",
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
    // This would typically update the user's metadata or profile
    // For now, we'll store it in localStorage as a demo
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
    
    // Default to client
    return 'client';
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

  // If no client ID is provided, render children without Civic Auth
  if (!effectiveClientId) {
    console.warn('Civic Auth client ID is not configured. Civic Auth will be disabled.');
    return <>{children}</>;
  }

  return (
    <CivicSDKProvider 
      clientId={effectiveClientId}
    >
      <CivicAuthProviderInner onSignIn={onSignIn} onSignOut={onSignOut}>
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