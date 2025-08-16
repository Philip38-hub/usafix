import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ServiceProviderCard } from '@/components/ServiceProviderCard';
import { AuthPage } from '@/components/AuthPage';
import { DatabaseStatus } from '@/components/DatabaseStatus'; 
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Search, Filter, MapPin, Grid, List, Menu, User, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

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

const Index = () => {
  const { user, profile, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [providers, setProviders] = useState<ServiceProvider[]>([]);
  const [filteredProviders, setFilteredProviders] = useState<ServiceProvider[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCounty, setSelectedCounty] = useState('');
  const [selectedService, setSelectedService] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showAuth, setShowAuth] = useState(false);
  const [loadingProviders, setLoadingProviders] = useState(true);

  const kenyanCounties = [
    'All Counties', 'Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret'
  ];

  const serviceTypes = [
    'All Services', 'House Cleaning', 'Plumbing', 'Electrical', 'Painting', 'Carpentry'
  ];

  useEffect(() => {
    fetchProviders();
  }, []);

  useEffect(() => {
    filterProviders();
  }, [providers, searchQuery, selectedCounty, selectedService]);

  const fetchProviders = async () => {
    try {
      const { data, error } = await supabase
        .from('service_providers')
        .select('*')
        .order('rating', { ascending: false });

      if (error) throw error;
      setProviders(data || []);
    } catch (error) {
      console.error('Error fetching providers:', error);
      toast({
        title: "Error loading providers",
        description: "Please try again later",
        variant: "destructive"
      });
    } finally {
      setLoadingProviders(false);
    }
  };

  const filterProviders = () => {
    let filtered = providers;

    if (searchQuery) {
      filtered = filtered.filter(provider =>
        provider.business_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        provider.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        provider.services.some(service => 
          service.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    }

    if (selectedCounty && selectedCounty !== 'All Counties') {
      filtered = filtered.filter(provider => provider.county === selectedCounty);
    }

    if (selectedService && selectedService !== 'All Services') {
      filtered = filtered.filter(provider =>
        provider.services.some(service =>
          service.toLowerCase().includes(selectedService.toLowerCase())
        )
      );
    }

    setFilteredProviders(filtered);
  };

  const handleBook = (providerId: string) => {
    if (!user) {
      setShowAuth(true);
      return;
    }
    
    toast({
      title: "Booking initiated",
      description: "Redirecting to booking page...",
    });
    // Navigate to booking page (to be implemented)
  };

  const handleCall = (phoneNumber: string) => {
    window.open(`tel:${phoneNumber}`, '_self');
  };

  const handleWhatsApp = (phoneNumber: string) => {
    const message = encodeURIComponent("Hi! I found your services on Konnect and would like to discuss a job.");
    window.open(`https://wa.me/${phoneNumber.replace(/\D/g, '')}?text=${message}`, '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (showAuth) {
    return <AuthPage defaultTab="signup" />;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Konnect
              </h1>
              <Badge variant="secondary" className="text-xs">
                Kenya's Marketplace
              </Badge>
            </div>

            <div className="flex items-center gap-3">
              {user ? (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    Welcome, {profile?.full_name || 'User'}
                  </span>
                  {profile?.user_type === 'provider' && (
                    <Badge variant="outline" className="text-xs">
                      Provider
                    </Badge>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={signOut}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <LogOut className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={() => setShowAuth(true)}
                  className="bg-primary hover:bg-primary/90"
                >
                  <User className="w-4 h-4 mr-2" />
                  Sign In
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/5 via-accent/5 to-secondary/10 py-12">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Find Trusted Service Providers
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Connect with verified professionals for house repairs, cleaning, and maintenance services across Kenya
          </p>

          {/* Search Bar */}
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row gap-3 bg-card p-4 rounded-lg shadow-sm border border-border">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search for services or providers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 border-border"
                />
              </div>
              
              <Select value={selectedCounty} onValueChange={setSelectedCounty}>
                <SelectTrigger className="w-full md:w-48 border-border">
                  <MapPin className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Location" />
                </SelectTrigger>
                <SelectContent>
                  {kenyanCounties.map((county) => (
                    <SelectItem key={county} value={county}>
                      {county}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedService} onValueChange={setSelectedService}>
                <SelectTrigger className="w-full md:w-48 border-border">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Service" />
                </SelectTrigger>
                <SelectContent>
                  {serviceTypes.map((service) => (
                    <SelectItem key={service} value={service}>
                      {service}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </section>

      {/* Results Section */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-semibold text-foreground">
                Available Service Providers
              </h3>
              <p className="text-muted-foreground text-sm">
                {filteredProviders.length} providers found
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {loadingProviders ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading providers...</p>
            </div>
          ) : filteredProviders.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">
                No service providers found matching your criteria
              </p>
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCounty('');
                  setSelectedService('');
                }}
              >
                Clear Filters
              </Button>
            </div>
          ) : (
            <div className={`grid gap-6 ${
              viewMode === 'grid' 
                ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
                : 'grid-cols-1'
            }`}>
              {filteredProviders.map((provider) => (
                <ServiceProviderCard
                  key={provider.id}
                  provider={provider}
                  onBook={handleBook}
                  onCall={handleCall}
                  onWhatsApp={handleWhatsApp}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Database Status Section - Development Only */}
      <section className="py-8 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex justify-center">
            <DatabaseStatus />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-8 mt-12">
        <div className="container mx-auto px-4 text-center">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-foreground mb-2">Konnect</h3>
            <p className="text-muted-foreground text-sm max-w-md mx-auto">
              Connecting Kenyans with trusted service providers for all your home and business needs.
            </p>
          </div>
          
          <div className="flex flex-wrap justify-center gap-4 text-xs text-muted-foreground">
            <span>© 2024 Konnect Kenya</span>
            <span>•</span>
            <span>Made for Kenya</span>
            <span>•</span>
            <Badge variant="outline" className="text-xs">
              MVP Demo
            </Badge>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
