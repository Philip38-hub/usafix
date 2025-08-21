import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export interface BookingData {
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
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
  created_at: string;
  updated_at?: string;
}

export interface BookingFormData {
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

interface BookingContextType {
  // Current booking state
  currentBooking: BookingData | null;
  bookings: BookingData[];
  loading: boolean;
  error: string | null;

  // Booking actions
  createBooking: (formData: BookingFormData, clientId: string, clientName: string) => Promise<BookingData>;
  getBooking: (bookingId: string) => BookingData | null;
  getUserBookings: (clientId: string) => BookingData[];
  updateBookingStatus: (bookingId: string, status: BookingData['status']) => void;
  clearError: () => void;
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

interface BookingProviderProps {
  children: ReactNode;
}

export const BookingProvider: React.FC<BookingProviderProps> = ({ children }) => {
  const [currentBooking, setCurrentBooking] = useState<BookingData | null>(null);
  const [bookings, setBookings] = useState<BookingData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load bookings from localStorage on mount
  React.useEffect(() => {
    try {
      const savedBookings = localStorage.getItem('bookings');
      if (savedBookings) {
        const parsedBookings = JSON.parse(savedBookings);
        setBookings(parsedBookings);
      }
    } catch (err) {
      console.error('Error loading bookings from localStorage:', err);
    }
  }, []);

  // Save bookings to localStorage whenever bookings change
  React.useEffect(() => {
    try {
      localStorage.setItem('bookings', JSON.stringify(bookings));
    } catch (err) {
      console.error('Error saving bookings to localStorage:', err);
    }
  }, [bookings]);

  const createBooking = useCallback(async (
    formData: BookingFormData, 
    clientId: string, 
    clientName: string
  ): Promise<BookingData> => {
    setLoading(true);
    setError(null);

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      const newBooking: BookingData = {
        booking_id: `booking_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        client_id: clientId,
        client_name: clientName,
        status: 'pending',
        created_at: new Date().toISOString(),
        ...formData
      };

      setBookings(prev => [...prev, newBooking]);
      setCurrentBooking(newBooking);

      return newBooking;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create booking';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const getBooking = useCallback((bookingId: string): BookingData | null => {
    return bookings.find(booking => booking.booking_id === bookingId) || null;
  }, [bookings]);

  const getUserBookings = useCallback((clientId: string): BookingData[] => {
    return bookings.filter(booking => booking.client_id === clientId);
  }, [bookings]);

  const updateBookingStatus = useCallback((bookingId: string, status: BookingData['status']) => {
    setBookings(prev => 
      prev.map(booking => 
        booking.booking_id === bookingId 
          ? { ...booking, status, updated_at: new Date().toISOString() }
          : booking
      )
    );

    // Update current booking if it matches
    if (currentBooking?.booking_id === bookingId) {
      setCurrentBooking(prev => 
        prev ? { ...prev, status, updated_at: new Date().toISOString() } : null
      );
    }
  }, [currentBooking]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const contextValue: BookingContextType = {
    currentBooking,
    bookings,
    loading,
    error,
    createBooking,
    getBooking,
    getUserBookings,
    updateBookingStatus,
    clearError
  };

  return (
    <BookingContext.Provider value={contextValue}>
      {children}
    </BookingContext.Provider>
  );
};

export const useBooking = (): BookingContextType => {
  const context = useContext(BookingContext);
  if (context === undefined) {
    throw new Error('useBooking must be used within a BookingProvider');
  }
  return context;
};

// Utility functions for booking management
export const getBookingStatusColor = (status: BookingData['status']): string => {
  switch (status) {
    case 'pending': return 'orange';
    case 'confirmed': return 'blue';
    case 'in_progress': return 'purple';
    case 'completed': return 'green';
    case 'cancelled': return 'red';
    default: return 'gray';
  }
};

export const getBookingStatusLabel = (status: BookingData['status']): string => {
  switch (status) {
    case 'pending': return 'Pending Confirmation';
    case 'confirmed': return 'Confirmed';
    case 'in_progress': return 'In Progress';
    case 'completed': return 'Completed';
    case 'cancelled': return 'Cancelled';
    default: return status;
  }
};

export const getUrgencyColor = (urgency: 'low' | 'medium' | 'high'): string => {
  switch (urgency) {
    case 'high': return 'red';
    case 'medium': return 'orange';
    case 'low': return 'green';
    default: return 'gray';
  }
};

export const getUrgencyLabel = (urgency: 'low' | 'medium' | 'high'): string => {
  switch (urgency) {
    case 'high': return 'High Priority';
    case 'medium': return 'Medium Priority';
    case 'low': return 'Low Priority';
    default: return urgency;
  }
};
