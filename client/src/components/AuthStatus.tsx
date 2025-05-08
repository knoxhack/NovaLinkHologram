import { useAuth } from "../hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, User2 } from "lucide-react";

export default function AuthStatus() {
  const { user, isLoading, isAuthenticated } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 p-2 text-muted-foreground animate-pulse">
        <div className="w-8 h-8 rounded-full bg-muted" />
        <div className="h-4 w-24 bg-muted rounded" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Button
        onClick={() => window.location.href = '/api/login'}
        variant="outline"
        size="sm"
        className="text-xs h-8"
      >
        <User2 className="mr-2 w-3.5 h-3.5" />
        Login
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative rounded-full h-8 w-8 p-0 overflow-hidden border border-accent/30">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user?.profileImageUrl || ""} alt="User avatar" />
            <AvatarFallback className="bg-secondary/10 text-secondary">
              {user?.firstName?.charAt(0) || user?.email?.charAt(0) || "U"}
            </AvatarFallback>
          </Avatar>
          <span className="absolute bottom-0 right-0 w-2 h-2 bg-green-500 rounded-full border border-background"></span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <div className="px-4 py-3 border-b border-accent/20">
          <div className="text-sm font-medium text-foreground">
            {user?.firstName ? `${user.firstName} ${user.lastName || ''}` : 'Agent'}
          </div>
          <div className="text-xs text-muted-foreground mt-1 truncate">
            {user?.email || 'Authenticated User'}
          </div>
        </div>
        <DropdownMenuItem 
          className="text-destructive focus:text-destructive flex items-center cursor-pointer" 
          onClick={() => window.location.href = '/api/logout'}
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Logout</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}