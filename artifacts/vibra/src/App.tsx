import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { PlayerProvider } from "@/context/PlayerContext";
import { BottomNav } from "@/components/BottomNav";
import { MiniPlayer } from "@/components/MiniPlayer";
import { ErrorBoundary } from "@/components/ErrorBoundary";

import { Splash } from "@/pages/Splash";
import { Player } from "@/pages/Player";
import { Party } from "@/pages/Party";
import { Pro } from "@/pages/Pro";
import { Universe } from "@/pages/Universe";

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
});

function Router() {
  return (
    <div className="flex flex-col min-h-[100dvh] w-full bg-background text-foreground overflow-x-hidden pb-16">
      <Switch>
        <Route path="/" component={Splash} />
        <Route path="/player">
          <ErrorBoundary label="El reproductor no pudo cargarse">
            <Player />
          </ErrorBoundary>
        </Route>
        <Route path="/party">
          <ErrorBoundary label="El Modo Fiesta no pudo cargarse">
            <Party />
          </ErrorBoundary>
        </Route>
        <Route path="/pro">
          <ErrorBoundary label="La sección Pro no pudo cargarse">
            <Pro />
          </ErrorBoundary>
        </Route>
        <Route path="/universe">
          <ErrorBoundary label="El Universo HBG no pudo cargarse">
            <Universe />
          </ErrorBoundary>
        </Route>
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
