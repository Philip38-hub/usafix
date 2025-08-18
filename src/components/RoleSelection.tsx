import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { Building, User, Loader2, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const RoleSelection: React.FC = () => {
  const { updateUserRole, civicUser, isAuthenticated, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<'client' | 'provider' | null>(null);
  const navigate = useNavigate();

  // Check if user is still authenticated, redirect to auth if not
  React.useEffect(() => {
    if (!isAuthenticated) {
      console.log('User not authenticated, redirecting to auth page');
      navigate('/auth');
    }
  }, [isAuthenticated, navigate]);

  const handleRoleSelection = async (role: 'client' | 'provider') => {
    setLoading(true);

    try {
      // If user is authenticated, try to update role normally
      if (isAuthenticated && civicUser) {
        await updateUserRole(role);
      } else {
        // If user is not authenticated but we're on role selection page,
        // it means they were authenticated recently but lost session
        // Store the role selection for when they re-authenticate
        console.log('User not authenticated, storing role selection for later');
        localStorage.setItem('pending_role_selection', role);

        // Redirect to auth page
        navigate('/auth');
        return;
      }

      // Navigate based on selected role
      if (role === 'provider') {
        navigate('/provider/dashboard');
      } else {
        navigate('/');
      }
    } catch (error) {
      console.error('Error updating role:', error);

      // Store role selection as fallback
      localStorage.setItem('pending_role_selection', role);

      // Redirect to auth page to re-authenticate
      navigate('/auth');
    } finally {
      setLoading(false);
    }
  };

  // Show loading state while authentication is being checked
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your profile...</p>
        </div>
      </div>
    );
  }

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
            Hi {civicUser?.name || 'there'}! Please select your role to continue.
          </p>
          <Badge variant="outline" className="mt-2">
            Authenticated with Civic
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
            disabled={!selectedRole || loading}
            className="px-8 py-3 text-lg"
          >
            {loading ? (
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
};