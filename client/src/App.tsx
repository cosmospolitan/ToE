import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/lib/theme";
import { AuthProvider, useAuth } from "@/lib/auth";
import { BottomNav } from "@/components/bottom-nav";
import Feed from "@/pages/feed";
import AiChat from "@/pages/ai-chat";
import Invest from "@/pages/invest";
import Workspace from "@/pages/workspace";
import Gaming from "@/pages/gaming";
import Auth from "@/pages/auth";
import Profile from "@/pages/profile";
import PostDetail from "@/pages/post-detail";
import Messages from "@/pages/messages";
import Notifications from "@/pages/notifications";
import SearchPage from "@/pages/search";
import CreatePost from "@/pages/create-post";
import Balance from "@/pages/balance";
import Settings from "@/pages/settings";
import NotFound from "@/pages/not-found";
import { Loader2 } from "lucide-react";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Feed} />
      <Route path="/ai" component={AiChat} />
      <Route path="/invest" component={Invest} />
      <Route path="/workspace" component={Workspace} />
      <Route path="/gaming" component={Gaming} />
      <Route path="/profile/:id" component={Profile} />
      <Route path="/post/:id" component={PostDetail} />
      <Route path="/messages" component={Messages} />
      <Route path="/notifications" component={Notifications} />
      <Route path="/search" component={SearchPage} />
      <Route path="/create" component={CreatePost} />
      <Route path="/balance" component={Balance} />
      <Route path="/settings" component={Settings} />
      <Route component={NotFound} />
    </Switch>
  );
}

function AppContent() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Auth />;
  }

  return (
    <div className="max-w-lg mx-auto min-h-screen bg-background relative">
      <div className="h-screen overflow-y-auto pb-16">
        <Router />
      </div>
      <BottomNav />
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <AuthProvider>
            <AppContent />
          </AuthProvider>
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
