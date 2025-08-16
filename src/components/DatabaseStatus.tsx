import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Database, RefreshCw, CheckCircle, XCircle } from 'lucide-react';

interface DatabaseStats {
  users: number;
  clients: number;
  providers: number;
  service_providers: number;
  bookings: number;
  ratings: number;
}

interface DatabaseHealth {
  healthy: boolean;
  stats: DatabaseStats;
  error?: string;
}

export function DatabaseStatus() {
  const [health, setHealth] = useState<DatabaseHealth>({
    healthy: false,
    stats: {
      users: 0,
      clients: 0,
      providers: 0,
      service_providers: 0,
      bookings: 0,
      ratings: 0
    }
  });
  const [isLoading, setIsLoading] = useState(true);

  // Mock function to simulate database health check
  // In a real implementation, this would call the actual database service
  const checkHealth = async () => {
    setIsLoading(true);
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Mock successful response with realistic data
      setHealth({
        healthy: true,
        stats: {
          users: 50,
          clients: 36,
          providers: 14,
          service_providers: 14,
          bookings: 100,
          ratings: 59
        }
      });
    } catch (error) {
      setHealth({
        healthy: false,
        stats: {
          users: 0,
          clients: 0,
          providers: 0,
          service_providers: 0,
          bookings: 0,
          ratings: 0
        },
        error: 'Failed to connect to database'
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkHealth();
  }, []);

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Database Status
        </CardTitle>
        <CardDescription>
          Local SQLite database with Kenyan marketplace mock data
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {health.healthy ? (
              <CheckCircle className="h-5 w-5 text-green-500" />
            ) : (
              <XCircle className="h-5 w-5 text-red-500" />
            )}
            <span className="font-medium">
              {health.healthy ? 'Connected' : 'Disconnected'}
            </span>
            <Badge variant={health.healthy ? 'default' : 'destructive'}>
              {health.healthy ? 'Healthy' : 'Error'}
            </Badge>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={checkHealth}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {health.error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{health.error}</p>
          </div>
        )}

        {health.healthy && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {health.stats.users}
              </div>
              <div className="text-sm text-blue-600">Total Users</div>
            </div>
            
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {health.stats.clients}
              </div>
              <div className="text-sm text-green-600">Clients</div>
            </div>
            
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {health.stats.providers}
              </div>
              <div className="text-sm text-purple-600">Providers</div>
            </div>
            
            <div className="text-center p-3 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">
                {health.stats.bookings}
              </div>
              <div className="text-sm text-orange-600">Bookings</div>
            </div>
            
            <div className="text-center p-3 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">
                {health.stats.ratings}
              </div>
              <div className="text-sm text-yellow-600">Ratings</div>
            </div>
            
            <div className="text-center p-3 bg-indigo-50 rounded-lg">
              <div className="text-2xl font-bold text-indigo-600">
                {Math.round((health.stats.ratings / health.stats.bookings) * 100)}%
              </div>
              <div className="text-sm text-indigo-600">Rated</div>
            </div>
          </div>
        )}

        <div className="text-xs text-gray-500 space-y-1">
          <p>• Database: SQLite (data/marketplace.db)</p>
          <p>• Mock data includes Kenyan names, locations, and services</p>
          <p>• Supports users, service providers, bookings, and ratings</p>
        </div>
      </CardContent>
    </Card>
  );
}