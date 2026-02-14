import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/lib/theme";
import { BottomNav } from "@/components/bottom-nav";
import Feed from "@/pages/feed";
import AiChat from "@/pages/ai-chat";
import Invest from "@/pages/invest";
import Workspace from "@/pages/workspace";
import Gaming from "@/pages/gaming";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Feed} />
      <Route path="/ai" component={AiChat} />
      <Route path="/invest" component={Invest} />
      <Route path="/workspace" component={Workspace} />
      <Route path="/gaming" component={Gaming} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <div className="max-w-lg mx-auto min-h-screen bg-background relative">
            <div className="h-screen overflow-y-auto pb-16">
              <Router />
            </div>
            <BottomNav />
          </div>
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
