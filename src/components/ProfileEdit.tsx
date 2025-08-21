import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
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
  Loader2, 
  User, 
  Phone, 
  MapPin, 
  Camera, 
  ArrowLeft,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

// Form validation schema
const profileSchema = z.object({
  full_name: z.string()
    .min(2, 'Full name must be at least 2 characters')
    .max(100, 'Full name must be less than 100 characters')
    .regex(/^[a-zA-Z\s]+$/, 'Full name can only contain letters and spaces'),
  phone_number: z.string()
    .regex(/^(\+254|0)[17]\d{8}$/, 'Please enter a valid Kenyan phone number (e.g., +254712345678 or 0712345678)')
    .optional()
    .or(z.literal('')),
  location: z.string()
    .min(2, 'Location must be at least 2 characters')
    .max(100, 'Location must be less than 100 characters'),
  avatar_url: z.string().url('Please enter a valid URL').optional().or(z.literal(''))
});

type ProfileFormData = z.infer<typeof profileSchema>;

interface ProfileEditProps {
  onComplete?: () => void;
  showBackButton?: boolean;
  title?: string;
  description?: string;
}

export const ProfileEdit: React.FC<ProfileEditProps> = ({
  onComplete,
  showBackButton = true,
  title = "Complete Your Profile",
  description = "Please provide your details to complete your registration"
}) => {
  const { profile, civicUser, updateProfile, loading: authLoading, userRole } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // Kenyan counties for location selection
  const kenyanCounties = [
    'Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret', 'Thika', 'Malindi',
    'Kitale', 'Garissa', 'Kakamega', 'Machakos', 'Meru', 'Nyeri', 'Kericho',
    'Embu', 'Migori', 'Homa Bay', 'Naivasha', 'Voi', 'Wajir', 'Marsabit',
    'Isiolo', 'Maralal', 'Kapenguria', 'Bungoma', 'Webuye', 'Busia', 'Siaya',
    'Kisii', 'Keroka', 'Nyamira', 'Bomet', 'Sotik', 'Narok', 'Kilgoris',
    'Kajiado', 'Loitokitok', 'Makueni', 'Wote', 'Kitui', 'Mwingi', 'Tharaka',
    'Chuka', 'Runyenjes', 'Nanyuki', 'Nyahururu', 'Murang\'a', 'Kenol'
  ];

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: '',
      phone_number: '',
      location: 'Nairobi',
      avatar_url: ''
    }
  });

  // Initialize form with existing profile data
  useEffect(() => {
    if (profile) {
      form.reset({
        full_name: profile.full_name || '',
        phone_number: profile.phone_number || '',
        location: profile.location || 'Nairobi',
        avatar_url: profile.avatar_url || ''
      });
    }
  }, [profile, form]);

  const onSubmit = async (data: ProfileFormData) => {
    if (!updateProfile) {
      toast({
        title: "Error",
        description: "Profile update function not available",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      await updateProfile({
        full_name: data.full_name,
        phone_number: data.phone_number || null,
        location: data.location,
        avatar_url: data.avatar_url || null
      });

      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated!",
        variant: "default"
      });

      if (onComplete) {
        onComplete();
      } else {
        // Navigate to appropriate dashboard based on user role
        if (userRole === 'provider') {
          navigate('/provider/dashboard');
        } else {
          navigate('/');
        }
      }
    } catch (error) {
      console.error('Profile update error:', error);
      toast({
        title: "Update Failed",
        description: "Failed to update profile. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  // Check if profile is incomplete (has default "Civic User" name)
  const isIncompleteProfile = profile?.full_name === 'Civic User' || !profile?.full_name;

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-accent/10 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <User className="w-12 h-12 text-primary" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-2">
            {title}
          </h1>
          <p className="text-muted-foreground mb-4">
            {description}
          </p>
          
          {/* Status indicators */}
          <div className="flex items-center justify-center gap-2 mb-4">
            <Badge variant="outline">
              Authenticated with Civic
            </Badge>
            {isIncompleteProfile && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                Profile Incomplete
              </Badge>
            )}
          </div>

          {civicUser && (
            <p className="text-sm text-muted-foreground">
              Signed in as: {civicUser.email}
            </p>
          )}
        </div>

        {/* Profile Form */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Profile Information
                </CardTitle>
                <CardDescription>
                  Update your personal information and preferences
                </CardDescription>
              </div>
              {showBackButton && (
                <Button variant="outline" size="sm" onClick={handleBack}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Full Name */}
                <FormField
                  control={form.control}
                  name="full_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        Full Name *
                      </FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter your full name" 
                          {...field}
                          disabled={loading}
                        />
                      </FormControl>
                      <FormDescription>
                        Your full name as you'd like it to appear to other users
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Phone Number */}
                <FormField
                  control={form.control}
                  name="phone_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        Phone Number
                      </FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="+254712345678 or 0712345678" 
                          {...field}
                          disabled={loading}
                        />
                      </FormControl>
                      <FormDescription>
                        Your phone number for booking confirmations and communication
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
                        <MapPin className="w-4 h-4" />
                        Location *
                      </FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value} disabled={loading}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select your location" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {kenyanCounties.map((county) => (
                            <SelectItem key={county} value={county}>
                              {county}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Your primary location for service delivery
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Avatar URL */}
                <FormField
                  control={form.control}
                  name="avatar_url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Camera className="w-4 h-4" />
                        Profile Picture URL
                      </FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="https://example.com/your-photo.jpg" 
                          {...field}
                          disabled={loading}
                        />
                      </FormControl>
                      <FormDescription>
                        Optional: URL to your profile picture
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Submit Button */}
                <div className="flex justify-end pt-4">
                  <Button 
                    type="submit" 
                    disabled={loading}
                    className="px-8"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Updating Profile...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Update Profile
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
