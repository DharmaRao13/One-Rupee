import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import HomePage from "./pages/HomePage";
import AuthPage from "./pages/AuthPage";
import PayPage from "./pages/PayPage";
import RegisterPage from "./pages/RegisterPage";
import LeaderboardPage from "./pages/LeaderboardPage";
import UpgradePage from "./pages/UpgradePage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import NotFound from "./pages/NotFound";
import PrivacyPolicyPage from "./pages/PrivacyPolicyPage";
import TermsAndConditionsPage from "./pages/TermsAndConditionsPage";
import RefundPolicyPage from "./pages/RefundPolicyPage";
import ShippingPolicyPage from "./pages/ShippingPolicyPage";
import ContactUsPage from "./pages/ContactUsPage";
import RefRedirect from "./components/RefRedirect";
import { RequirePayment, RequireRegistered, RequireAuth } from "./components/RouteGuards";
import AdminGuard from "./components/admin/AdminGuard";
import AdminLoginPage from "./pages/admin/AdminLoginPage";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminPayments from "./pages/admin/AdminPayments";
import AdminSettings from "./pages/admin/AdminSettings";
import DynamicIslandNav from "./components/DynamicIslandNav";
import SiteHeader from "./components/SiteHeader";
import { AuthProvider } from "./lib/auth";
import { SoundProvider } from "./lib/sound";

const queryClient = new QueryClient();

const AnimatedRoutes = () => {
  const location = useLocation();
  const showHeader = location.pathname !== "/auth" && !location.pathname.startsWith("/admin");

  return (
    <>
      {showHeader && <SiteHeader />}
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<HomePage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/pay" element={<RequireAuth><PayPage /></RequireAuth>} />
          <Route path="/register" element={<RequirePayment><RegisterPage /></RequirePayment>} />
          <Route path="/leaderboard" element={<RequireRegistered><LeaderboardPage /></RequireRegistered>} />
          <Route path="/upgrade" element={<RequireRegistered><UpgradePage /></RequireRegistered>} />
          <Route path="/ref/:code" element={<RefRedirect />} />
          {/* Legal / Razorpay compliance pages */}
          <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
          <Route path="/terms-and-conditions" element={<TermsAndConditionsPage />} />
          <Route path="/refund-policy" element={<RefundPolicyPage />} />
          <Route path="/shipping-policy" element={<ShippingPolicyPage />} />
          <Route path="/contact-us" element={<ContactUsPage />} />
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route path="/admin" element={<AdminGuard><AdminDashboard /></AdminGuard>} />
          <Route path="/admin/users" element={<AdminGuard><AdminUsers /></AdminGuard>} />
          <Route path="/admin/payments" element={<AdminGuard><AdminPayments /></AdminGuard>} />
          <Route path="/admin/settings" element={<AdminGuard><AdminSettings /></AdminGuard>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AnimatePresence>
      <DynamicIslandNav />
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <SoundProvider>
            <AnimatedRoutes />
          </SoundProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
