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
  const [hovering, setHovering] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [dataPoints, setDataPoints] = useState<Array<{x: number, y: number, color: string}>>([]);
  
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
  
  // Generate random data points for the hologram visualization
  useEffect(() => {
    const generateRandomPoints = () => {
      const colors = ['#0CFFE1', '#FF45E9', '#3772FF', '#FFCC00'];
      const points = [];
      
      for (let i = 0; i < 40; i++) {
        const angle = Math.random() * Math.PI * 2;
        const distance = 15 + Math.random() * 15;
        const x = Math.cos(angle) * distance;
        const y = Math.sin(angle) * distance;
        
        points.push({
          x,
          y,
          color: colors[Math.floor(Math.random() * colors.length)]
        });
      }
      
      setDataPoints(points);
    };
    
    generateRandomPoints();
    
    const dataInterval = setInterval(() => {
      if (Math.random() > 0.7) { // Occasionally update the points
        generateRandomPoints();
      }
    }, 5000);
    
    return () => clearInterval(dataInterval);
  }, []);
  
  // Simulate speaking animation when spokenText changes
  useEffect(() => {
    if (spokenText) {
      setIsSpeaking(true);
      
      // Stop speaking after text would be read (rough approximation)
      const duration = spokenText.length * 50; // 50ms per character
      const timer = setTimeout(() => {
        setIsSpeaking(false);
      }, Math.min(duration, 10000)); // Cap at 10 seconds
      
      return () => clearTimeout(timer);
    }
  }, [spokenText]);
  
  return (
    <div className="absolute inset-0 hexagon-pattern flex items-center justify-center overflow-hidden">
      {/* 2D Hologram Container */}
      <div 
        id="hologram-container" 
        ref={hologramRef} 
        className="relative w-full h-full flex items-center justify-center"
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}
      >
        {/* Data visualization points in 3D space */}
        <div className="absolute w-full h-full pointer-events-none">
          {dataPoints.map((point, index) => (
            <div 
              key={index}
              className="absolute w-1 h-1 rounded-full"
              style={{
                left: `calc(50% + ${point.x}%)`,
                top: `calc(50% + ${point.y}%)`,
                backgroundColor: point.color,
                opacity: 0.6,
                boxShadow: `0 0 5px ${point.color}`,
                transform: `scale(${Math.random() * 0.5 + 0.5})`,
                animation: `dataPulse ${2 + Math.random() * 3}s ease-in-out infinite alternate`
              }}
            />
          ))}
        </div>
        
        {/* 2D Hologram with CSS Animations */}
        <div className="relative w-64 h-64 flex items-center justify-center">
          {/* Outer rings */}
          <div 
            className={`absolute w-64 h-64 rounded-full border-4 border-primary/30 animate-pulse-slow ${hovering ? 'scale-110' : ''}`}
            style={{ 
              transform: `rotate(${rotation}deg)`,
              transition: 'all 0.3s ease-out'
            }}
          ></div>
          <div 
            className="absolute w-56 h-56 rounded-full border-2 border-secondary/20 animate-pulse-slow"
            style={{ transform: `rotate(${-rotation * 0.5}deg)`, animationDelay: '300ms' }}
          ></div>
          
          {/* Inner hologram cylinder */}
          <div 
            className={`absolute w-40 h-52 bg-primary/10 backdrop-blur-sm rounded-full flex items-center justify-center border border-primary/30 ${hovering ? 'border-primary/60' : ''}`}
            style={{ transition: 'all 0.3s ease' }}
          >
            {/* Avatar silhouette */}
            <div className="relative h-40 w-24 flex items-center justify-center">
              <svg 
                className={`absolute w-full h-full text-primary/80 transition-all duration-300 ${hovering ? 'scale-110 text-primary' : ''}`} 
                viewBox="0 0 24 24" 
                fill="none"
                style={{ 
                  filter: `drop-shadow(0 0 ${hovering ? 12 : 8}px rgba(12, 255, 225, ${hovering ? '0.9' : '0.8'}))` 
                }}
              >
                {/* Head */}
                <path 
                  d="M12 2C9.38 2 7.25 4.13 7.25 6.75C7.25 9.32 9.26 11.4 11.88 11.49C11.96 11.48 12.04 11.48 12.1 11.49C12.12 11.49 12.13 11.49 12.15 11.49C12.16 11.49 12.16 11.49 12.17 11.49C14.73 11.4 16.74 9.32 16.75 6.75C16.75 4.13 14.62 2 12 2Z" 
                  fill="currentColor" 
                  fillOpacity="0.2"
                />
                {/* Body */}
                <path 
                  d="M17.08 14.15C14.29 12.29 9.74 12.29 6.93 14.15C5.66 15 4.96 16.15 4.96 17.38C4.96 18.61 5.66 19.75 6.92 20.59C8.32 21.53 10.16 22 12 22C13.84 22 15.68 21.53 17.08 20.59C18.34 19.74 19.04 18.6 19.04 17.36C19.03 16.13 18.34 14.99 17.08 14.15Z" 
                  fill="currentColor" 
                  fillOpacity="0.4"
                />
                
                {/* Face visualization (only show when speaking or hovering) */}
                {(isSpeaking || hovering) && (
                  <>
                    <ellipse 
                      cx="9.5" 
                      cy="7" 
                      rx="0.5" 
                      ry={isSpeaking ? "0.7" : "0.5"} 
                      fill="#0CFFE1" 
                      fillOpacity="0.8"
                    />
                    <ellipse 
                      cx="14.5" 
                      cy="7" 
                      rx="0.5" 
                      ry={isSpeaking ? "0.7" : "0.5"} 
                      fill="#0CFFE1" 
                      fillOpacity="0.8"
                    />
                    <path 
                      d={`M10 ${isSpeaking ? '9.5' : '9'} C10.8 ${isSpeaking ? '10' : '9.5'} 13.2 ${isSpeaking ? '10' : '9.5'} 14 ${isSpeaking ? '9.5' : '9'}`} 
                      stroke="#0CFFE1" 
                      strokeWidth="0.5" 
                      strokeLinecap="round"
                      fillOpacity="0"
                    />
                  </>
                )}
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
            <div className="absolute w-2 h-2 rounded-full bg-primary top-0 left-1/2 transform -translate-x-1/2 
                          animate-pulse-slow" style={{ boxShadow: '0 0 5px #0CFFE1' }}></div>
            <div className="absolute w-2 h-2 rounded-full bg-accent bottom-0 left-1/2 transform -translate-x-1/2 
                          animate-pulse-slow" style={{ animationDelay: '800ms', boxShadow: '0 0 5px #3772FF' }}></div>
            <div className="absolute w-2 h-2 rounded-full bg-secondary left-0 top-1/2 transform -translate-y-1/2 
                          animate-pulse-slow" style={{ animationDelay: '400ms', boxShadow: '0 0 5px #FF45E9' }}></div>
            <div className="absolute w-2 h-2 rounded-full bg-primary right-0 top-1/2 transform -translate-y-1/2 
                          animate-pulse-slow" style={{ animationDelay: '1200ms', boxShadow: '0 0 5px #0CFFE1' }}></div>
          </div>
          
          {/* Alert indicator */}
          {showAlert && (
            <div className="absolute z-20">
              <div className="w-16 h-16 bg-destructive/20 rounded-full flex items-center justify-center alert-icon backdrop-blur-sm"
                style={{ boxShadow: '0 0 15px rgba(255, 0, 60, 0.4)' }}>
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
          
          {/* Hologram Base with better glow effect */}
          <div className="absolute bottom-1 w-48 h-4 rounded-full bg-primary/30 hologram-base"
              style={{ boxShadow: '0 0 20px rgba(12, 255, 225, 0.4)' }}></div>
        </div>
        
        {/* System version info */}
        <div className="absolute top-8 left-1/2 transform -translate-x-1/2 text-center z-30">
          <h2 className="font-display text-primary text-2xl animate-glow">NOVA<span className="text-white">LINK</span></h2>
          <div className="flex items-center justify-center space-x-2">
            <span className="text-xs text-white/70 font-mono">v2.1.5</span>
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-xs text-white/70 font-mono">ONLINE</span>
          </div>
        </div>
        
        {/* Animated interface elements around the hologram */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Status panel */}
          <div className="absolute top-1/4 right-8 w-48 h-24 border border-primary/30 rounded-lg bg-card/10 backdrop-blur-sm flex flex-col p-3 transform rotate-3 animate-pulse-slow">
            <div className="text-xs text-primary/80 font-mono mb-1 flex justify-between">
              <span>SYSTEM STATUS</span>
              <span className="text-green-400">[ACTIVE]</span>
            </div>
            <div className="border-t border-primary/20 my-1"></div>
            <div className="text-xs text-primary/70 font-mono flex justify-between">
              <span>CPU</span>
              <span>68%</span>
            </div>
            <div className="text-xs text-primary/70 font-mono flex justify-between">
              <span>MEM</span>
              <span>412MB</span>
            </div>
            <div className="text-xs text-primary/70 font-mono flex justify-between">
              <span>AGENTS</span>
              <span>{showAlert ? "WAITING" : "MONITORING"}</span>
            </div>
          </div>
          
          {/* Data panel */}
          <div className="absolute bottom-1/4 left-8 w-44 h-20 border border-accent/30 rounded-lg bg-card/10 backdrop-blur-sm flex flex-col p-2 transform -rotate-2 animate-pulse-slow" style={{ animationDelay: '500ms' }}>
            <div className="text-xs text-accent/80 font-mono flex justify-between">
              <span>DATA STREAM</span>
              <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse"></div>
            </div>
            <div className="border-t border-accent/20 my-1"></div>
            <div className="flex-1 font-mono text-[8px] text-accent/60 leading-tight overflow-hidden">
              {Array(5).fill(0).map((_, i) => (
                <div key={i} className="whitespace-nowrap">
                  {Array(16).fill(0).map((_, j) => (
                    <span key={j}>{Math.floor(Math.random() * 2)}</span>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Voice interaction indicator */}
        <div className="absolute bottom-32 left-1/2 transform -translate-x-1/2 flex flex-col items-center">
          <div className="flex items-center space-x-1 mb-2">
            {[6, 10, 8, 12, 7, 9, 5].map((height, i) => (
              <div 
                key={i}
                className="w-1 bg-primary rounded-full animate-pulse-slow" 
                style={{ 
                  height: `${height + (isSpeaking ? Math.sin(i * 0.8) * 6 : 0)}px`,
                  animationDelay: `${i * 100}ms`,
                  opacity: isSpeaking ? '1' : '0.7'
                }}
              ></div>
            ))}
          </div>
          <div className="flex items-center space-x-1 text-white/80 text-xs">
            <span className={isSpeaking ? 'text-primary animate-pulse-slow' : ''}>
              {isSpeaking ? 'SPEAKING' : 'VOICE ACTIVE'}
            </span>
            {isSpeaking && (
              <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse"></div>
            )}
          </div>
        </div>
      
        {/* Overlay for spoken text with better styling */}
        <div className="absolute bottom-0 left-0 right-0 p-6 z-30">
          <div className="bg-card/70 backdrop-blur-sm border border-accent/30 rounded-lg p-4 max-w-3xl mx-auto shadow-lg"
               style={{ boxShadow: '0 4px 20px rgba(55, 114, 255, 0.2)' }}>
            <p className="text-lg font-medium text-white flex items-start">
              <span className="text-primary font-display mr-2">NOVA: </span>
              <span className={`terminal-text inline-block whitespace-normal ${isSpeaking ? 'animate-pulse-slow' : ''}`}>
                {spokenText || "Alert from Agent 'ChronoCore' in Project AstroPipeline. This agent is awaiting your input about the deployment schedule. Would you like to respond now?"}
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
