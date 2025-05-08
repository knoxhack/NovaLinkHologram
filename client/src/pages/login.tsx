import { useAuth } from "../hooks/useAuth";
import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Loader2, Shield, Lock, LogIn, EyeOff, Fingerprint } from "lucide-react";

export default function Login() {
  const { isAuthenticated, isLoading } = useAuth();
  const [location, setLocation] = useLocation();
  const [redirecting, setRedirecting] = useState(false);
  const [visible, setVisible] = useState(false);
  
  // If user is already authenticated, redirect to home page
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      setLocation("/");
    }
  }, [isAuthenticated, isLoading, setLocation]);

  // Animation effect when component mounts
  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Handle Replit login
  const handleLogin = () => {
    setRedirecting(true);
    // Brief delay before redirecting for animation
    setTimeout(() => {
      window.location.href = '/api/login';
    }, 500);
  };
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#0A0E17] overflow-hidden">
      {/* Background grid */}
      <div className="absolute inset-0 grid-bg opacity-20"></div>
      
      {/* Animated floating cyber elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-primary/80 rounded-full data-point"></div>
        <div className="absolute top-3/4 right-1/4 w-2 h-2 bg-secondary/80 rounded-full data-point" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-2/4 left-3/4 w-2 h-2 bg-accent/80 rounded-full data-point" style={{animationDelay: '0.5s'}}></div>
        <div className="absolute top-1/3 right-1/3 w-1.5 h-1.5 bg-primary/60 rounded-full data-point" style={{animationDelay: '1.5s'}}></div>
        <div className="absolute bottom-1/4 left-2/3 w-1.5 h-1.5 bg-secondary/60 rounded-full data-point" style={{animationDelay: '2s'}}></div>
      </div>
      
      {/* Circular scan effect */}
      <div className="absolute top-1/2 left-1/2 w-[500px] h-[500px] border border-primary/10 rounded-full circular-scan opacity-30"></div>
      <div className="absolute top-1/2 left-1/2 w-[300px] h-[300px] border border-accent/10 rounded-full circular-scan opacity-20" style={{animationDelay: '1s', animationDuration: '8s'}}></div>
      
      {/* Logo with animation */}
      <div className={`text-5xl font-display font-bold mb-10 flex items-center transition-all duration-1000 transform ${visible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
        <div className="relative">
          <span className="text-secondary relative z-10">Nova</span>
          <span className="text-primary relative z-10">Link</span>
          <div className="absolute -top-5 -right-5 w-8 h-8 border border-primary/30 rounded-full flex items-center justify-center animate-pulse-slow">
            <div className="w-4 h-4 bg-primary/30 rounded-full"></div>
          </div>
        </div>
      </div>
      
      {/* Login card with hologram scan effect */}
      <div className={`relative hologram-scan bg-card/90 backdrop-blur-lg p-8 rounded-lg shadow-glow border border-accent/30 max-w-md w-full transition-all duration-700 transform ${visible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}>
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
          <Shield className="w-8 h-8 text-primary animate-pulse" />
        </div>
        
        <h1 className="text-2xl font-bold mb-2 text-center pt-4 font-display bg-clip-text text-transparent bg-gradient-to-r from-primary via-primary to-accent">Command Center Access</h1>
        
        <div className="space-y-4 mb-6 mt-4">
          <div className="space-y-2">
            <p className="text-muted-foreground text-center text-sm">
              Secure authentication required to access NovaLink agent control system
            </p>
          </div>
          
          {/* Security badges */}
          <div className="flex justify-center space-x-3 my-6">
            <div className="secure-access-badge">
              <Lock className="w-3 h-3 mr-1" />
              <span>Encrypted</span>
            </div>
            <div className="secure-access-badge">
              <Fingerprint className="w-3 h-3 mr-1" />
              <span>Verified</span>
            </div>
            <div className="secure-access-badge">
              <EyeOff className="w-3 h-3 mr-1" />
              <span>Private</span>
            </div>
          </div>
        </div>
        
        {/* Login button with animations */}
        <button
          onClick={handleLogin}
          disabled={redirecting || isLoading}
          className="w-full py-4 px-4 bg-primary/90 hover:bg-primary text-primary-foreground rounded-md font-medium transition-all duration-300 flex items-center justify-center space-x-2 shadow-glow group"
        >
          {redirecting ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              <span className="font-display tracking-wide">Establishing Secure Connection...</span>
            </>
          ) : (
            <>
              <LogIn className="mr-2 h-5 w-5 transition-transform duration-300 group-hover:rotate-12" />
              <span className="font-display tracking-wide">AUTHENTICATE WITH REPLIT</span>
            </>
          )}
        </button>
        
        <div className="mt-6 pt-4 relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-accent/20"></div>
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-card px-2 text-muted-foreground">SECURITY NOTICE</span>
          </div>
        </div>
        
        <p className="text-xs text-muted-foreground text-center mt-4 font-mono">
          ACCESS-LEVEL: CLASSIFIED • AUTHORIZATION REQUIRED
          <br />
          All connections and commands are monitored and recorded.
        </p>
      </div>
    </div>
  );
}