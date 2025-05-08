import { useAuth } from "../hooks/useAuth";
import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Loader2 } from "lucide-react";

export default function Login() {
  const { isAuthenticated, isLoading, status } = useAuth();
  const [location, setLocation] = useLocation();
  const [redirecting, setRedirecting] = useState(false);
  
  // If user is already authenticated, redirect to home page
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      setLocation("/");
    }
  }, [isAuthenticated, isLoading, setLocation]);

  // Handle Replit login
  const handleLogin = () => {
    setRedirecting(true);
    window.location.href = '/api/login';
  };
  
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-b from-background to-background/80">
      <div className="text-5xl font-display font-bold mb-8 flex items-center">
        <span className="text-secondary">Nova</span>
        <span className="text-primary">Link</span>
        <div className="ml-2 h-2 w-2 bg-primary rounded-full animate-pulse-slow"></div>
      </div>
      
      <div className="bg-card p-8 rounded-lg shadow-lg border border-accent/30 max-w-md w-full">
        <h1 className="text-2xl font-bold mb-6 text-center">Command Center Access</h1>
        
        <div className="space-y-4 mb-6">
          <div className="space-y-2">
            <p className="text-muted-foreground text-center">
              Secure authentication required to access NovaLink agent control system
            </p>
          </div>
        </div>
        
        <button
          onClick={handleLogin}
          disabled={redirecting || isLoading}
          className="w-full py-3 px-4 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 font-medium transition-colors flex items-center justify-center space-x-2"
        >
          {redirecting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              <span>Redirecting to Replit...</span>
            </>
          ) : (
            <span>Continue with Replit</span>
          )}
        </button>
        
        <div className="mt-6 border-t border-accent/20 pt-4">
          <p className="text-xs text-muted-foreground text-center">
            Authorized personnel only. All access and commands are monitored and logged.
          </p>
        </div>
      </div>
    </div>
  );
}