import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SupabaseAuthProvider } from "./contexts/SupabaseAuthProvider";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Messages from "./pages/Messages";
import Dashboard from "./pages/Dashboard";
import ViewAds from "./pages/ViewAds";
import CreateCampaign from "./pages/CreateCampaign";
import MyCampaigns from "./pages/MyCampaigns";
import AdminPanel from "./pages/AdminPanel";
import UserManagement from "./pages/UserManagement";
import AdSenseSettings from "./pages/AdSenseSettings";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import BlogManagement from "./pages/BlogManagement";
import PageManagement from "./pages/PageManagement";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import About from "./pages/About";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <SupabaseAuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/view-ads" element={<ViewAds />} />
            <Route path="/create-campaign" element={<CreateCampaign />} />
            <Route path="/my-campaigns" element={<MyCampaigns />} />
            <Route path="/messages" element={<Messages />} />
            <Route path="/admin" element={<AdminPanel />} />
            <Route path="/admin/adsense" element={<AdSenseSettings />} />
            <Route path="/admin/blog" element={<BlogManagement />} />
            <Route path="/admin/pages" element={<PageManagement />} />
            <Route path="/admin/users" element={<UserManagement />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:slug" element={<BlogPost />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/terms-of-service" element={<TermsOfService />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </SupabaseAuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
