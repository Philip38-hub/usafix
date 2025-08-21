import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { BookingForm } from '@/components/BookingForm';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useBooking } from '@/contexts/BookingContext';
import { getServiceProviderById } from '@/services/dbService';

interface ServiceProvider {
  id: string;
  user_id: string;
  business_name: string;
  description: string;
  services: string[];
  location: string;
  county: string;
  price_range: string;
  phone_number: string;
  whatsapp_number: string;
  is_verified: boolean;
  rating: number;
  total_jobs: number;
  profile_image_url?: string;
}

interface BookingFormData {
  service_type: string;
  description: string;
  location: string;
  preferred_date: string;
  preferred_time: string;
  client_phone: string;
  urgency: 'low' | 'medium' | 'high';
  budget_range: string;
  provider_id: string;
  estimated_price: number;
}

const BookingPage: React.FC = () => {
  const { providerId } = useParams<{ providerId: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, profile } = useAuth();
  const { toast } = useToast();
  const { createBooking, loading: bookingLoading } = useBooking();
  
  const [provider, setProvider] = useState<ServiceProvider | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Fetch provider data from database

  useEffect(() => {
    const fetchProvider = async () => {
      // Check authentication
      if (!isAuthenticated) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to book a service",
          variant: "destructive"
        });
        navigate('/auth');
        return;
      }

      // Fetch provider by ID from database
      if (providerId) {
        try {
          console.log('🔍 Fetching provider with ID:', providerId);
          console.log('🔍 Provider ID type:', typeof providerId);
          console.log('🔍 Provider ID length:', providerId.length);
          const foundProvider = await getServiceProviderById(providerId);

          if (foundProvider) {
            console.log('✅ Provider found:', foundProvider);
            setProvider(foundProvider);
          } else {
            console.log('❌ Provider not found for ID:', providerId);
            toast({
              title: "Provider Not Found",
              description: "The requested service provider could not be found",
              variant: "destructive"
            });
            navigate('/');
          }
        } catch (error) {
          console.error('❌ Error fetching provider:', error);
          toast({
            title: "Error Loading Provider",
            description: "There was an error loading the service provider details",
            variant: "destructive"
          });
          navigate('/');
        }
      }

      setLoading(false);
    };

    fetchProvider();
  }, [providerId, isAuthenticated, navigate, toast]);

  const handleBookingSubmit = async (data: BookingFormData) => {
    if (!profile?.id || !profile?.full_name) {
      toast({
        title: "Profile Required",
        description: "Please complete your profile before booking a service.",
        variant: "destructive"
      });
      navigate('/profile');
      return;
    }

    setSubmitting(true);

    try {
      const newBooking = await createBooking(data, profile.id, profile.full_name);

      toast({
        title: "Booking Request Submitted!",
        description: `Your booking request has been sent to ${provider?.business_name}. They will contact you shortly.`,
        variant: "default"
      });

      // Navigate to confirmation page
      navigate(`/booking/confirmation/${newBooking.booking_id}`);

    } catch (error) {
      console.error('Booking submission error:', error);
      toast({
        title: "Booking Failed",
        description: "There was an error submitting your booking. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate(-1);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading booking form...</p>
        </div>
      </div>
    );
  }

  if (!provider) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Provider not found</p>
          <Button onClick={() => navigate('/')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCancel}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-xl font-semibold">Book Service</h1>
              <p className="text-sm text-muted-foreground">
                Request a booking with {provider.business_name}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <BookingForm
            provider={provider}
            onSubmit={handleBookingSubmit}
            onCancel={handleCancel}
            loading={submitting}
          />
        </div>
      </main>
    </div>
  );
};

export default BookingPage;
