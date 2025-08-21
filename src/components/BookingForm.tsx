import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Calendar,
  Clock,
  MapPin,
  Phone,
  DollarSign,
  AlertCircle,
  CheckCircle,
  User,
  Home
} from 'lucide-react';

// Booking form validation schema
const bookingSchema = z.object({
  service_type: z.string().min(1, 'Please select a service'),
  description: z.string()
    .min(10, 'Please provide at least 10 characters describing your needs')
    .max(500, 'Description must be less than 500 characters'),
  location: z.string().min(5, 'Please provide a detailed location'),
  preferred_date: z.string().min(1, 'Please select a preferred date'),
  preferred_time: z.string().min(1, 'Please select a preferred time'),
  client_phone: z.string()
    .regex(/^(\+254|0)[17]\d{8}$/, 'Please enter a valid Kenyan phone number'),
  urgency: z.enum(['low', 'medium', 'high']),
  budget_range: z.string().min(1, 'Please select your budget range')
});

type BookingFormData = z.infer<typeof bookingSchema>;

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

interface BookingFormProps {
  provider: ServiceProvider;
  onSubmit: (data: BookingFormData & { provider_id: string; estimated_price: number }) => void;
  onCancel: () => void;
  loading?: boolean;
}

export const BookingForm: React.FC<BookingFormProps> = ({
  provider,
  onSubmit,
  onCancel,
  loading = false
}) => {
  const [estimatedPrice, setEstimatedPrice] = useState<number>(0);

  const form = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      service_type: '',
      description: '',
      location: '',
      preferred_date: '',
      preferred_time: '',
      client_phone: '',
      urgency: 'medium',
      budget_range: ''
    }
  });

  // Time slots for booking
  const timeSlots = [
    '08:00', '09:00', '10:00', '11:00', '12:00',
    '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'
  ];

  // Budget ranges
  const budgetRanges = [
    { value: '1000-3000', label: 'KSh 1,000 - 3,000', min: 1000, max: 3000 },
    { value: '3000-5000', label: 'KSh 3,000 - 5,000', min: 3000, max: 5000 },
    { value: '5000-10000', label: 'KSh 5,000 - 10,000', min: 5000, max: 10000 },
    { value: '10000-20000', label: 'KSh 10,000 - 20,000', min: 10000, max: 20000 },
    { value: '20000+', label: 'KSh 20,000+', min: 20000, max: 50000 }
  ];

  // Calculate estimated price based on form data
  useEffect(() => {
    const subscription = form.watch((value) => {
      const { service_type, urgency, budget_range } = value;
      
      if (service_type && budget_range) {
        const selectedBudget = budgetRanges.find(b => b.value === budget_range);
        if (selectedBudget) {
          let basePrice = (selectedBudget.min + selectedBudget.max) / 2;
          
          // Adjust price based on urgency
          if (urgency === 'high') {
            basePrice *= 1.2; // 20% increase for urgent jobs
          } else if (urgency === 'low') {
            basePrice *= 0.9; // 10% discount for flexible timing
          }
          
          setEstimatedPrice(Math.round(basePrice));
        }
      }
    });
    
    return () => subscription.unsubscribe();
  }, [form]);

  // Get minimum date (today)
  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  // Get maximum date (30 days from now)
  const getMaxDate = () => {
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 30);
    return maxDate.toISOString().split('T')[0];
  };

  const handleSubmit = (data: BookingFormData) => {
    onSubmit({
      ...data,
      provider_id: provider.id,
      estimated_price: estimatedPrice
    });
  };

  return (
    <div className="space-y-6">
      {/* Provider Summary */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">{provider.business_name}</CardTitle>
              <CardDescription className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                {provider.location}, {provider.county}
                {provider.is_verified && (
                  <Badge variant="secondary" className="text-xs">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Verified
                  </Badge>
                )}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>⭐ {provider.rating}/5.0</span>
            <span>📋 {provider.total_jobs} jobs completed</span>
            <span>💰 {provider.price_range}</span>
          </div>
        </CardContent>
      </Card>

      {/* Booking Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Book This Service
          </CardTitle>
          <CardDescription>
            Fill in the details below to request a booking
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
              {/* Service Selection */}
              <FormField
                control={form.control}
                name="service_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Service Needed *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a service" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {provider.services.map((service) => (
                          <SelectItem key={service} value={service}>
                            {service}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Description */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Job Description *</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Describe what you need done, any specific requirements, materials needed, etc."
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Be as detailed as possible to get an accurate quote
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Location */}
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Home className="w-4 h-4" />
                      Service Location *
                    </FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Enter your full address (building, street, area, landmarks)"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Include building name, floor, and any helpful landmarks
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Date and Time */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="preferred_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Preferred Date *</FormLabel>
                      <FormControl>
                        <Input 
                          type="date"
                          min={getMinDate()}
                          max={getMaxDate()}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="preferred_time"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Preferred Time *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select time" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {timeSlots.map((time) => (
                            <SelectItem key={time} value={time}>
                              {time}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Phone and Urgency */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="client_phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        Your Phone Number *
                      </FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="+254712345678"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        For booking confirmations and updates
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="urgency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Urgency Level</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="low">Low - Flexible timing</SelectItem>
                          <SelectItem value="medium">Medium - Within a few days</SelectItem>
                          <SelectItem value="high">High - ASAP (+20% fee)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Budget Range */}
              <FormField
                control={form.control}
                name="budget_range"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4" />
                      Budget Range *
                    </FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select your budget range" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {budgetRanges.map((range) => (
                          <SelectItem key={range.value} value={range.value}>
                            {range.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      This helps the provider give you an accurate quote
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Price Estimate */}
              {estimatedPrice > 0 && (
                <Alert>
                  <DollarSign className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Estimated Cost: KSh {estimatedPrice.toLocaleString()}</strong>
                    <br />
                    <span className="text-sm text-muted-foreground">
                      This is an estimate. Final price will be confirmed by the provider.
                    </span>
                  </AlertDescription>
                </Alert>
              )}

              {/* Form Actions */}
              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                  disabled={loading}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex-1"
                >
                  {loading ? 'Submitting...' : 'Submit Booking Request'}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};
