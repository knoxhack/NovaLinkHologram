import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideShieldAlert, LogIn, Home, ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";

interface AuthPromptProps {
  message?: string;
  title?: string;
}

export default function AuthPrompt({ 
  message = "You need to log in to access this content.",
  title = "Authentication Required"
}: AuthPromptProps) {
  const [isVisible, setIsVisible] = useState(false);
  
  // Animation effect when component mounts
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleLogin = () => {
    // Add a loading state or animation before redirecting
    setIsVisible(false);
    setTimeout(() => {
      window.location.href = "/api/login";
    }, 300);
  };

  return (
    <div className="flex items-center justify-center h-full bg-gradient-to-b from-background/50 to-background">
      <div className={`transition-all duration-500 transform ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
        <Card className="w-[430px] border-accent/20 bg-card/90 backdrop-blur-lg shadow-glow">
          <div className="absolute -top-12 left-1/2 transform -translate-x-1/2">
            <div className="rounded-full p-3 bg-background/80 border border-primary/30 shadow-glow">
              <LucideShieldAlert className="h-8 w-8 text-primary animate-pulse" />
            </div>
          </div>
          <CardHeader className="space-y-2 pt-12">
            <CardTitle className="text-2xl font-display text-center bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
              {title}
            </CardTitle>
            <CardDescription className="text-center">
              {message}
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6 pb-6">
            <div className="grid grid-cols-1 gap-3">
              <Button 
                variant="default" 
                className="w-full py-6 group hover:shadow-glow transition-all"
                onClick={handleLogin}
              >
                <LogIn className="mr-2 h-5 w-5 group-hover:rotate-12 transition-transform" />
                Log In with Replit
                <ArrowRight className="ml-2 h-4 w-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </Button>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => window.location.href = "/"}
              >
                <Home className="mr-2 h-4 w-4" />
                Return Home
              </Button>
            </div>
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-muted"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-card px-2 text-muted-foreground">Secure Access</span>
              </div>
            </div>
          </CardContent>
          <CardFooter className="text-xs text-muted-foreground text-center pb-6">
            NovaLink uses Replit's secure authentication system to protect your account and data.
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}