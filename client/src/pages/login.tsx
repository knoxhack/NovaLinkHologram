import { useAuth } from "../hooks/useAuth";
import { useEffect, useState, useRef } from "react";
import { useLocation } from "wouter";
import { 
  Loader2, Shield, Lock, LogIn, EyeOff, Fingerprint, 
  Terminal, ChevronRight, Scan, ShieldCheck, AlertCircle, Zap
} from "lucide-react";

export default function Login() {
  const { isAuthenticated, isLoading, error } = useAuth();
  const [location, setLocation] = useLocation();
  const [redirecting, setRedirecting] = useState(false);
  const [visible, setVisible] = useState(false);
  const [scanningEffect, setScanningEffect] = useState(false);
  const [consoleText, setConsoleText] = useState("");
  const [bootSequence, setBootSequence] = useState(0);
  const consoleLines = [
    "SYSTEM: Initializing command interface...",
    "SYSTEM: Establishing secure connection...",
    "SYSTEM: Connecting to authentication service...",
    "SYSTEM: Authentication required to proceed.",
  ];
  
  // Used for typing effect
  const terminalRef = useRef<HTMLDivElement>(null);
  
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
  
  // Create typing effect for terminal
  useEffect(() => {
    if (visible && bootSequence < consoleLines.length) {
      const typingInterval = setInterval(() => {
        setBootSequence(prev => prev + 1);
      }, 800);
      
      return () => clearInterval(typingInterval);
    }
  }, [visible, bootSequence, consoleLines.length]);
  
  // Handle console text typing effect
  useEffect(() => {
    if (bootSequence > 0 && bootSequence <= consoleLines.length) {
      let i = 0;
      const currentLine = consoleLines[bootSequence - 1];
      const interval = setInterval(() => {
        if (i < currentLine.length) {
          setConsoleText(prev => prev + currentLine.charAt(i));
          i++;
        } else {
          setConsoleText(prev => prev + "\n");
          clearInterval(interval);
        }
      }, 15);
      
      return () => clearInterval(interval);
    }
  }, [bootSequence, consoleLines]);
  
  // Auto-scroll console
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [consoleText]);

  // Handle Replit login
  const handleLogin = () => {
    setRedirecting(true);
    setScanningEffect(true);
    
    // Brief delay before redirecting for animation
    setTimeout(() => {
      window.location.href = '/api/login';
    }, 1000);
  };
  
  // Security features to display
  const securityFeatures = [
    { icon: <ShieldCheck className="w-3.5 h-3.5 mr-1.5" />, text: "Multi-factor Auth" },
    { icon: <Lock className="w-3.5 h-3.5 mr-1.5" />, text: "End-to-End Encryption" },
    { icon: <Scan className="w-3.5 h-3.5 mr-1.5" />, text: "Biometric Verification" },
    { icon: <AlertCircle className="w-3.5 h-3.5 mr-1.5" />, text: "Anomaly Detection" },
  ];
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#0A0E17] overflow-hidden">
      {/* Background grid with animation */}
      <div className="absolute inset-0 grid-bg opacity-20"></div>
      
      {/* Scanning beam effect */}
      {scanningEffect && (
        <div className="absolute inset-0 pointer-events-none z-10">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-transparent via-primary to-transparent animate-scanner"></div>
        </div>
      )}
      
      {/* Animated floating cyber elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-primary/80 rounded-full data-point"></div>
        <div className="absolute top-3/4 right-1/4 w-2 h-2 bg-secondary/80 rounded-full data-point" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-2/4 left-3/4 w-2 h-2 bg-accent/80 rounded-full data-point" style={{animationDelay: '0.5s'}}></div>
        <div className="absolute top-1/3 right-1/3 w-1.5 h-1.5 bg-primary/60 rounded-full data-point" style={{animationDelay: '1.5s'}}></div>
        <div className="absolute bottom-1/4 left-2/3 w-1.5 h-1.5 bg-secondary/60 rounded-full data-point" style={{animationDelay: '2s'}}></div>
      </div>
      
      {/* Circular scan effects */}
      <div className="absolute top-1/2 left-1/2 w-[600px] h-[600px] border border-primary/10 rounded-full circular-scan opacity-20"></div>
      <div className="absolute top-1/2 left-1/2 w-[400px] h-[400px] border border-accent/10 rounded-full circular-scan opacity-10" 
        style={{animationDelay: '1s', animationDuration: '12s'}}></div>
      <div className="absolute top-1/2 left-1/2 w-[200px] h-[200px] border border-secondary/10 rounded-full circular-scan opacity-15" 
        style={{animationDelay: '0.5s', animationDuration: '8s'}}></div>
      
      {/* Logo with animation */}
      <div className={`text-5xl font-display font-bold mb-8 flex items-center transition-all duration-1000 transform ${visible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
        <div className="relative">
          <span className="text-secondary relative z-10">Nova</span>
          <span className="text-primary relative z-10">Link</span>
          <div className="absolute -top-5 -right-5 w-8 h-8 border border-primary/30 rounded-full flex items-center justify-center animate-pulse-slow">
            <div className="w-4 h-4 bg-primary/30 rounded-full"></div>
          </div>
          <Zap className="absolute -bottom-1 -left-6 h-6 w-6 text-primary/70" />
        </div>
      </div>
      
      <div className="grid md:grid-cols-2 gap-6 max-w-5xl w-full px-4">
        {/* Terminal console */}
        <div className={`relative transition-all duration-700 transform ${visible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`} 
          style={{transitionDelay: '200ms'}}>
          <div className="bg-[#0a1121]/90 backdrop-blur-md border border-primary/20 rounded-lg overflow-hidden shadow-glow">
            {/* Terminal header */}
            <div className="bg-[#0a1929] px-4 py-2 border-b border-primary/20 flex items-center">
              <Terminal className="h-4 w-4 text-primary mr-2" />
              <div className="text-xs font-mono text-primary/80">system_console.sh</div>
              <div className="ml-auto flex space-x-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-destructive/60"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-primary/60"></div>
              </div>
            </div>
            
            {/* Terminal content */}
            <div 
              ref={terminalRef}
              className="p-4 h-[300px] font-mono text-xs overflow-y-auto flex flex-col text-green-400"
            >
              <div className="mb-2 text-primary/80">
                {`> NovaLink Agent Command System v2.4.1`}
              </div>
              <div className="mb-4 text-primary/60">
                {`> Copyright © 2025 Replit, Inc. All Rights Reserved.`}
              </div>
              
              {/* Boot sequence animation */}
              <div className="space-y-1">
                <div className="text-muted-foreground whitespace-pre-line">{consoleText}</div>
                {bootSequence >= consoleLines.length && (
                  <div className="flex items-center text-primary animate-pulse mt-4">
                    <ChevronRight className="h-3 w-3 mr-1" />
                    <span>Ready for authentication</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Security feature list */}
          <div className="mt-4 grid grid-cols-2 gap-2">
            {securityFeatures.map((feature, idx) => (
              <div 
                key={idx} 
                className="flex items-center p-2 bg-card/50 backdrop-blur-sm border border-primary/10 rounded text-xs"
                style={{ animationDelay: `${idx * 0.2}s` }}
              >
                <div className="text-primary mr-1.5">
                  {feature.icon}
                </div>
                <span className="text-muted-foreground font-mono">{feature.text}</span>
              </div>
            ))}
          </div>
        </div>
        
        {/* Login card with hologram scan effect */}
        <div className={`relative hologram-scan bg-card/90 backdrop-blur-lg p-6 rounded-lg shadow-glow border border-accent/30 max-w-md w-full transition-all duration-700 transform ${visible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}
          style={{transitionDelay: '400ms'}}
        >
          <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
            <Shield className="w-8 h-8 text-primary animate-pulse" />
          </div>
          
          <h1 className="text-2xl font-bold mb-2 text-center pt-4 font-display bg-clip-text text-transparent bg-gradient-to-r from-primary via-primary to-accent">Command Center Access</h1>
          
          <div className="space-y-4 mb-6 mt-2">
            <div className="space-y-2">
              <p className="text-muted-foreground text-center text-sm">
                Secure authentication required to access NovaLink agent control system
              </p>
            </div>
            
            {/* Security badges */}
            <div className="flex justify-center space-x-3 my-4">
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
          
          {/* Error message display */}
          {error && (
            <div className="mb-6 p-3 bg-destructive/10 border border-destructive/30 rounded-md text-sm text-destructive">
              <div className="flex items-center mb-1">
                <AlertCircle className="w-4 h-4 mr-2" />
                <span className="font-medium">Authentication Error</span>
              </div>
              <p className="text-xs ml-6">Please try again or contact system administrator.</p>
            </div>
          )}
          
          {/* Login button with animations */}
          <button
            onClick={handleLogin}
            disabled={redirecting || isLoading}
            className="w-full py-4 px-4 bg-primary/90 hover:bg-primary text-primary-foreground rounded-md font-medium transition-all duration-300 flex items-center justify-center space-x-2 shadow-glow group relative overflow-hidden"
          >
            {redirecting ? (
              <>
                <div className="absolute inset-0 bg-primary/10 animate-scanner h-1"></div>
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
          
          <div className="mt-6 pt-2 relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-accent/20"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-card px-2 text-muted-foreground font-mono">SECURITY PROTOCOL</span>
            </div>
          </div>
          
          <p className="text-xs text-muted-foreground text-center mt-3 font-mono">
            ACCESS-LEVEL: CLASSIFIED • AUTHORIZATION REQUIRED
            <br />
            All connections and commands are monitored and recorded.
          </p>
          
          {/* Animated security indicator */}
          <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 h-2 w-16 overflow-hidden opacity-70">
            <div className="h-full bg-gradient-to-r from-primary via-transparent to-primary animate-pulse-slow"></div>
          </div>
        </div>
      </div>
    </div>
  );
}