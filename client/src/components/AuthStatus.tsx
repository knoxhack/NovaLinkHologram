import { useAuth } from "../hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { 
  LogOut, 
  User2, 
  Shield, 
  Terminal, 
  Settings, 
  Users, 
  Clock, 
  Fingerprint 
} from "lucide-react";

export default function AuthStatus() {
  const { user, isLoading, isAuthenticated } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 p-2 text-muted-foreground animate-pulse">
        <div className="w-8 h-8 rounded-full bg-muted/20 border border-muted/40" />
        <div className="h-4 w-24 bg-muted/20 rounded" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Button
        onClick={() => window.location.href = '/api/login'}
        variant="outline"
        size="sm"
        className="text-xs h-9 px-3 border-primary/30 bg-primary/5 hover:bg-primary/10 hover:text-primary transition-all duration-300 hover:shadow-glow"
      >
        <Shield className="mr-2 w-3.5 h-3.5" />
        <span className="font-display tracking-wide">LOGIN</span>
      </Button>
    );
  }

  // Get time of day based greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };
  
  // Format last login time
  const getLastLogin = () => {
    return new Date().toLocaleTimeString(undefined, { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" 
          className="relative h-9 px-3 overflow-hidden border border-primary/30 bg-primary/5 hover:bg-primary/10 rounded-md hover:shadow-glow group transition-all duration-300"
        >
          <div className="flex items-center gap-2">
            <Avatar className="h-5 w-5 rounded-md">
              <AvatarImage src={user?.profileImageUrl || ""} alt="User avatar" />
              <AvatarFallback className="rounded-md bg-primary/20 text-primary text-xs">
                {user?.firstName?.charAt(0) || user?.email?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>
            <span className="text-xs font-mono tracking-wider hidden sm:inline-block">
              {user?.firstName || 'AGENT'}
            </span>
            <span className="absolute bottom-0 left-0 w-full h-[2px] bg-primary/40 origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></span>
          </div>
          <span className="absolute bottom-1 right-1 w-1.5 h-1.5 bg-green-500 rounded-full border border-background animate-pulse"></span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" 
        className="w-64 border-primary/20 bg-card/95 backdrop-blur-md"
      >
        <div className="px-4 py-3">
          <div className="text-sm font-medium text-primary font-display">
            {getGreeting()}, {user?.firstName ? `${user.firstName}` : 'Agent'}
          </div>
          <div className="text-xs text-muted-foreground mt-1 truncate font-mono">
            ID: {user?.id?.substring(0, 8) || 'AUTHENTICATED'}
          </div>
          
          <div className="mt-2 flex items-center gap-1.5">
            <div className="flex-1 h-1 bg-muted/30 rounded-full overflow-hidden">
              <div className="h-full w-[85%] bg-primary/60 rounded-full"></div>
            </div>
            <span className="text-xs text-primary/80">85%</span>
          </div>
          
          <div className="mt-3 grid grid-cols-3 gap-1">
            <div className="flex flex-col items-center justify-center p-1.5 bg-primary/5 rounded-md text-center">
              <Terminal className="h-3 w-3 text-primary/70 mb-1" />
              <span className="text-[10px] text-muted-foreground">CONSOLE</span>
            </div>
            <div className="flex flex-col items-center justify-center p-1.5 bg-primary/5 rounded-md text-center">
              <Users className="h-3 w-3 text-primary/70 mb-1" />
              <span className="text-[10px] text-muted-foreground">TEAM</span>
            </div>
            <div className="flex flex-col items-center justify-center p-1.5 bg-primary/5 rounded-md text-center">
              <Settings className="h-3 w-3 text-primary/70 mb-1" />
              <span className="text-[10px] text-muted-foreground">SETTINGS</span>
            </div>
          </div>
        </div>
        
        <DropdownMenuSeparator className="border-primary/10" />
        
        <div className="px-4 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center text-xs text-muted-foreground">
              <Clock className="h-3 w-3 mr-1" />
              <span>Last login</span>
            </div>
            <span className="text-xs text-primary/80 font-mono">{getLastLogin()}</span>
          </div>
          
          <div className="flex items-center justify-between mt-1">
            <div className="flex items-center text-xs text-muted-foreground">
              <Fingerprint className="h-3 w-3 mr-1" />
              <span>Auth level</span>
            </div>
            <span className="text-xs text-primary/80 font-mono">ADMIN</span>
          </div>
        </div>
        
        <DropdownMenuSeparator className="border-primary/10" />
        
        <DropdownMenuItem 
          className="mx-2 my-1 rounded-md text-destructive focus:text-destructive flex items-center cursor-pointer hover:bg-destructive/10 focus:bg-destructive/10 px-2" 
          onClick={() => window.location.href = '/api/logout'}
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span className="font-mono text-xs tracking-wide">TERMINATE SESSION</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}