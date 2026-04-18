import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppProvider } from "@/contexts/AppContext";
import { SidebarProvider } from "@/components/ui/sidebar";
import Header from "@/components/Header";
import AppSidebar from "@/components/AppSidebar";
import Index from "./pages/Index";
import Profile from "./pages/Profile";
import Auth from "./pages/Auth";
import Pricing from "./pages/Pricing";
import Verse from "./pages/Verse";
import Admin from "./pages/Admin";
import AdminAnalytics from "./pages/AdminAnalytics";
import AdminKnowledge from "./pages/AdminKnowledge";
import InviteRedeem from "./pages/InviteRedeem";
import Invite from "./pages/Invite";
import Mural from "./pages/Mural";
import Learn from "./pages/Learn";
import Landing from "./pages/Landing";
import Install from "./pages/Install";
import Privacy from "./pages/Privacy";
import Journey from "./pages/Journey";
import NotFound from "./pages/NotFound";
import QuickTutorial from "./components/QuickTutorial";
import ProtectedRoute from "./components/ProtectedRoute";
import BackToChatFab from "./components/BackToChatFab";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppProvider>
          <SidebarProvider>
            <div className="flex flex-col h-screen w-full overflow-hidden relative">
              <Header />
              <div className="flex flex-1 min-h-0 w-full pt-14">
                <AppSidebar />
                <main className="flex-1 min-w-0 min-h-0 flex flex-col overflow-hidden">
                  <Routes>
                    <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
                    <Route path="/landing" element={<Landing />} />
                    <Route path="/auth" element={<Auth />} />
                    <Route path="/pricing" element={<Pricing />} />
                    <Route path="/verse" element={<ProtectedRoute><Verse /></ProtectedRoute>} />
                    <Route path="/mural" element={<ProtectedRoute><Mural /></ProtectedRoute>} />
                    <Route path="/learn" element={<ProtectedRoute><Learn /></ProtectedRoute>} />
                    <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                    <Route path="/admin" element={<ProtectedRoute><Admin /></ProtectedRoute>} />
                    <Route path="/admin/analytics" element={<ProtectedRoute><AdminAnalytics /></ProtectedRoute>} />
                    <Route path="/admin/knowledge" element={<ProtectedRoute><AdminKnowledge /></ProtectedRoute>} />
                    <Route path="/invite-friends" element={<ProtectedRoute><Invite /></ProtectedRoute>} />
                    <Route path="/journey" element={<ProtectedRoute><Journey /></ProtectedRoute>} />
                    <Route path="/invite/:code" element={<InviteRedeem />} />
                    <Route path="/install" element={<Install />} />
                    <Route path="/privacy" element={<Privacy />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </main>
              </div>
              <QuickTutorial />
              <BackToChatFab />
            </div>
          </SidebarProvider>
        </AppProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;