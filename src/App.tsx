import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Truies from "./pages/Truies";
import Saillies from "./pages/Saillies";
import Portees from "./pages/Portees";
import Ventes from "./pages/Ventes";
import Depenses from "./pages/Depenses";
import Alertes from "./pages/Alertes";
import Engraissement from "./pages/Engraissement";
import PostSevrage from "./pages/PostSevrage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }
  
  return <>{children}</>;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/truies" element={<ProtectedRoute><Truies /></ProtectedRoute>} />
      <Route path="/saillies" element={<ProtectedRoute><Saillies /></ProtectedRoute>} />
      <Route path="/portees" element={<ProtectedRoute><Portees /></ProtectedRoute>} />
      <Route path="/post-sevrage" element={<ProtectedRoute><PostSevrage /></ProtectedRoute>} />
      <Route path="/engraissement" element={<ProtectedRoute><Engraissement /></ProtectedRoute>} />
      <Route path="/ventes" element={<ProtectedRoute><Ventes /></ProtectedRoute>} />
      <Route path="/depenses" element={<ProtectedRoute><Depenses /></ProtectedRoute>} />
      <Route path="/alertes" element={<ProtectedRoute><Alertes /></ProtectedRoute>} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
