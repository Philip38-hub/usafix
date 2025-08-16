import React from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Rating } from '@/components/ui/rating';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Phone, MapPin, CheckCircle, MessageCircle } from 'lucide-react';

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

interface ServiceProviderCardProps {
  provider: ServiceProvider;
  onBook: (providerId: string) => void;
  onCall: (phoneNumber: string) => void;
  onWhatsApp: (phoneNumber: string) => void;
}

export const ServiceProviderCard: React.FC<ServiceProviderCardProps> = ({
  provider,
  onBook,
  onCall,
  onWhatsApp
}) => {
  const getServiceLabel = (service: string) => {
    const serviceLabels: Record<string, string> = {
      'house_cleaning': 'House Cleaning',
      'office_cleaning': 'Office Cleaning',
      'deep_cleaning': 'Deep Cleaning',
      'plumbing': 'Plumbing',
      'electrical': 'Electrical',
      'painting': 'Painting',
      'carpentry': 'Carpentry',
      'minor_repairs': 'Minor Repairs'
    };
    return serviceLabels[service] || service;
  };

  return (
    <Card className="hover:shadow-lg transition-shadow duration-300 bg-card border-border">
      <CardContent className="p-4">
        <div className="flex items-start gap-3 mb-3">
          <Avatar className="w-12 h-12">
            <AvatarImage src={provider.profile_image_url} />
            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
              {provider.business_name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-foreground truncate">
                {provider.business_name}
              </h3>
              {provider.is_verified && (
                <CheckCircle className="w-4 h-4 text-success shrink-0" />
              )}
            </div>
            
            <div className="flex items-center gap-1 mb-2">
              <Rating rating={provider.rating} size="sm" />
              <span className="text-xs text-muted-foreground">
                ({provider.total_jobs} jobs)
              </span>
            </div>
            
            <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
              <MapPin className="w-3 h-3" />
              <span>{provider.location}, {provider.county}</span>
            </div>
          </div>
        </div>

        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
          {provider.description}
        </p>

        <div className="flex flex-wrap gap-1 mb-3">
          {provider.services.slice(0, 3).map((service) => (
            <Badge key={service} variant="secondary" className="text-xs">
              {getServiceLabel(service)}
            </Badge>
          ))}
          {provider.services.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{provider.services.length - 3} more
            </Badge>
          )}
        </div>

        <div className="text-sm font-medium text-primary mb-3">
          {provider.price_range}
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0 flex gap-2">
        <Button 
          onClick={() => onBook(provider.user_id)}
          className="flex-1 bg-primary hover:bg-primary/90"
          size="sm"
        >
          Book Now
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => onCall(provider.phone_number)}
          className="border-border"
        >
          <Phone className="w-4 h-4" />
        </Button>
        
        {provider.whatsapp_number && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onWhatsApp(provider.whatsapp_number)}
            className="border-success text-success hover:bg-success/10"
          >
            <MessageCircle className="w-4 h-4" />
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};