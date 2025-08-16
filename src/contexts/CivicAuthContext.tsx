import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
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

// Enhanced Civic Auth Provider Implementation
const CivicAuthProviderInner: React.FC<{ 
  children: ReactNode; 
  onSignIn?: (user: CivicUser) => void;
  onSignOut?: () => void;
  clientId?: string;
}> = ({ children, onSignIn, onSignOut, clientId }) => {
  const [civicUser, setCivicUser] = useState<CivicUser | null>(null);
  const [error, setError] = useState<AuthError | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Mock Civic Auth implementation for development
  const signInWithCivic = async (): Promise<void> => {
    try {
      setError(null);
      setIsLoading(true);
      
      // Simulate Civic Auth flow
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Create mock Civic user
      const mockCivicUser: CivicUser = {
        id: `civic_${Date.now()}`,
        email: 'civic.user@example.com',
        name: 'Civic User',
        verified: true,
        metadata: {},
      };
      
      setCivicUser(mockCivicUser);
      onSignIn?.(mockCivicUser);
      
      toast({
        title: "Civic Auth Success",
        description: `Welcome, ${mockCivicUser.name}!`,
      });
    } catch (err: any) {
      const error = AuthErrorHandler.handleCivicAuthError(err);
      setError(error);
      AuthErrorHandler.logError(error, 'CivicAuth sign in');
      
      toast({
        title: "Sign In Failed",
        description: AuthErrorHandler.displayUserFriendlyMessage(error),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async (): Promise<void> => {
    try {
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

  // For now, use mock implementation regardless of client ID
  // In production, you would conditionally use the real Civic SDK
  console.log('Civic Auth Provider initialized with mock implementation');

  return (
    <CivicAuthProviderInner 
      onSignIn={onSignIn} 
      onSignOut={onSignOut}
      clientId={effectiveClientId}
    >
      {children}
    </CivicAuthProviderInner>
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