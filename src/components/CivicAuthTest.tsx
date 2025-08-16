import React from 'react';
import { useCivicAuth } from '@/contexts/CivicAuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';

export const CivicAuthTest: React.FC = () => {
  const { 
    civicUser, 
    isLoading, 
    error, 
    signInWithCivic, 
    signOut, 
    clearError,
    getUserRole,
    updateUserRole
  } = useCivicAuth();

  const currentRole = getUserRole();

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Civic Auth Integration Test
          {civicUser && <CheckCircle className="h-5 w-5 text-green-500" />}
        </CardTitle>
        <CardDescription>
          Test the Civic Auth SDK integration and role management
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertDescription>
              {error.message}
              {error.retryable && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="ml-2"
                  onClick={clearError}
                >
                  Dismiss
                </Button>
              )}
            </AlertDescription>
          </Alert>
        )}

        {civicUser ? (
          <div className="space-y-3">
            <div className="p-3 bg-green-50 rounded-lg border border-green-200">
              <h4 className="font-medium text-green-800">Authenticated User</h4>
              <p className="text-sm text-green-600">ID: {civicUser.id}</p>
              {civicUser.name && (
                <p className="text-sm text-green-600">Name: {civicUser.name}</p>
              )}
              {civicUser.email && (
                <p className="text-sm text-green-600">Email: {civicUser.email}</p>
              )}
              <p className="text-sm text-green-600">
                Verified: {civicUser.verified ? 'Yes' : 'No'}
              </p>
              <p className="text-sm text-green-600">
                Role: {currentRole || 'Not set'}
              </p>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => updateUserRole('client')}
                disabled={currentRole === 'client'}
              >
                Set as Client
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => updateUserRole('provider')}
                disabled={currentRole === 'provider'}
              >
                Set as Provider
              </Button>
            </div>

            <Button 
              variant="destructive" 
              onClick={signOut}
              disabled={isLoading}
              className="w-full"
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Sign Out
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-gray-600">
              Click the button below to test Civic Auth sign-in
            </p>
            <Button 
              onClick={signInWithCivic}
              disabled={isLoading}
              className="w-full"
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Sign In with Civic
            </Button>
          </div>
        )}

        <div className="text-xs text-gray-500 space-y-1">
          <p>Status: {isLoading ? 'Loading...' : 'Ready'}</p>
          <p>Client ID: {import.meta.env.VITE_CIVIC_AUTH_CLIENT_ID ? 'Configured' : 'Not configured'}</p>
        </div>
      </CardContent>
    </Card>
  );
};