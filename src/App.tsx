import { lazy, Suspense } from "react";
import { Loader2 } from "lucide-react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppProvider } from "@/contexts/AppContext";
import { SidebarProvider } from "@/components/ui/sidebar";
import Header from "@/components/Header";
import AppSidebar from "@/components/AppSidebar";
// Eager: landing-critical routes only.
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Landing from "./pages/Landing";
// Lazy: loaded on demand per-route. TS-102.
const Profile = lazy(() => import("./pages/Profile"));
const Pricing = lazy(() => import("./pages/Pricing"));
const Verse = lazy(() => import("./pages/Verse"));
const Admin = lazy(() => import("./pages/Admin"));
const AdminAnalytics = lazy(() => import("./pages/AdminAnalytics"));
const AdminKnowledge = lazy(() => import("./pages/AdminKnowledge"));
const InviteRedeem = lazy(() => import("./pages/InviteRedeem"));
const Invite = lazy(() => import("./pages/Invite"));
const Mural = lazy(() => import("./pages/Mural"));
const Learn = lazy(() => import("./pages/Learn"));
const Install = lazy(() => import("./pages/Install"));
const Privacy = lazy(() => import("./pages/Privacy"));
const Journey = lazy(() => import("./pages/Journey"));
const NotFound = lazy(() => import("./pages/NotFound"));
import QuickTutorial from "./components/QuickTutorial";
import ProtectedRoute, { AdminRoute } from "./components/ProtectedRoute";
import BackToChatFab from "./components/BackToChatFab";

// TS-103: tuned React Query defaults. The old `new QueryClient()` caused a
// refetch per window-focus/mount, which multiplies load by N panels × M users.
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,              // 1 min: most data doesn't need sub-minute refresh
      gcTime: 5 * 60_000,              // 5 min before dropping unused cache
      retry: 1,                        // default 3 is too aggressive under rate limits
      refetchOnWindowFocus: false,     // PWA users alt-tab frequently
      refetchOnReconnect: true,
    },
    mutations: { retry: 0 },
  },
});

function RouteFallback() {
  return (
    <div className="flex-1 flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}

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
                  <Suspense fallback={<RouteFallback />}>
                    <Routes>
                      <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
                      <Route path="/landing" element={<Landing />} />
                      <Route path="/auth" element={<Auth />} />
                      <Route path="/pricing" element={<Pricing />} />
                      <Route path="/verse" element={<ProtectedRoute><Verse /></ProtectedRoute>} />
                      <Route path="/mural" element={<ProtectedRoute><Mural /></ProtectedRoute>} />
                      <Route path="/learn" element={<ProtectedRoute><Learn /></ProtectedRoute>} />
                      <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                      <Route path="/admin" element={<AdminRoute><Admin /></AdminRoute>} />
                      <Route path="/admin/analytics" element={<AdminRoute><AdminAnalytics /></AdminRoute>} />
                      <Route path="/admin/knowledge" element={<AdminRoute><AdminKnowledge /></AdminRoute>} />
                      <Route path="/invite-friends" element={<ProtectedRoute><Invite /></ProtectedRoute>} />
                      <Route path="/journey" element={<ProtectedRoute><Journey /></ProtectedRoute>} />
                      <Route path="/invite/:code" element={<InviteRedeem />} />
                      <Route path="/install" element={<Install />} />
                      <Route path="/privacy" element={<Privacy />} />
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </Suspense>
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