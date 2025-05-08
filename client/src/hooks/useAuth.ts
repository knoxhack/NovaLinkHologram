import { useQuery } from "@tanstack/react-query";
import type { User } from "@shared/schema";
import { getQueryFn } from "@/lib/queryClient";

export function useAuth() {
  const { 
    data: user, 
    isLoading, 
    error, 
    isError, 
    status 
  } = useQuery<User | null>({
    queryKey: ["/api/auth/user"],
    queryFn: getQueryFn({ on401: "returnNull" }), // Use returnNull instead of throwing
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true
  });

  // User is authenticated if we have user data
  const isAuthenticated = !!user;

  return {
    user,
    isLoading,
    isAuthenticated,
    error,
    isError,
    status
  };
}