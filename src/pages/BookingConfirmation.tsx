import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  CheckCircle, 
  Calendar, 
  Clock, 
  MapPin, 
  Phone, 
  DollarSign, 
  User, 
  Home,
  MessageCircle,
  ArrowLeft,
  Copy,
  ExternalLink
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useBooking } from '@/contexts/BookingContext';

interface BookingData {
  booking_id: string;
  provider_id: string;
  client_id: string;
  client_name: string;
  service_type: string;
  description: string;
  location: string;
  preferred_date: string;
  preferred_time: string;
  client_phone: string;
  urgency: 'low' | 'medium' | 'high';
  budget_range: string;
  estimated_price: number;
  status: string;
  created_at: string;
}

const BookingConfirmation: React.FC = () => {
  const { bookingId } = useParams<{ bookingId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { getBooking } = useBooking();

  const [booking, setBooking] = useState<BookingData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (bookingId) {
      const foundBooking = getBooking(bookingId);

      if (foundBooking) {
        setBooking(foundBooking);
      } else {
        toast({
          title: "Booking Not Found",
          description: "The requested booking could not be found",
          variant: "destructive"
        });
        navigate('/');
      }
    }

    setLoading(false);
  }, [bookingId, navigate, toast, getBooking]);

  const copyBookingId = () => {
    if (booking) {
      navigator.clipboard.writeText(booking.booking_id);
      toast({
        title: "Copied!",
        description: "Booking ID copied to clipboard",
        variant: "default"
      });
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'default';
    }
  };

  const getUrgencyLabel = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'High Priority';
      case 'medium': return 'Medium Priority';
      case 'low': return 'Low Priority';
      default: return urgency;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading booking details...</p>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Booking not found</p>
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
      <header className="bg-card border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/')}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
            <div>
              <h1 className="text-xl font-semibold">Booking Confirmation</h1>
              <p className="text-sm text-muted-foreground">
                Your booking request has been submitted
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          
          {/* Success Alert */}
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              <strong>Booking Request Submitted Successfully!</strong>
              <br />
              The service provider will contact you within 24 hours to confirm the booking and discuss details.
            </AlertDescription>
          </Alert>

          {/* Booking Details */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Booking Details
                  </CardTitle>
                  <CardDescription>
                    Reference ID: {booking.booking_id}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={copyBookingId}
                      className="ml-2 h-6 px-2"
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                  </CardDescription>
                </div>
                <Badge variant="outline" className="text-green-600 border-green-200">
                  Pending Confirmation
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              
              {/* Service Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Service Details</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-muted-foreground" />
                      <span><strong>Service:</strong> {booking.service_type}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={getUrgencyColor(booking.urgency)} className="text-xs">
                        {getUrgencyLabel(booking.urgency)}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Scheduling</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span><strong>Date:</strong> {new Date(booking.preferred_date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span><strong>Time:</strong> {booking.preferred_time}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Location and Contact */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Location</h4>
                  <div className="flex items-start gap-2 text-sm">
                    <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                    <span>{booking.location}</span>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Contact</h4>
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <span>{booking.client_phone}</span>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <h4 className="font-medium mb-2">Job Description</h4>
                <p className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
                  {booking.description}
                </p>
              </div>

              {/* Budget */}
              <div className="flex items-center justify-between p-4 bg-muted rounded-md">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">Budget Range:</span>
                  <span>{booking.budget_range}</span>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Estimated Cost</p>
                  <p className="text-lg font-semibold">KSh {booking.estimated_price.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Next Steps */}
          <Card>
            <CardHeader>
              <CardTitle>What Happens Next?</CardTitle>
              <CardDescription>
                Here's what you can expect after submitting your booking request
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                    1
                  </div>
                  <div>
                    <h4 className="font-medium">Provider Review</h4>
                    <p className="text-sm text-muted-foreground">
                      The service provider will review your request and contact you within 24 hours.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                    2
                  </div>
                  <div>
                    <h4 className="font-medium">Quote & Confirmation</h4>
                    <p className="text-sm text-muted-foreground">
                      They'll provide a detailed quote and confirm the appointment time.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                    3
                  </div>
                  <div>
                    <h4 className="font-medium">Service Delivery</h4>
                    <p className="text-sm text-muted-foreground">
                      The provider will arrive at the scheduled time to complete the work.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button 
              onClick={() => navigate('/')}
              className="flex-1"
            >
              <Home className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
            <Button 
              variant="outline"
              onClick={() => window.open(`tel:${booking.client_phone}`, '_self')}
              className="flex-1"
            >
              <Phone className="w-4 h-4 mr-2" />
              Call Provider
            </Button>
            <Button 
              variant="outline"
              onClick={() => window.open(`https://wa.me/${booking.client_phone.replace('+', '')}`, '_blank')}
              className="flex-1"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              WhatsApp
            </Button>
          </div>

          {/* Support Info */}
          <Alert>
            <MessageCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Need Help?</strong> If you have any questions or need to modify your booking, 
              please contact our support team or reach out to the service provider directly.
            </AlertDescription>
          </Alert>
        </div>
      </main>
    </div>
  );
};

export default BookingConfirmation;
