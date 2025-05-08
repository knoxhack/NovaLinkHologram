import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

export default function AuthStatus() {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center space-x-2">
        <div className="h-8 w-8 rounded-full bg-gray-700 animate-pulse"></div>
        <div className="h-4 w-24 bg-gray-700 rounded animate-pulse"></div>
      </div>
    );
  }

  if (isAuthenticated && user) {
    const initials = user.firstName && user.lastName 
      ? `${user.firstName[0]}${user.lastName[0]}` 
      : user.email 
        ? user.email.substring(0, 2).toUpperCase()
        : "U";

    return (
      <div className="flex items-center gap-4">
        <div className="flex flex-col items-end">
          <span className="text-sm font-medium text-accent-foreground">
            {user.firstName || user.email?.split('@')[0] || 'User'}
          </span>
          <Button 
            variant="link" 
            size="sm" 
            className="p-0 h-auto text-xs text-muted-foreground hover:text-accent-foreground"
            onClick={() => window.location.href = '/api/logout'}
          >
            Sign out
          </Button>
        </div>
        <Avatar className="border border-accent-foreground/20">
          <AvatarImage src={user.profileImageUrl || undefined} alt="Profile" />
          <AvatarFallback className="bg-accent text-accent-foreground">
            {initials}
          </AvatarFallback>
        </Avatar>
      </div>
    );
  }

  return (
    <Button
      variant="default"
      size="sm"
      className="bg-accent text-accent-foreground hover:bg-accent/80"
      onClick={() => window.location.href = '/api/login'}
    >
      Sign In
    </Button>
  );
}