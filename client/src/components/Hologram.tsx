import { useRef, useEffect, useState } from "react";
import { useHologram } from "@/hooks/useHologram";

interface HologramProps {
  showAlert?: boolean;
  spokenText?: string;
}

export default function Hologram({ showAlert = false, spokenText = "" }: HologramProps) {
  const hologramRef = useRef<HTMLDivElement>(null);
  const { pulse } = useHologram();
  const [rotation, setRotation] = useState(0);
  
  // Simulate rotation effect
  useEffect(() => {
    const rotationInterval = setInterval(() => {
      setRotation(prev => (prev + 1) % 360);
    }, 50);
    
    return () => clearInterval(rotationInterval);
  }, []);
  
  // If there's an alert, pulse the hologram
  useEffect(() => {
    if (showAlert) {
      pulse();
    }
  }, [showAlert, pulse]);
  
  return (
    <div className="absolute inset-0 hexagon-pattern flex items-center justify-center overflow-hidden">
      {/* 2D Hologram Container */}
      <div id="hologram-container" ref={hologramRef} className="relative w-full h-full flex items-center justify-center">
        {/* 2D Hologram with CSS Animations */}
        <div className="relative w-64 h-64 flex items-center justify-center">
          {/* Outer rings */}
          <div 
            className="absolute w-64 h-64 rounded-full border-4 border-primary/30 animate-pulse-slow"
            style={{ transform: `rotate(${rotation}deg)` }}
          ></div>
          <div 
            className="absolute w-56 h-56 rounded-full border-2 border-secondary/20 animate-pulse-slow"
            style={{ transform: `rotate(${-rotation * 0.5}deg)`, animationDelay: '300ms' }}
          ></div>
          
          {/* Inner hologram cylinder */}
          <div className="absolute w-40 h-52 bg-primary/10 backdrop-blur-sm rounded-full flex items-center justify-center border border-primary/30">
            {/* Avatar silhouette */}
            <div className="relative h-40 w-24 flex items-center justify-center">
              <svg 
                className="absolute w-full h-full text-primary/80" 
                viewBox="0 0 24 24" 
                fill="none"
                style={{ filter: 'drop-shadow(0 0 8px rgba(12, 255, 225, 0.8))' }}
              >
                <path 
                  d="M12 2C9.38 2 7.25 4.13 7.25 6.75C7.25 9.32 9.26 11.4 11.88 11.49C11.96 11.48 12.04 11.48 12.1 11.49C12.12 11.49 12.13 11.49 12.15 11.49C12.16 11.49 12.16 11.49 12.17 11.49C14.73 11.4 16.74 9.32 16.75 6.75C16.75 4.13 14.62 2 12 2Z" 
                  fill="currentColor" 
                  fillOpacity="0.2"
                />
                <path 
                  d="M17.08 14.15C14.29 12.29 9.74 12.29 6.93 14.15C5.66 15 4.96 16.15 4.96 17.38C4.96 18.61 5.66 19.75 6.92 20.59C8.32 21.53 10.16 22 12 22C13.84 22 15.68 21.53 17.08 20.59C18.34 19.74 19.04 18.6 19.04 17.36C19.03 16.13 18.34 14.99 17.08 14.15Z" 
                  fill="currentColor" 
                  fillOpacity="0.4"
                />
              </svg>
              
              {/* Scanning effect */}
              <div 
                className="absolute w-full h-1 bg-primary/60 blur-sm" 
                style={{ 
                  animation: 'scan 3s ease-in-out infinite',
                  top: '50%',
                  boxShadow: '0 0 10px 2px rgba(12, 255, 225, 0.6)'
                }}
              ></div>
            </div>
          </div>
          
          {/* Circulating dots */}
          <div 
            className="absolute w-48 h-48 rounded-full" 
            style={{ transform: `rotate(${rotation * 1.2}deg)` }}
          >
            <div className="absolute w-2 h-2 rounded-full bg-primary top-0 left-1/2 transform -translate-x-1/2"></div>
            <div className="absolute w-2 h-2 rounded-full bg-accent bottom-0 left-1/2 transform -translate-x-1/2"></div>
            <div className="absolute w-2 h-2 rounded-full bg-secondary left-0 top-1/2 transform -translate-y-1/2"></div>
            <div className="absolute w-2 h-2 rounded-full bg-primary right-0 top-1/2 transform -translate-y-1/2"></div>
          </div>
          
          {/* Alert indicator */}
          {showAlert && (
            <div className="absolute z-20">
              <div className="w-16 h-16 bg-destructive/20 rounded-full flex items-center justify-center alert-icon backdrop-blur-sm">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-8 w-8 text-destructive" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
            </div>
          )}
          
          {/* Hologram Base */}
          <div className="absolute bottom-1 w-48 h-4 rounded-full bg-primary/30 hologram-base"></div>
        </div>
        
        {/* Hologram UI Elements */}
        <div className="absolute top-20 left-1/2 transform -translate-x-1/2 text-center z-30">
          <h2 className="font-display text-primary text-xl animate-glow">NOVA<span className="text-white">LINK</span></h2>
          <p className="text-sm text-white/70">Holographic Assistant v2.1</p>
        </div>
        
        {/* Animated interface elements around the hologram */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 right-4 w-40 h-20 border border-primary/30 rounded-lg bg-card/10 backdrop-blur-sm flex items-center justify-center transform rotate-6 animate-pulse-slow">
            <span className="text-xs text-primary font-mono">
              {showAlert ? "Awaiting user input..." : "Processing..."}
            </span>
          </div>
          
          <div className="absolute bottom-1/4 left-4 w-40 h-16 border border-accent/30 rounded-lg bg-card/10 backdrop-blur-sm flex items-center justify-center transform -rotate-3 animate-pulse-slow" style={{ animationDelay: '500ms' }}>
            <span className="text-xs text-accent font-mono">Agent monitoring active</span>
          </div>
        </div>
        
        {/* Voice interaction indicator */}
        <div className="absolute bottom-32 left-1/2 transform -translate-x-1/2 flex flex-col items-center">
          <div className="flex items-center space-x-1 mb-2">
            <div className="h-6 w-1 bg-primary rounded-full animate-pulse-slow" style={{ animationDelay: '0ms' }}></div>
            <div className="h-10 w-1 bg-primary rounded-full animate-pulse-slow" style={{ animationDelay: '100ms' }}></div>
            <div className="h-8 w-1 bg-primary rounded-full animate-pulse-slow" style={{ animationDelay: '200ms' }}></div>
            <div className="h-12 w-1 bg-primary rounded-full animate-pulse-slow" style={{ animationDelay: '300ms' }}></div>
            <div className="h-7 w-1 bg-primary rounded-full animate-pulse-slow" style={{ animationDelay: '400ms' }}></div>
            <div className="h-9 w-1 bg-primary rounded-full animate-pulse-slow" style={{ animationDelay: '500ms' }}></div>
            <div className="h-5 w-1 bg-primary rounded-full animate-pulse-slow" style={{ animationDelay: '600ms' }}></div>
          </div>
          <p className="text-white/80 text-sm">VOICE ACTIVE</p>
        </div>
      
        {/* Overlay for spoken text */}
        <div className="absolute bottom-0 left-0 right-0 p-6 z-30">
          <div className="bg-card/70 backdrop-blur-sm border border-accent/30 rounded-lg p-4 max-w-3xl mx-auto">
            <p className="text-lg font-medium text-white">
              <span className="text-primary font-display">NOVA: </span>
              <span className="terminal-text inline-block whitespace-normal">
                {spokenText || "Alert from Agent 'ChronoCore' in Project AstroPipeline. This agent is awaiting your input about the deployment schedule. Would you like to respond now?"}
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
