import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { CivicAuthProvider } from "@/contexts/CivicAuthContext";
import { RoleBasedRoute } from "@/components/RoleBasedRoute";
import { RoleSelection } from "@/components/RoleSelection";

import { useAuth } from "@/hooks/useAuth";
import Index from "./pages/Index";
import ProviderDashboard from "./pages/ProviderDashboard";
import { AuthPage } from "./components/AuthPage";
import { ProfileEdit } from "./components/ProfileEdit";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Router component that handles role-based navigation
const AppRouter = () => {
  const { isAuthenticated, userRole, loading, needsRoleSelection } = useAuth();

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

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Index />} />
      <Route path="/auth" element={<AuthPage />} />
      
      {/* Role selection for Civic Auth users */}
      <Route path="/select-role" element={<RoleSelection />} />

      {/* Profile editing - requires authentication */}
      <Route
        path="/profile"
        element={
          isAuthenticated ? (
            <ProfileEdit />
          ) : (
            <Navigate to="/auth" replace />
          )
        }
      />

      {/* Provider-only routes */}
      <Route 
        path="/provider/dashboard" 
        element={
          <RoleBasedRoute allowedRoles={['provider']}>
            <ProviderDashboard />
          </RoleBasedRoute>
        } 
      />
      
      {/* Auto-redirect based on role after authentication */}
      <Route 
        path="/dashboard" 
        element={
          isAuthenticated ? (
            needsRoleSelection ? (
              <Navigate to="/select-role" replace />
            ) : userRole === 'provider' ? (
              <Navigate to="/provider/dashboard" replace />
            ) : (
              <Navigate to="/" replace />
            )
          ) : (
            <Navigate to="/auth" replace />
          )
        } 
      />
      
      {/* Catch-all route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <CivicAuthProvider displayMode="iframe">
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppRouter />
        </BrowserRouter>
      </TooltipProvider>
    </CivicAuthProvider>
  </QueryClientProvider>
);

export default App;
