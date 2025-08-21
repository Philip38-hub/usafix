import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getServiceProviders, getServiceProviderById } from '@/services/dbService';
import { useNavigate } from 'react-router-dom';

const TestBooking: React.FC = () => {
  const [providers, setProviders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [testResult, setTestResult] = useState<string>('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getServiceProviders();
        setProviders(data || []);
        console.log('Fetched providers:', data);
      } catch (error) {
        console.error('Error fetching providers:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const testProviderFetch = async (providerId: string) => {
    try {
      setTestResult('Testing...');
      console.log('Testing provider fetch for ID:', providerId);
      
      const provider = await getServiceProviderById(providerId);
      
      if (provider) {
        setTestResult(`✅ Success: Found ${provider.business_name}`);
        console.log('Test successful:', provider);
      } else {
        setTestResult(`❌ Failed: Provider not found`);
        console.log('Test failed: Provider not found');
      }
    } catch (error) {
      setTestResult(`❌ Error: ${error.message}`);
      console.error('Test error:', error);
    }
  };

  const testBookingNavigation = (providerId: string) => {
    console.log('Testing booking navigation for provider:', providerId);
    navigate(`/booking/${providerId}`);
  };

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Booking Flow Test Page</h1>
      
      <div className="mb-6">
        <Button onClick={() => navigate('/')} variant="outline">
          ← Back to Home
        </Button>
      </div>

      <div className="grid gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Database Providers ({providers.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {providers.length === 0 ? (
              <p>No providers found in database</p>
            ) : (
              <div className="space-y-4">
                {providers.map((provider, index) => (
                  <div key={provider.id} className="border p-4 rounded">
                    <h3 className="font-semibold">{provider.business_name}</h3>
                    <p className="text-sm text-gray-600">ID: {provider.id}</p>
                    <p className="text-sm text-gray-600">User ID: {provider.user_id}</p>
                    <p className="text-sm text-gray-600">Location: {provider.location}</p>
                    <p className="text-sm text-gray-600">Services: {JSON.stringify(provider.services)}</p>
                    
                    <div className="mt-2 space-x-2">
                      <Button 
                        size="sm" 
                        onClick={() => testProviderFetch(provider.id)}
                      >
                        Test Fetch
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => testBookingNavigation(provider.id)}
                      >
                        Test Booking
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {testResult && (
          <Card>
            <CardHeader>
              <CardTitle>Test Result</CardTitle>
            </CardHeader>
            <CardContent>
              <p>{testResult}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default TestBooking;
