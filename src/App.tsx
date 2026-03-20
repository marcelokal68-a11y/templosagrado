import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppProvider } from "@/contexts/AppContext";
import { SidebarProvider } from "@/components/ui/sidebar";
import Header from "@/components/Header";
import AppSidebar from "@/components/AppSidebar";
import TwinklingStars from "@/components/TwinklingStars";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Pricing from "./pages/Pricing";
import Prayers from "./pages/Prayers";
import Verse from "./pages/Verse";
import Practice from "./pages/Practice";
import Admin from "./pages/Admin";
import InviteRedeem from "./pages/InviteRedeem";
import Invite from "./pages/Invite";
import Posts from "./pages/Posts";
import Mural from "./pages/Mural";
import Learn from "./pages/Learn";
import LearnTopic from "./pages/LearnTopic";
import Landing from "./pages/Landing";
import Install from "./pages/Install";
import NotFound from "./pages/NotFound";
import BottomNav from "./components/BottomNav";
import QuickTutorial from "./components/QuickTutorial";
import ProtectedRoute from "./components/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppProvider>
          <SidebarProvider>
            <div className="flex flex-col min-h-screen w-full overflow-x-hidden relative">
              <TwinklingStars />
              <Header />
              <div className="flex flex-1 w-full">
                <AppSidebar />
                <main className="flex-1 min-w-0 flex flex-col">
                  <Routes>
                    <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
                    <Route path="/landing" element={<Landing />} />
                    <Route path="/auth" element={<Auth />} />
                    <Route path="/pricing" element={<Pricing />} />
                    <Route path="/prayers" element={<ProtectedRoute><Prayers /></ProtectedRoute>} />
                    <Route path="/verse" element={<ProtectedRoute><Verse /></ProtectedRoute>} />
                    <Route path="/practice" element={<ProtectedRoute><Practice /></ProtectedRoute>} />
                    <Route path="/posts" element={<ProtectedRoute><Posts /></ProtectedRoute>} />
                    <Route path="/mural" element={<ProtectedRoute><Mural /></ProtectedRoute>} />
                    <Route path="/learn" element={<ProtectedRoute><Learn /></ProtectedRoute>} />
                    <Route path="/learn/:topic" element={<ProtectedRoute><LearnTopic /></ProtectedRoute>} />
                    <Route path="/admin" element={<ProtectedRoute><Admin /></ProtectedRoute>} />
                    <Route path="/invite-friends" element={<ProtectedRoute><Invite /></ProtectedRoute>} />
                    <Route path="/invite/:code" element={<InviteRedeem />} />
                    <Route path="/install" element={<Install />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </main>
              </div>
              <BottomNav />
              <QuickTutorial />
            </div>
          </SidebarProvider>
        </AppProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
