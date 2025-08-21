# 🔗 Usafix - Kenya's Premier Service Marketplace

**Connecting Kenyans with trusted service providers across the country**

A modern web application that bridges the gap between service seekers and professional service providers in Kenya and Africa. Built with React, TypeScript, and Supabase, it offers a seamless platform for booking home repairs, cleaning services, and maintenance across Kenya.

## 🌟 Features

### ✅ **Completed Features**

#### 🔐 **Authentication & User Management**
- **Civic Auth Integration**: Secure authentication using Civic's blockchain-based identity verification
- **Role-Based Access**: Separate dashboards and experiences for clients and service providers
- **Profile Management**: Complete profile editing with validation for Kenyan phone numbers and locations
- **Profile Completion Flow**: Automatic detection and redirection for incomplete profiles

#### 👥 **User Profiles**
- **Comprehensive Profile System**: Full name, phone number, location, and avatar support
- **Kenyan-Specific Validation**: Phone number validation for Kenyan formats (+254/07xx)
- **Location Support**: Dropdown with all Kenyan counties
- **Profile Completion Tracking**: Smart detection of incomplete profiles (e.g., "Civic User" defaults)

#### 🏪 **Service Provider Management**
- **Provider Listings**: Browse verified service providers with ratings and reviews
- **Service Categories**: House cleaning, plumbing, electrical, painting, carpentry, and more
- **Location-Based Search**: Filter providers by county and location
- **Provider Verification**: Verified badge system for trusted providers
- **Rating System**: 5-star rating system with job completion tracking

#### 📅 **Booking System (Frontend Complete)**
- **Comprehensive Booking Form**: Service selection, date/time picker, location details
- **Smart Price Estimation**: Real-time price calculation based on service type, urgency, and budget
- **Urgency Levels**: Low, medium, high priority with pricing adjustments
- **Form Validation**: Complete validation including Kenyan phone numbers and required fields
- **Booking Confirmation**: Professional confirmation page with booking details and next steps
- **State Management**: Booking context with localStorage persistence

#### 🎨 **User Interface**
- **Modern Design**: Clean, responsive UI built with Tailwind CSS and shadcn/ui
- **Mobile-First**: Fully responsive design optimized for mobile devices
- **Dark/Light Mode**: Automatic theme detection and switching
- **Professional Styling**: Consistent design language throughout the application
- **Loading States**: Proper loading indicators and error handling

#### 🗄️ **Database & Backend**
- **Supabase Integration**: PostgreSQL database with real-time capabilities
- **Profile Management**: Complete CRUD operations for user profiles
- **Service Provider Data**: Structured storage for provider information and services
- **Data Persistence**: Reliable data storage with proper relationships
- **Migration System**: Database schema versioning and updates

### 🚧 **In Development**
- **Backend Booking Integration**: API endpoints for booking management
- **Payment Processing**: M-Pesa integration for secure payments
- **Real-time Notifications**: Provider and client notification system
- **Booking Management**: History, modifications, and cancellations

## 🛠️ Tech Stack

### **Frontend**
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **shadcn/ui** for UI components
- **React Hook Form** with Zod validation
- **React Router** for navigation
- **Tanstack Query** for data fetching

### **Backend & Database**
- **Supabase** (PostgreSQL) for database and real-time features
- **Civic Auth** for blockchain-based authentication
- **Row Level Security (RLS)** for data protection

### **Development Tools**
- **TypeScript** for type safety
- **ESLint** and **Prettier** for code quality
- **Git** for version control

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Supabase account and project
- Civic Auth developer account

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Philip38-hub/usafix.git
   cd usafix
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory:
   ```bash
   cp .env.example .env
   ```
   Fill in the necessary environment variables:
   ```env
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your_anon_key_from_dashboard
   VITE_CIVIC_CLIENT_ID=your_civic_client_id_from_console
   ```

4. **Database Setup**
   Run the Supabase migrations:
   ```bash
   # The migrations are in supabase/migrations/
   # Apply them through Supabase dashboard or CLI
   ```

5. **Start Development Server**
   ```bash
   npm run dev
   ```

6. **Open Application**
   Navigate to `http://localhost:8080`

## 📱 Usage

### **For Clients**
1. **Sign Up/Sign In**: Use Civic Auth for secure authentication
2. **Complete Profile**: Add your details including phone number and location
3. **Browse Providers**: Search and filter service providers by location and service type
4. **Book Services**: Fill out comprehensive booking forms with all details
5. **Track Bookings**: View booking confirmations and status updates

### **For Service Providers**
1. **Authentication**: Sign in with Civic Auth
2. **Provider Dashboard**: Access specialized dashboard with booking management
3. **Profile Management**: Update business information and service offerings
4. **Booking Requests**: Receive and manage client booking requests

## 🧪 Testing

### **Manual Testing**
```bash
# Test profile editing flow
node scripts/test-profile-flow.js

# Test booking system
node scripts/test-booking-flow.js

# Check database providers
node scripts/check-providers.js
```

### **Test Routes**
- `/test-booking` - Debug booking functionality with real provider data
- All routes include proper authentication and error handling

## 📊 Database Schema

### **Core Tables**
- **profiles**: User profiles with Civic Auth integration
- **service_providers**: Provider business information and services
- **bookings**: Booking requests and management (frontend ready)
- **reviews**: Rating and review system

### **Key Features**
- UUID-based primary keys
- Civic Auth ID integration
- Row Level Security (RLS)
- Proper foreign key relationships

## 🔒 Security

- **Civic Auth**: Blockchain-based identity verification
- **Row Level Security**: Database-level access control
- **Input Validation**: Comprehensive form validation with Zod
- **Type Safety**: Full TypeScript implementation
- **Secure Headers**: Proper CORS and security configurations

## 🌍 Kenyan-Specific Features

- **Phone Number Validation**: Supports +254 and 07xx formats
- **County Selection**: All 47 Kenyan counties supported
- **Local Currency**: KSh pricing throughout the application
- **Time Zones**: EAT (East Africa Time) support
- **Local Business Hours**: 8 AM - 6 PM service windows

## 📈 Current Status

### **✅ Production Ready**
- User authentication and profile management
- Service provider browsing and search
- Booking form and confirmation (frontend)
- Database integration and data persistence
- Responsive UI/UX

### **🔄 Next Phase**
- Backend booking API integration
- Payment processing with M-Pesa
- Real-time notifications
- Provider booking management
- Advanced search and filtering
- Blockchain intergration
- Location feature

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Civic Auth** for secure authentication infrastructure
- **Supabase** for backend-as-a-service platform
- **shadcn/ui** for beautiful UI components
- **Tailwind CSS** for utility-first styling

---

**Built with ❤️ for Kenya** 🇰🇪

*Connecting communities, one service at a time.*