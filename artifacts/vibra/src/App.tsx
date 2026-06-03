import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { PlayerProvider } from "@/context/PlayerContext";
import { BottomNav } from "@/components/BottomNav";
import { MiniPlayer } from "@/components/MiniPlayer";

// Import pages later, will just create stubs for now to avoid compilation errors
import { Splash } from "@/pages/Splash";
import { Player } from "@/pages/Player";
import { Party } from "@/pages/Party";
import { Pro } from "@/pages/Pro";
import { Universe } from "@/pages/Universe";

const queryClient = new QueryClient();

function Router() {
  return (
    <div className="flex flex-col min-h-[100dvh] w-full bg-background text-foreground overflow-x-hidden pb-16">
      <Switch>
        <Route path="/" component={Splash} />
        <Route path="/player" component={Player} />
        <Route path="/party" component={Party} />
        <Route path="/pro" component={Pro} />
        <Route path="/universe" component={Universe} />
        <Route component={NotFound} />
      </Switch>
      <MiniPlayer />
      <BottomNav />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <PlayerProvider>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </PlayerProvider>
    </QueryClientProvider>
  );
}

export default App;
