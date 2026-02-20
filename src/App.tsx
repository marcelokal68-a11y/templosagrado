import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppProvider } from "@/contexts/AppContext";
import Header from "@/components/Header";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Pricing from "./pages/Pricing";
import Prayers from "./pages/Prayers";
import Verse from "./pages/Verse";
import Practice from "./pages/Practice";
import Admin from "./pages/Admin";
import InviteRedeem from "./pages/InviteRedeem";
import Posts from "./pages/Posts";
import Landing from "./pages/Landing";
import NotFound from "./pages/NotFound";
import BottomNav from "./components/BottomNav";
import QuickTutorial from "./components/QuickTutorial";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppProvider>
          <div className="flex flex-col min-h-screen">
            <Header />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/landing" element={<Landing />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/prayers" element={<Prayers />} />
              <Route path="/verse" element={<Verse />} />
              <Route path="/practice" element={<Practice />} />
              <Route path="/posts" element={<Posts />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/invite/:code" element={<InviteRedeem />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
            <BottomNav />
            <QuickTutorial />
          </div>
        </AppProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
