import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import { useState, useEffect } from "react";
import ProtectedRoute from "./components/ProtectedRoute";

function Router() {
  return (
    <Switch>
      <Route path="/">
        <ProtectedRoute>
          <Home />
        </ProtectedRoute>
      </Route>
      <Route path="/login">
        <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-b from-background to-background/80">
          <div className="text-3xl font-bold mb-8 text-primary">NovaLink</div>
          <div className="bg-card p-8 rounded-lg shadow-lg border border-accent/30 max-w-md w-full">
            <h1 className="text-2xl font-bold mb-6 text-center">Sign In</h1>
            <p className="text-muted-foreground mb-6 text-center">
              Please sign in to access the NovaLink agent control system
            </p>
            <button
              onClick={() => window.location.href = '/api/login'}
              className="w-full py-2 px-4 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 font-medium transition-colors"
            >
              Continue with Replit
            </button>
          </div>
        </div>
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  // Force dark mode for this application since it's designed for that
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);
  
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
