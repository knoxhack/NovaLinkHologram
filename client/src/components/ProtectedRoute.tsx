import { useAuth } from "@/hooks/useAuth";
import { Navigate, useLocation } from "wouter";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  redirect?: string;
}

export default function ProtectedRoute({ 
  children, 
  redirect = '/login' 
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const [location] = useLocation();

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Verifying authentication...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={`${redirect}?redirect=${encodeURIComponent(location)}`} />;
  }

  return <>{children}</>;
}