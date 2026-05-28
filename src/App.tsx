import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import MusicPage from "./pages/MusicPage";
import VideoPage from "./pages/VideoPage";
import PhotoPage from "./pages/PhotoPage";
import TextPage from "./pages/TextPage";
import JinglePage from "./pages/JinglePage";
import ChatPage from "./pages/ChatPage";
import CommunityPage from "./pages/CommunityPage";
import PricingPage from "./pages/PricingPage";
import CollabPage from "./pages/CollabPage";
import LearnPage from "./pages/LearnPage";
import CheckoutPage from "./pages/CheckoutPage";
import PaymentSuccess from "./pages/PaymentSuccess";
import SupportPage from "./pages/SupportPage";
import LoginPage from "./pages/LoginPage";
import AdminLayout from "./pages/admin/AdminLayout";
import Dashboard from "./pages/admin/Dashboard";
import UsersPage from "./pages/admin/UsersPage";
import ActivityPage from "./pages/admin/ActivityPage";
import SubscriptionsPage from "./pages/admin/SubscriptionsPage";
import FinancePage from "./pages/admin/FinancePage";
import ContentPage from "./pages/admin/ContentPage";
import AdminChatPage from "./pages/admin/AdminChatPage";
import TicketsPage from "./pages/admin/TicketsPage";
import AnalyticsPage from "./pages/admin/AnalyticsPage";
import SettingsPage from "./pages/admin/SettingsPage";
import ProfilePage from "./pages/ProfilePage";
import CookiePolicyPage from "./pages/CookiePolicyPage";
import CookieBanner from "./components/CookieBanner";
import TermsPage from "./pages/TermsPage";
import PrivacyPage from "./pages/PrivacyPage";
import OAuthCallbackPage from "./pages/OAuthCallbackPage";
import InvitePage from "./pages/InvitePage";
import LogoPage from "./pages/LogoPage";
import CreatePage from "./pages/CreatePage";
import PresentationPage from "./pages/PresentationPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <CookieBanner />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/music" element={<MusicPage />} />
          <Route path="/video" element={<VideoPage />} />
          <Route path="/photo" element={<PhotoPage />} />
          <Route path="/text" element={<TextPage />} />
          <Route path="/jingle" element={<JinglePage />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/community" element={<CommunityPage />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/collab" element={<CollabPage />} />
          <Route path="/learn" element={<LearnPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/payment-success" element={<PaymentSuccess />} />
          <Route path="/support" element={<SupportPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/cookie-policy" element={<CookiePolicyPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/auth/callback" element={<OAuthCallbackPage />} />
          <Route path="/create" element={<CreatePage />} />
          <Route path="/presentation" element={<PresentationPage />} />
          <Route path="/invite" element={<InvitePage />} />
          <Route path="/logo" element={<LogoPage />} />
          {/* Admin panel */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="users" element={<UsersPage />} />
            <Route path="activity" element={<ActivityPage />} />
            <Route path="subscriptions" element={<SubscriptionsPage />} />
            <Route path="finance" element={<FinancePage />} />
            <Route path="content" element={<ContentPage />} />
            <Route path="chat" element={<AdminChatPage />} />
            <Route path="tickets" element={<TicketsPage />} />
            <Route path="analytics" element={<AnalyticsPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;