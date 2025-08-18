# Civic Auth Integration Setup

This project uses Civic Auth as the primary authentication method for the hackathon submission.

## Setup Instructions

### 1. Get Your Civic Auth Client ID

1. Visit [https://auth.civic.com](https://auth.civic.com)
2. Sign up or log in to your account
3. Create a new application
4. Copy your Client ID

### 2. Configure Environment Variables

1. Open the `.env` file in the project root
2. Replace `your_civic_auth_client_id_here` with your actual Client ID:

```env
VITE_CIVIC_AUTH_CLIENT_ID=your_actual_client_id_here
```

### 3. Run the Project

```bash
npm install
npm run dev
```

## Features Implemented

### ✅ Civic Auth Only Authentication
- Removed all traditional email/password authentication
- Users can only sign in/up using Civic Auth
- Secure, decentralized identity verification

### ✅ Role Selection Integration
- After Civic Auth authentication, users select their role:
  - **Client**: Looking for services
  - **Provider**: Offering services
- Role selection is integrated into the authentication flow

### ✅ User Experience
- Clean, modern UI with Civic Auth UserButton
- Seamless authentication flow
- Role-based navigation and features
- Responsive design

### ✅ Technical Implementation
- Real Civic Auth SDK integration (not mocked)
- Proper error handling
- Loading states and user feedback
- Database integration for user profiles
- Role-based routing and access control

## Components

- **CivicAuthContext**: Main authentication context using real Civic SDK
- **AuthPage**: Streamlined authentication page with Civic Auth only
- **RoleSelection**: Integrated role selection after authentication
- **UserButton**: Civic Auth's built-in authentication component
- **useAuth**: Custom hook for authentication state management

## Environment Support

The integration works in both:
- **Development**: Local development with hot reload
- **Production**: Deployed environment ready

## Hackathon Ready

This implementation showcases:
- Modern authentication using Civic Auth
- Clean, professional UI/UX
- Role-based marketplace functionality
- Secure, decentralized identity management
- Production-ready code structure

Perfect for demonstrating Civic Auth capabilities in a real-world marketplace application!
