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
      <div className="flex flex-col items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Verifying authentication...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <div className="text-destructive mb-4">Authentication error</div>
        <button 
          onClick={() => setLocation(redirect)} 
          className="px-4 py-2 bg-primary text-white rounded"
        >
          Go to Login
        </button>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Redirecting to login...</p>
      </div>
    );
  }

  return <>{children}</>;
}