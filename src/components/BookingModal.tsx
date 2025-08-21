import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { BookingForm } from './BookingForm';
import { ScrollArea } from '@/components/ui/scroll-area';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

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

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  provider: ServiceProvider | null;
  onSubmit: (data: BookingFormData) => void;
  loading?: boolean;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  isOpen,
  onClose,
  provider,
  onSubmit,
  loading = false
}) => {
  if (!provider) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0">
        <DialogHeader className="p-6 pb-0">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl">
                Book Service with {provider.business_name}
              </DialogTitle>
              <DialogDescription>
                Fill out the form below to request a booking
              </DialogDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>
        
        <ScrollArea className="max-h-[calc(90vh-120px)] px-6 pb-6">
          <BookingForm
            provider={provider}
            onSubmit={onSubmit}
            onCancel={onClose}
            loading={loading}
          />
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
