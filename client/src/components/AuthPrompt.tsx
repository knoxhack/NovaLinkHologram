import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideShieldAlert, LogIn, Home, ArrowRight, Check, KeyRound, Info, User } from "lucide-react";
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
  const [isLoading, setIsLoading] = useState(false);
  const [stage, setStage] = useState(0); // For stepped authentication process display
  
  // Animation effect when component mounts
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Show auth stages one after another
  useEffect(() => {
    if (isVisible) {
      const interval = setInterval(() => {
        setStage(prev => (prev < 3 ? prev + 1 : prev));
      }, 800);
      return () => clearInterval(interval);
    }
  }, [isVisible]);

  const handleLogin = () => {
    setIsLoading(true);
    // Add a loading state or animation before redirecting
    setTimeout(() => {
      window.location.href = "/api/login";
    }, 800);
  };

  return (
    <div className="flex items-center justify-center h-full bg-gradient-to-b from-background/50 to-background overflow-hidden">
      {/* Background grid with animation */}
      <div className="absolute inset-0 grid-bg opacity-20"></div>
      
      {/* Digital noise effect */}
      <div className="digital-noise"></div>
      
      {/* Power flicker effect */}
      <div className="absolute inset-0 pointer-events-none" 
        style={{animation: 'power-flicker 20s infinite', animationDelay: '10s'}}></div>
      
      {/* Circular scan effects */}
      <div className="absolute top-1/2 left-1/2 w-[600px] h-[600px] border border-primary/5 rounded-full circular-scan opacity-10"></div>
      <div className="absolute top-1/2 left-1/2 w-[400px] h-[400px] border border-accent/5 rounded-full circular-scan opacity-10" 
        style={{animationDelay: '1s', animationDuration: '12s'}}></div>
      <div className="absolute top-1/2 left-1/2 w-[200px] h-[200px] border border-secondary/5 rounded-full circular-scan opacity-10" 
        style={{animationDelay: '0.5s', animationDuration: '8s'}}></div>
      
      {/* Floating data points */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-primary/40 rounded-full data-point"></div>
        <div className="absolute bottom-1/3 right-1/3 w-2 h-2 bg-secondary/40 rounded-full data-point" 
          style={{animationDelay: '1.5s'}}></div>
        <div className="absolute top-2/3 left-2/3 w-2 h-2 bg-accent/40 rounded-full data-point" 
          style={{animationDelay: '0.8s'}}></div>
        <div className="absolute bottom-1/4 right-1/4 w-1.5 h-1.5 bg-primary/30 rounded-full data-point" 
          style={{animationDelay: '2.2s'}}></div>
      </div>
      
      <div className={`relative transition-all duration-500 transform ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
        <Card className="w-[450px] border-accent/20 bg-card/90 backdrop-blur-lg shadow-glow hologram-scan">
          {/* Top shield icon */}
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
            {/* Authentication process steps */}
            <div className="grid grid-cols-1 gap-2 mb-2">
              <div className={`flex items-center p-2 rounded-md transition-all duration-300 ${stage >= 1 ? 'bg-primary/10 border border-primary/30' : 'opacity-40'}`}>
                <div className={`p-1 rounded-full ${stage >= 1 ? 'bg-primary/20' : 'bg-muted/20'} mr-3`}>
                  {stage >= 1 ? (
                    <User className="h-4 w-4 text-primary" />
                  ) : (
                    <div className="h-4 w-4" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium">Identity Verification</div>
                  <div className="text-xs text-muted-foreground">Secure authentication with Replit</div>
                </div>
                {stage >= 1 && <Check className="h-4 w-4 text-primary" />}
              </div>
              
              <div className={`flex items-center p-2 rounded-md transition-all duration-300 ${stage >= 2 ? 'bg-primary/10 border border-primary/30' : 'opacity-40'}`}>
                <div className={`p-1 rounded-full ${stage >= 2 ? 'bg-primary/20' : 'bg-muted/20'} mr-3`}>
                  {stage >= 2 ? (
                    <KeyRound className="h-4 w-4 text-primary" />
                  ) : (
                    <div className="h-4 w-4" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium">Access Authorization</div>
                  <div className="text-xs text-muted-foreground">Validates permissions and roles</div>
                </div>
                {stage >= 2 && <Check className="h-4 w-4 text-primary" />}
              </div>
              
              <div className={`flex items-center p-2 rounded-md transition-all duration-300 ${stage >= 3 ? 'bg-primary/10 border border-primary/30' : 'opacity-40'}`}>
                <div className={`p-1 rounded-full ${stage >= 3 ? 'bg-primary/20' : 'bg-muted/20'} mr-3`}>
                  {stage >= 3 ? (
                    <Info className="h-4 w-4 text-primary" />
                  ) : (
                    <div className="h-4 w-4" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium">Secure Session</div>
                  <div className="text-xs text-muted-foreground">End-to-end encrypted communication</div>
                </div>
                {stage >= 3 && <Check className="h-4 w-4 text-primary" />}
              </div>
            </div>
            
            <div className="grid grid-cols-1 gap-3">
              <Button 
                variant="default" 
                className="w-full py-6 group hover:shadow-glow transition-all relative overflow-hidden"
                onClick={handleLogin}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <div className="absolute inset-0 bg-primary/10 animate-scanner h-1"></div>
                    <span className="font-mono text-sm">Initializing secure connection...</span>
                  </>
                ) : (
                  <>
                    <LogIn className="mr-2 h-5 w-5 group-hover:rotate-12 transition-transform" />
                    <span className="font-display tracking-wide">AUTHENTICATE WITH REPLIT</span>
                    <ArrowRight className="ml-2 h-4 w-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                  </>
                )}
              </Button>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => window.location.href = "/"}
                disabled={isLoading}
              >
                <Home className="mr-2 h-4 w-4" />
                Return Home
              </Button>
            </div>
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-primary/20"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-card px-2 text-primary/70 font-mono">SECURITY PROTOCOL</span>
              </div>
            </div>
          </CardContent>
          
          <CardFooter className="text-xs text-muted-foreground text-center pb-6 px-6">
            <p className="font-mono">
              NovaLink implements Replit's enterprise-grade authentication to ensure 
              secure access to all AI agent command systems.
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}