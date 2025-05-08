import { useAuth } from "../hooks/useAuth";
import { useLocation } from "wouter";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  redirect?: string;
}

export default function ProtectedRoute({ 
  children, 
  redirect = '/login' 
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, isError } = useAuth();
  const [location, setLocation] = useLocation();

  useEffect(() => {
    // Only redirect if we've confirmed the user is not authenticated and not still loading
    if (!isAuthenticated && !isLoading) {
      setLocation(redirect);
    }
  }, [isAuthenticated, isLoading, redirect, setLocation]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-background">
        <div className="relative">
          <div className="absolute -top-10 -left-10 w-20 h-20 border border-primary/30 rounded-full animate-ping opacity-20"></div>
          <div className="absolute -top-6 -left-6 w-12 h-12 border border-accent/40 rounded-full animate-ping opacity-30" style={{animationDuration: '2s', animationDelay: '0.2s'}}></div>
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
        <div className="mt-8 p-3 bg-card/80 backdrop-blur-sm border border-primary/20 rounded-md shadow-glow">
          <p className="text-sm font-mono text-muted-foreground typing-animation">
            Verifying authentication status...
          </p>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-2">
          <div className="h-1 bg-primary/30 rounded-full animate-pulse"></div>
          <div className="h-1 bg-accent/30 rounded-full animate-pulse" style={{animationDelay: '0.3s'}}></div>
          <div className="h-1 bg-secondary/30 rounded-full animate-pulse" style={{animationDelay: '0.6s'}}></div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-background">
        <div className="max-w-md w-full p-6 bg-card/90 backdrop-blur-lg border border-destructive/30 rounded-lg shadow-glow alert-flash">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center p-2 bg-destructive/10 rounded-full mb-4">
              <Loader2 className="h-8 w-8 text-destructive" />
            </div>
            <h2 className="text-xl font-display text-destructive">Authentication Failed</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              There was a problem verifying your authentication status. Please try logging in again.
            </p>
          </div>
          
          <div className="grid gap-2">
            <button 
              onClick={() => setLocation(redirect)} 
              className="w-full py-2 bg-destructive/90 hover:bg-destructive text-white rounded-md transition-colors duration-200 font-medium flex items-center justify-center"
            >
              Return to Login
            </button>
            <button 
              onClick={() => window.location.href = "/api/login"} 
              className="w-full py-2 bg-primary/20 hover:bg-primary/30 text-primary rounded-md transition-colors duration-200 font-medium"
            >
              Try Direct Authentication
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-background">
        <div className="relative mb-6">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <div className="absolute -top-5 -right-5 w-3 h-3 bg-primary rounded-full animate-ping"></div>
        </div>
        <div className="bg-card/90 backdrop-blur-md border border-primary/20 rounded-lg p-4 shadow-glow">
          <p className="font-mono text-sm text-muted-foreground">
            <span className="text-primary font-bold">SYSTEM</span>: Authentication required
          </p>
          <p className="font-mono text-sm animate-pulse">
            Redirecting to secure login...
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}