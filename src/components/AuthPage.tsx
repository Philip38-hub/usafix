import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/hooks/useAuth';
import { Building, User, Loader2, Shield, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCivicAuth } from '@/contexts/CivicAuthContext';

interface AuthPageProps {
  defaultTab?: 'signin' | 'signup';
}

export const AuthPage: React.FC<AuthPageProps> = ({ defaultTab = 'signin' }) => {
  const navigate = useNavigate();
  const { isAuthenticated, userRole, needsRoleSelection, updateUserRole } = useAuth();
  const { signInWithCivic, civicUser, isLoading, error } = useCivicAuth();
  const [selectedRole, setSelectedRole] = useState<'client' | 'provider' | null>(null);
  const [showRoleSelection, setShowRoleSelection] = useState(false);

  // Handle automatic navigation after authentication
  useEffect(() => {
    if (isAuthenticated) {
      if (needsRoleSelection) {
        setShowRoleSelection(true);
      } else if (userRole) {
        navigate('/dashboard');
      }
    }
  }, [isAuthenticated, userRole, needsRoleSelection, navigate]);

  // Handle role selection after Civic Auth
  const handleRoleSelection = async (role: 'client' | 'provider') => {
    try {
      await updateUserRole(role);
      // Navigate based on selected role
      if (role === 'provider') {
        navigate('/provider/dashboard');
      } else {
        navigate('/');
      }
    } catch (error) {
      console.error('Error updating role:', error);
    }
  };

  // Show role selection if user is authenticated but needs role
  if (showRoleSelection && civicUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-accent/10 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <Shield className="w-12 h-12 text-primary" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-2">
              Welcome to Konnect!
            </h1>
            <p className="text-muted-foreground">
              Hi {civicUser.name}! Please select your role to continue.
            </p>
            <Badge variant="outline" className="mt-2">
              <CheckCircle className="w-3 h-3 mr-1" />
              Verified with Civic
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Client Role */}
            <Card
              className={`cursor-pointer transition-all hover:shadow-lg border-2 ${
                selectedRole === 'client'
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50'
              }`}
              onClick={() => setSelectedRole('client')}
            >
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  <User className="w-12 h-12 text-primary" />
                </div>
                <CardTitle>I'm a Client</CardTitle>
                <CardDescription>
                  Looking for trusted service providers
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Browse service providers</li>
                  <li>• Book appointments</li>
                  <li>• Rate and review services</li>
                  <li>• Secure payments</li>
                </ul>
              </CardContent>
            </Card>

            {/* Provider Role */}
            <Card
              className={`cursor-pointer transition-all hover:shadow-lg border-2 ${
                selectedRole === 'provider'
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50'
              }`}
              onClick={() => setSelectedRole('provider')}
            >
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  <Building className="w-12 h-12 text-primary" />
                </div>
                <CardTitle>I'm a Service Provider</CardTitle>
                <CardDescription>
                  Offering repair and cleaning services
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Manage your business profile</li>
                  <li>• Accept bookings</li>
                  <li>• Track earnings</li>
                  <li>• Build your reputation</li>
                </ul>
              </CardContent>
            </Card>
          </div>

          <div className="mt-8 text-center">
            <Button
              onClick={() => selectedRole && handleRoleSelection(selectedRole)}
              disabled={!selectedRole || isLoading}
              className="px-8 py-3 text-lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Setting up your account...
                </>
              ) : (
                `Continue as ${selectedRole === 'client' ? 'Client' : selectedRole === 'provider' ? 'Provider' : '...'}`
              )}
            </Button>

            <p className="text-xs text-muted-foreground mt-4">
              You can change your role later in your profile settings
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-accent/10 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Shield className="w-12 h-12 text-primary" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-2">
            Welcome to Konnect
          </h1>
          <p className="text-muted-foreground">
            Connect with trusted service providers across Kenya
          </p>
          <Badge variant="outline" className="mt-2">
            Powered by Civic Auth
          </Badge>
        </div>

        <Card className="shadow-lg border-border">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              <Shield className="w-5 h-5" />
              Secure Authentication
            </CardTitle>
            <CardDescription>
              Sign in or create your account with Civic Auth - the most secure way to authenticate
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>
                  {error.message || 'Authentication failed. Please try again.'}
                </AlertDescription>
              </Alert>
            )}

            <div className="text-center">
              <Button
                onClick={signInWithCivic}
                disabled={isLoading}
                className="w-full h-12 text-lg bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white font-semibold shadow-lg"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Connecting with Civic...
                  </>
                ) : (
                  <>
                    <Shield className="w-5 h-5 mr-2" />
                    Continue with Civic Auth
                  </>
                )}
              </Button>

              <p className="text-xs text-muted-foreground mt-3">
                Secure, decentralized authentication powered by Civic
              </p>
            </div>

            <div className="space-y-4">
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-2">Why Civic Auth?</h3>
                <div className="grid grid-cols-1 gap-3 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>No passwords to remember</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Decentralized identity verification</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Enhanced security & privacy</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>One-click authentication</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 text-center">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="text-muted-foreground hover:text-foreground"
          >
            ← Back to Home
          </Button>
        </div>
      </div>
    </div>
  );
};