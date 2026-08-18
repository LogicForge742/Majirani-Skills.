import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import SignIn from "./pages/SignIn";
import AuthCallback from "./pages/AuthCallback";
import SignUp from "./pages/SignUp";
import VerificationPage from "./pages/artisan/VerificationPage";
import PortfolioPage from "./pages/artisan/PortfolioPage";
import VerificationsPage from "./pages/admin/VerificationsPage";
import ClientDashboard from "./pages/client/Dashboard";
import ArtisanDashboard from "./pages/artisan/Dashboard";
import AdminDashboard from "./pages/admin/Dashboard";
import PublicProfile from "./pages/artisan/PublicProfile";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/auth-callback" element={<AuthCallback />} />
          {/* Client routes */}
          <Route path="/client/dashboard" element={<ClientDashboard />} />
          {/* Artisan routes */}
          <Route path="/artisan/dashboard" element={<ArtisanDashboard />} />
          <Route path="/artisan/verify" element={<VerificationPage />} />
          <Route path="/artisan/portfolio" element={<PortfolioPage />} />
          <Route path="/artisan/:id" element={<PublicProfile />} />
          {/* Admin routes */}
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/verifications" element={<VerificationsPage />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

