import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HelmetProvider } from "react-helmet-async";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import AdminRoute from "@/components/AdminRoute";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./pages/Dashboard";
import SiteAnalytics from "./pages/SiteAnalytics";
import SharedDashboard from "./pages/SharedDashboard";
import UTMBuilder from "./pages/UTMBuilder";
import SelectPlan from "./pages/SelectPlan";
import AdminOverview from "./pages/admin/AdminOverview";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminSites from "./pages/admin/AdminSites";
import AdminPlans from "./pages/admin/AdminPlans";
import AdminPaymentSettings from "./pages/admin/AdminPaymentSettings";
import AdminClosureRequests from "./pages/admin/AdminClosureRequests";
import AdminCoupons from "./pages/admin/AdminCoupons";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import WhyNoSocial from "./pages/WhyNoSocial";
import Docs from "./pages/Docs";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/select-plan" element={<ProtectedRoute><SelectPlan /></ProtectedRoute>} />
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/sites/:siteId" element={<ProtectedRoute><SiteAnalytics /></ProtectedRoute>} />
              <Route path="/share/:siteId" element={<SharedDashboard />} />
              <Route path="/utm-builder" element={<UTMBuilder />} />
              <Route path="/admin" element={<AdminRoute><AdminOverview /></AdminRoute>} />
              <Route path="/admin/users" element={<AdminRoute><AdminUsers /></AdminRoute>} />
              <Route path="/admin/sites" element={<AdminRoute><AdminSites /></AdminRoute>} />
              <Route path="/admin/plans" element={<AdminRoute><AdminPlans /></AdminRoute>} />
              <Route path="/admin/payments" element={<AdminRoute><AdminPaymentSettings /></AdminRoute>} />
              <Route path="/admin/closure-requests" element={<AdminRoute><AdminClosureRequests /></AdminRoute>} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/why-no-social" element={<WhyNoSocial />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/docs" element={<Docs />} />
              <Route path="/docs/:slug" element={<Docs />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
