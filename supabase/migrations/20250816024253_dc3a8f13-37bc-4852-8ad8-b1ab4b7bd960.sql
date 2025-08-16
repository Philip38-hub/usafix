-- Create profiles table for user information
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  full_name TEXT,
  phone_number TEXT,
  location TEXT,
  user_type TEXT CHECK (user_type IN ('client', 'provider')) NOT NULL DEFAULT 'client',
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create service_providers table
CREATE TABLE public.service_providers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(user_id),
  business_name TEXT NOT NULL,
  description TEXT,
  services TEXT[] NOT NULL, -- Array of services like ['cleaning', 'plumbing', 'electrical']
  location TEXT NOT NULL,
  county TEXT NOT NULL,
  price_range TEXT, -- e.g., 'KSH 1,000 - 5,000'
  phone_number TEXT NOT NULL,
  whatsapp_number TEXT,
  is_verified BOOLEAN DEFAULT false,
  rating DECIMAL(2,1) DEFAULT 0.0,
  total_jobs INTEGER DEFAULT 0,
  profile_image_url TEXT,
  gallery_images TEXT[], -- Array of image URLs
  availability_hours JSONB, -- JSON for working hours
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create bookings table
CREATE TABLE public.bookings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES public.profiles(user_id),
  provider_id UUID NOT NULL REFERENCES public.service_providers(user_id),
  service_type TEXT NOT NULL,
  description TEXT NOT NULL,
  location TEXT NOT NULL,
  preferred_date TIMESTAMP WITH TIME ZONE,
  estimated_price DECIMAL(10,2),
  final_price DECIMAL(10,2),
  payment_method TEXT CHECK (payment_method IN ('mpesa', 'cash', 'bank_transfer')) DEFAULT 'mpesa',
  payment_status TEXT CHECK (payment_status IN ('pending', 'paid', 'failed')) DEFAULT 'pending',
  booking_status TEXT CHECK (booking_status IN ('pending', 'confirmed', 'in_progress', 'completed', 'cancelled')) DEFAULT 'pending',
  mpesa_transaction_id TEXT,
  client_phone TEXT,
  provider_phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create reviews table
CREATE TABLE public.reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id UUID NOT NULL REFERENCES public.bookings(id),
  client_id UUID NOT NULL REFERENCES public.profiles(user_id),
  provider_id UUID NOT NULL REFERENCES public.service_providers(user_id),
  rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

-- RLS Policies for service_providers
CREATE POLICY "Anyone can view service providers" ON public.service_providers FOR SELECT USING (true);
CREATE POLICY "Providers can update their own profile" ON public.service_providers FOR UPDATE USING (auth.uid()::text = user_id::text);
CREATE POLICY "Providers can insert their own profile" ON public.service_providers FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

-- RLS Policies for bookings
CREATE POLICY "Users can view their own bookings" ON public.bookings FOR SELECT USING (
  auth.uid()::text = client_id::text OR 
  auth.uid()::text = provider_id::text
);
CREATE POLICY "Clients can create bookings" ON public.bookings FOR INSERT WITH CHECK (auth.uid()::text = client_id::text);
CREATE POLICY "Users can update their own bookings" ON public.bookings FOR UPDATE USING (
  auth.uid()::text = client_id::text OR 
  auth.uid()::text = provider_id::text
);

-- RLS Policies for reviews
CREATE POLICY "Anyone can view reviews" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Clients can create reviews for their bookings" ON public.reviews FOR INSERT WITH CHECK (auth.uid()::text = client_id::text);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_service_providers_updated_at
  BEFORE UPDATE ON public.service_providers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at
  BEFORE UPDATE ON public.bookings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function to update provider rating after review
CREATE OR REPLACE FUNCTION public.update_provider_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.service_providers
  SET rating = (
    SELECT AVG(rating)::DECIMAL(2,1)
    FROM public.reviews
    WHERE provider_id = NEW.provider_id
  )
  WHERE user_id = NEW.provider_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update provider rating after review
CREATE TRIGGER update_provider_rating_trigger
  AFTER INSERT ON public.reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.update_provider_rating();

-- Insert sample data for testing
INSERT INTO public.profiles (user_id, full_name, phone_number, location, user_type) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'John Kamau', '+254701234567', 'Nairobi', 'provider'),
('550e8400-e29b-41d4-a716-446655440002', 'Mary Wanjiku', '+254702345678', 'Mombasa', 'provider'),
('550e8400-e29b-41d4-a716-446655440003', 'Peter Ochieng', '+254703456789', 'Kisumu', 'provider'),
('550e8400-e29b-41d4-a716-446655440004', 'Grace Akinyi', '+254704567890', 'Nairobi', 'client'),
('550e8400-e29b-41d4-a716-446655440005', 'David Mwangi', '+254705678901', 'Nakuru', 'provider');

INSERT INTO public.service_providers (user_id, business_name, description, services, location, county, price_range, phone_number, whatsapp_number, is_verified, rating, total_jobs) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'Kamau House Repairs', 'Professional house repair services with 5+ years experience', ARRAY['plumbing', 'electrical', 'painting'], 'Westlands, Nairobi', 'Nairobi', 'KSH 2,000 - 15,000', '+254701234567', '+254701234567', true, 4.8, 45),
('550e8400-e29b-41d4-a716-446655440002', 'Wanjiku Cleaning Services', 'Reliable home and office cleaning services', ARRAY['house_cleaning', 'office_cleaning', 'deep_cleaning'], 'Nyali, Mombasa', 'Mombasa', 'KSH 1,500 - 8,000', '+254702345678', '+254702345678', true, 4.6, 32),
('550e8400-e29b-41d4-a716-446655440003', 'Ochieng Handyman', 'Quick fixes and maintenance for your home', ARRAY['carpentry', 'painting', 'minor_repairs'], 'Milimani, Kisumu', 'Kisumu', 'KSH 1,000 - 5,000', '+254703456789', '+254703456789', false, 4.2, 18),
('550e8400-e29b-41d4-a716-446655440005', 'Mwangi Multi Services', 'Complete home maintenance solutions', ARRAY['plumbing', 'electrical', 'cleaning', 'painting'], 'Milimani, Nakuru', 'Nakuru', 'KSH 1,800 - 12,000', '+254705678901', '+254705678901', true, 4.9, 67);