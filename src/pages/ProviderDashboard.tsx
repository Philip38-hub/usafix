import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  Star, 
  Users, 
  DollarSign, 
  Settings, 
  LogOut,
  ArrowLeft,
  Clock,
  CheckCircle
} from 'lucide-react';

const ProviderDashboard = () => {
  const { profile, signOut, civicUser, authMethod } = useAuth();
  const navigate = useNavigate();

  const mockStats = {
    totalBookings: 24,
    completedJobs: 18,
    averageRating: 4.8,
    monthlyEarnings: 45000
  };

  const mockUpcomingBookings = [
    {
      id: '1',
      clientName: 'Mary Wanjiku',
      service: 'House Cleaning',
      date: '2024-08-17',
      time: '10:00 AM',
      location: 'Westlands, Nairobi'
    },
    {
      id: '2',
      clientName: 'John Mwangi',
      service: 'Plumbing Repair',
      date: '2024-08-18',
      time: '2:00 PM',
      location: 'Karen, Nairobi'
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={() => navigate('/')}
                className="text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Marketplace
              </Button>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Provider Dashboard
              </h1>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm font-medium">
                  {profile?.full_name || civicUser?.name || 'Provider'}
                </p>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {authMethod === 'civic' ? 'Civic Auth' : 'Email'}
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    Provider
                  </Badge>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={signOut}
                className="text-muted-foreground hover:text-foreground"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Profile Completion Alert */}
        {(!profile?.full_name || profile.full_name === 'Civic User') && (
          <Alert className="mb-6 border-orange-200 bg-orange-50">
            <Users className="h-4 w-4" />
            <AlertDescription>
              <strong>Complete your profile</strong> to get more bookings and build trust with clients.{' '}
              <Button
                variant="link"
                className="p-0 h-auto font-semibold text-orange-600 hover:text-orange-700"
                onClick={() => navigate('/profile')}
              >
                Update your profile now →
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">
            Welcome back, {profile?.full_name || civicUser?.name || 'Provider'}!
          </h2>
          <p className="text-muted-foreground">
            Manage your services, bookings, and grow your business.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockStats.totalBookings}</div>
              <p className="text-xs text-muted-foreground">
                +2 from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed Jobs</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockStats.completedJobs}</div>
              <p className="text-xs text-muted-foreground">
                75% completion rate
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockStats.averageRating}</div>
              <p className="text-xs text-muted-foreground">
                Based on 15 reviews
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Earnings</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">KSH {mockStats.monthlyEarnings.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                +12% from last month
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upcoming Bookings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Upcoming Bookings
              </CardTitle>
              <CardDescription>
                Your scheduled appointments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockUpcomingBookings.map((booking) => (
                  <div key={booking.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">{booking.clientName}</p>
                      <p className="text-sm text-muted-foreground">{booking.service}</p>
                      <p className="text-sm text-muted-foreground">{booking.location}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{booking.date}</p>
                      <p className="text-sm text-muted-foreground">{booking.time}</p>
                      <Badge variant="outline" className="mt-1">
                        Confirmed
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
              <Button className="w-full mt-4" variant="outline">
                View All Bookings
              </Button>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Quick Actions
              </CardTitle>
              <CardDescription>
                Manage your provider profile
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Button
                  className="w-full justify-start"
                  variant="outline"
                  onClick={() => navigate('/profile')}
                >
                  <Users className="h-4 w-4 mr-2" />
                  Update Profile
                  {(!profile?.full_name || profile.full_name === 'Civic User') && (
                    <Badge variant="secondary" className="ml-auto">
                      Incomplete
                    </Badge>
                  )}
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Calendar className="h-4 w-4 mr-2" />
                  Manage Availability
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <DollarSign className="h-4 w-4 mr-2" />
                  Update Pricing
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Star className="h-4 w-4 mr-2" />
                  View Reviews
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Authentication Method Info */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Authentication Status</CardTitle>
            <CardDescription>
              Your current authentication method and security status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">
                  Signed in with {authMethod === 'civic' ? 'Civic Auth' : 'Email/Password'}
                </p>
                <p className="text-sm text-muted-foreground">
                  {authMethod === 'civic' 
                    ? 'Secure decentralized identity verification' 
                    : 'Traditional email authentication'
                  }
                </p>
              </div>
              <Badge variant={authMethod === 'civic' ? 'default' : 'secondary'}>
                {authMethod === 'civic' ? 'Verified' : 'Standard'}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProviderDashboard;