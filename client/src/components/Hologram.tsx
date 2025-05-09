import { useRef, useEffect, useState, useMemo, forwardRef, useImperativeHandle } from "react";
import { useHologram } from "@/hooks/useHologram";

interface HologramProps {
  showAlert?: boolean;
  spokenText?: string;
  voiceCommandActive?: boolean;
}

// Export the component types for ref usage
export interface HologramRefHandle {
  triggerAlert: () => void;
  triggerAnalysis: () => void;
  updateSpeaking: (speaking: boolean) => void;
  updateVoiceRecognitionState: (isActive: boolean) => void;
  glitch: () => void;
}

const Hologram = forwardRef<HologramRefHandle, HologramProps>(({ 
  showAlert = false, 
  spokenText = "",
  voiceCommandActive = false
}, ref) => {
  const hologramContainerRef = useRef<HTMLDivElement>(null);
  const { 
    pulse, 
    triggerAlert,
    triggerAnalysis,
    updateSpeaking,
    updateVoiceRecognitionState,
    glitch,
    glitchIntensity,
    hologramMode,
    dataVisibility,
    speakingLevel,
    voiceRecognitionActive
  } = useHologram();
  
  // Expose methods to parent components via ref
  useImperativeHandle(ref, () => ({
    triggerAlert,
    triggerAnalysis,
    updateSpeaking,
    updateVoiceRecognitionState,
    glitch
  }));
  
  const [rotation, setRotation] = useState(0);
  const [hovering, setHovering] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [dataPoints, setDataPoints] = useState<Array<{x: number, y: number, z: number, color: string, size: number}>>([]);
  const [gridPoints, setGridPoints] = useState<Array<{x: number, y: number}>>([]);
  
  // Simulate rotation effect
  useEffect(() => {
    const rotationInterval = setInterval(() => {
      setRotation(prev => (prev + 1) % 360);
    }, 50);
    
    return () => clearInterval(rotationInterval);
  }, []);
  
  // If there's an alert, trigger alert mode in the hologram
  useEffect(() => {
    if (showAlert) {
      triggerAlert();
    }
  }, [showAlert, triggerAlert]);
  
  // Update hologram state when voice command is active
  useEffect(() => {
    updateVoiceRecognitionState(voiceCommandActive);
  }, [voiceCommandActive, updateVoiceRecognitionState]);
  
  // Generate random data points for the hologram visualization in 3D space
  useEffect(() => {
    const generateRandomPoints = () => {
      const colors = ['#0CFFE1', '#FF45E9', '#3772FF', '#FFCC00'];
      const points = [];
      
      for (let i = 0; i < 60; i++) {
        // Generate points in a sphere
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.random() * Math.PI;
        const distance = 5 + Math.random() * 25;
        
        const x = Math.sin(phi) * Math.cos(theta) * distance;
        const y = Math.sin(phi) * Math.sin(theta) * distance;
        const z = Math.cos(phi) * distance; // We'll use z for sizing/opacity
        
        points.push({
          x,
          y,
          z,
          color: colors[Math.floor(Math.random() * colors.length)],
          size: 0.5 + Math.random() * 1.5
        });
      }
      
      setDataPoints(points);
    };
    
    generateRandomPoints();
    
    const dataInterval = setInterval(() => {
      if (Math.random() > 0.7) { // Occasionally update the points
        generateRandomPoints();
      }
    }, 7000);
    
    return () => clearInterval(dataInterval);
  }, []);
  
  // Generate grid points for analysis mode
  useEffect(() => {
    const points = [];
    const gridSize = 8;
    const spacing = 100 / (gridSize - 1);
    
    for (let x = 0; x < gridSize; x++) {
      for (let y = 0; y < gridSize; y++) {
        points.push({
          x: x * spacing - 50,
          y: y * spacing - 50
        });
      }
    }
    
    setGridPoints(points);
  }, []);
  
  // Simulate speaking animation when spokenText changes
  useEffect(() => {
    if (spokenText) {
      // Check if this is a live transcript from voice recognition
      const isListeningTranscript = spokenText.startsWith('Listening:');
      
      if (isListeningTranscript) {
        // For listening transcript, just update state to show we are listening
        setIsSpeaking(false);
        // We can use pulse() from useHologram to show the hologram is actively listening
        // This function already exists and is properly defined
        pulse();
      } else {
        // For regular spoken text, animate as if Nova is speaking
        setIsSpeaking(true);
        updateSpeaking(true, spokenText.length);
        
        // Stop speaking after text would be read (rough approximation)
        const duration = Math.min(spokenText.length * 50, 10000); // 50ms per character, max 10 seconds
        const timer = setTimeout(() => {
          setIsSpeaking(false);
          updateSpeaking(false);
        }, duration);
        
        return () => clearTimeout(timer);
      }
    } else {
      // No text, reset state
      setIsSpeaking(false);
      updateSpeaking(false);
    }
  }, [spokenText, updateSpeaking, pulse]);
  
  // Generate randomized but consistent binary data for stream
  const binaryData = useMemo(() => {
    const rows = 5;
    const cols = 16;
    const data = Array(rows).fill(0).map(() => 
      Array(cols).fill(0).map(() => Math.floor(Math.random() * 2))
    );
    return data;
  }, []);
  
  // Determine if avatar should glitch
  const avatarShouldGlitch = hologramMode === 'alert' || glitchIntensity > 0.5;
  
  // Determine text style based on speaking state
  const getTextAnimation = () => {
    if (isSpeaking && !spokenText.includes('"')) {
      return 'typing-animation';
    }
    return isSpeaking ? 'animate-pulse-slow' : '';
  };
  
  return (
    <div className="absolute inset-0 hexagon-pattern flex items-center justify-center overflow-hidden">
      {/* 2D Hologram Container */}
      <div 
        id="hologram-container" 
        ref={hologramContainerRef}
        className="relative w-full h-full flex items-center justify-center"
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}
      >
        {/* Analysis grid in background (only visible in analysis mode) */}
        {hologramMode === 'analysis' && (
          <div className="absolute w-full h-full pointer-events-none">
            {/* Circular scan line */}
            <div 
              className="absolute w-96 h-96 rounded-full border border-accent/30 circular-scan left-1/2 top-1/2"
              style={{ boxShadow: '0 0 20px rgba(55, 114, 255, 0.1)' }}
            ></div>
            
            {/* Grid points */}
            {gridPoints.map((point, index) => (
              <div 
                key={`grid-${index}`}
                className="absolute w-1 h-1 rounded-full bg-accent/40 analysis-grid"
                style={{
                  left: `calc(50% + ${point.x}%)`,
                  top: `calc(50% + ${point.y}%)`,
                  animationDelay: `${index * 0.05}s`
                }}
              ></div>
            ))}
          </div>
        )}
        
        {/* Data visualization points in 3D space */}
        <div className="absolute w-full h-full pointer-events-none">
          {dataPoints.map((point, index) => {
            // Adjust opacity based on Z position to create depth
            const opacity = (0.4 + (point.z + 25) / 50 * 0.6) * dataVisibility;
            const delay = index % 7;
            
            return (
              <div 
                key={index}
                className="absolute rounded-full data-point"
                style={{
                  left: `calc(50% + ${point.x}%)`,
                  top: `calc(50% + ${point.y}%)`,
                  width: `${point.size * (1 + (point.z / 50))}px`,
                  height: `${point.size * (1 + (point.z / 50))}px`,
                  backgroundColor: point.color,
                  opacity,
                  boxShadow: `0 0 ${4 + point.size * 2}px ${point.color}`,
                  animationDelay: `${delay * 0.3}s`
                }}
              ></div>
            );
          })}
        </div>
        
        {/* 2D Hologram with CSS Animations */}
        <div className="relative w-72 h-72 flex items-center justify-center">
          {/* Outer rings */}
          <div 
            className={`absolute w-72 h-72 rounded-full border-4 border-primary/30 animate-pulse-slow ${hovering ? 'scale-110' : ''} ${hologramMode === 'alert' ? 'alert-flash' : ''} ${hologramMode === 'listening' ? 'listening-pulse' : ''}`}
            style={{ 
              transform: `rotate(${rotation}deg)`,
              transition: 'all 0.3s ease-out',
              borderColor: hologramMode === 'alert' 
                ? 'rgba(255, 0, 60, 0.5)' 
                : hologramMode === 'listening' 
                  ? 'rgba(55, 114, 255, 0.6)' 
                  : '',
              boxShadow: hologramMode === 'alert' 
                ? '0 0 15px rgba(255, 0, 60, 0.3)' 
                : hologramMode === 'listening' 
                  ? '0 0 15px rgba(55, 114, 255, 0.4)' 
                  : '',
              opacity: hologramMode === 'analysis' ? 0.5 : 1
            }}
          ></div>
          <div 
            className="absolute w-64 h-64 rounded-full border-2 border-secondary/20 animate-pulse-slow"
            style={{ 
              transform: `rotate(${-rotation * 0.5}deg)`, 
              animationDelay: '300ms',
              opacity: hologramMode === 'analysis' ? 0.5 : 1,
              borderColor: hologramMode === 'listening' ? 'rgba(55, 114, 255, 0.4)' : ''
            }}
          ></div>
          
          {/* Voice recognition indicator - only visible in listening mode */}
          {hologramMode === 'listening' && (
            <div className="absolute w-80 h-80 rounded-full border border-accent/30 animate-ping-slow"
                 style={{ borderWidth: '1px', opacity: 0.6 }}
            ></div>
          )}
          
          {/* Inner hologram cylinder */}
          <div 
            className={`absolute w-48 h-60 bg-primary/10 backdrop-blur-sm rounded-full flex items-center justify-center border ${
              hovering ? 'border-primary/60' : 'border-primary/30'
            } ${
              hologramMode === 'alert' ? 'border-destructive/40' : ''
            } ${
              avatarShouldGlitch ? 'animate-glitch' : ''
            }`}
            style={{ 
              transition: 'all 0.3s ease',
              boxShadow: hologramMode === 'alert' 
                ? '0 0 20px rgba(255, 0, 60, 0.2)' 
                : hovering 
                  ? '0 0 15px rgba(12, 255, 225, 0.3)' 
                  : 'none'
            }}
          >
            {/* Avatar silhouette */}
            <div className="relative h-48 w-32 flex items-center justify-center">
              <svg 
                className={`absolute w-full h-full transition-all duration-300 ${
                  hovering ? 'scale-110' : ''
                } ${
                  hologramMode === 'alert' ? 'text-destructive/80' : 'text-primary/80'
                }`} 
                viewBox="0 0 24 24" 
                fill="none"
                style={{ 
                  filter: hovering 
                    ? `drop-shadow(0 0 12px ${hologramMode === 'alert' ? 'rgba(255, 45, 85, 0.7)' : 'rgba(12, 255, 225, 0.9)'})`
                    : `drop-shadow(0 0 8px ${hologramMode === 'alert' ? 'rgba(255, 45, 85, 0.6)' : 'rgba(12, 255, 225, 0.6)'})`
                }}
              >
                {/* Head */}
                <path 
                  d="M12 2C9.38 2 7.25 4.13 7.25 6.75C7.25 9.32 9.26 11.4 11.88 11.49C11.96 11.48 12.04 11.48 12.1 11.49C12.12 11.49 12.13 11.49 12.15 11.49C12.16 11.49 12.16 11.49 12.17 11.49C14.73 11.4 16.74 9.32 16.75 6.75C16.75 4.13 14.62 2 12 2Z" 
                  fill="currentColor" 
                  fillOpacity={avatarShouldGlitch ? "0.4" : "0.2"}
                />
                {/* Body */}
                <path 
                  d="M17.08 14.15C14.29 12.29 9.74 12.29 6.93 14.15C5.66 15 4.96 16.15 4.96 17.38C4.96 18.61 5.66 19.75 6.92 20.59C8.32 21.53 10.16 22 12 22C13.84 22 15.68 21.53 17.08 20.59C18.34 19.74 19.04 18.6 19.04 17.36C19.03 16.13 18.34 14.99 17.08 14.15Z" 
                  fill="currentColor" 
                  fillOpacity={avatarShouldGlitch ? "0.7" : "0.4"}
                />
                
                {/* Face visualization (changes with state) */}
                {(isSpeaking || hovering || hologramMode === 'alert') && (
                  <>
                    <ellipse 
                      cx="9.5" 
                      cy="7" 
                      rx="0.5" 
                      ry={isSpeaking ? (0.5 + speakingLevel * 0.4) : "0.5"} 
                      fill={hologramMode === 'alert' ? "#FF2D55" : "#0CFFE1"} 
                      fillOpacity={hologramMode === 'alert' ? "0.9" : "0.8"}
                    />
                    <ellipse 
                      cx="14.5" 
                      cy="7" 
                      rx="0.5" 
                      ry={isSpeaking ? (0.5 + speakingLevel * 0.4) : "0.5"} 
                      fill={hologramMode === 'alert' ? "#FF2D55" : "#0CFFE1"} 
                      fillOpacity={hologramMode === 'alert' ? "0.9" : "0.8"}
                    />
                    <path 
                      d={`M10 ${hologramMode === 'alert' ? '9.8' : isSpeaking ? `${9 + speakingLevel * 0.8}` : '9'} C10.8 ${hologramMode === 'alert' ? '9.2' : isSpeaking ? `${9.5 + speakingLevel * 0.8}` : '9.5'} 13.2 ${hologramMode === 'alert' ? '9.2' : isSpeaking ? `${9.5 + speakingLevel * 0.8}` : '9.5'} 14 ${hologramMode === 'alert' ? '9.8' : isSpeaking ? `${9 + speakingLevel * 0.8}` : '9'}`} 
                      stroke={hologramMode === 'alert' ? "#FF2D55" : "#0CFFE1"} 
                      strokeWidth="0.5" 
                      strokeLinecap="round"
                      fillOpacity="0"
                    />
                  </>
                )}
              </svg>
              
              {/* Scanning effect */}
              <div 
                className="absolute w-full h-1 blur-sm" 
                style={{ 
                  animation: 'scan 3s ease-in-out infinite',
                  top: '50%',
                  background: hologramMode === 'alert' ? 'rgba(255, 45, 85, 0.6)' : 'rgba(12, 255, 225, 0.6)',
                  boxShadow: hologramMode === 'alert' 
                    ? '0 0 10px 2px rgba(255, 45, 85, 0.6)' 
                    : '0 0 10px 2px rgba(12, 255, 225, 0.6)'
                }}
              ></div>
            </div>
          </div>
          
          {/* Circulating dots */}
          <div 
            className="absolute w-56 h-56 rounded-full" 
            style={{ transform: `rotate(${rotation * 1.2}deg)` }}
          >
            <div 
              className="absolute w-2 h-2 rounded-full top-0 left-1/2 transform -translate-x-1/2 animate-pulse-slow" 
              style={{ 
                background: hologramMode === 'alert' ? '#FF2D55' : '#0CFFE1',
                boxShadow: hologramMode === 'alert' ? '0 0 5px #FF2D55' : '0 0 5px #0CFFE1',
              }}
            ></div>
            <div 
              className="absolute w-2 h-2 rounded-full bottom-0 left-1/2 transform -translate-x-1/2 animate-pulse-slow" 
              style={{ 
                animationDelay: '800ms', 
                background: hologramMode === 'alert' ? '#FF8C8C' : '#3772FF',
                boxShadow: hologramMode === 'alert' ? '0 0 5px #FF8C8C' : '0 0 5px #3772FF'
              }}
            ></div>
            <div 
              className="absolute w-2 h-2 rounded-full left-0 top-1/2 transform -translate-y-1/2 animate-pulse-slow" 
              style={{ 
                animationDelay: '400ms', 
                background: hologramMode === 'alert' ? '#FF453A' : '#FF45E9',
                boxShadow: hologramMode === 'alert' ? '0 0 5px #FF453A' : '0 0 5px #FF45E9'
              }}
            ></div>
            <div 
              className="absolute w-2 h-2 rounded-full right-0 top-1/2 transform -translate-y-1/2 animate-pulse-slow" 
              style={{ 
                animationDelay: '1200ms', 
                background: hologramMode === 'alert' ? '#FF2D55' : '#0CFFE1',
                boxShadow: hologramMode === 'alert' ? '0 0 5px #FF2D55' : '0 0 5px #0CFFE1'
              }}
            ></div>
          </div>
          
          {/* Alert indicator */}
          {showAlert && (
            <div className="absolute z-20">
              <div className="w-16 h-16 bg-destructive/30 rounded-full flex items-center justify-center alert-icon backdrop-blur-sm alert-flash"
                style={{ boxShadow: '0 0 20px rgba(255, 0, 60, 0.5)' }}>
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-8 w-8 text-destructive animate-pulse" 
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
          <div className="absolute bottom-1 w-52 h-4 rounded-full bg-primary/30 hologram-base"
              style={{ 
                boxShadow: hologramMode === 'alert' 
                  ? '0 0 30px rgba(255, 45, 85, 0.4)' 
                  : '0 0 30px rgba(12, 255, 225, 0.4)',
                background: hologramMode === 'alert' 
                  ? 'rgba(255, 45, 85, 0.3)' 
                  : 'rgba(12, 255, 225, 0.3)'
              }}>
          </div>
          
          {/* Analysis mode overlay circular indicators */}
          {hologramMode === 'analysis' && (
            <>
              <div className="absolute w-32 h-32 rounded-full border border-accent/30 circular-scan"
                style={{ animationDuration: '8s' }}></div>
              <div className="absolute w-40 h-40 rounded-full border border-primary/20 circular-scan"
                style={{ animationDuration: '12s', animationDirection: 'reverse' }}></div>
            </>
          )}
        </div>
        
        {/* System version info */}
        <div className="absolute top-8 left-1/2 transform -translate-x-1/2 text-center z-30">
          <h2 className={`font-display text-2xl animate-glow ${hologramMode === 'alert' ? 'text-destructive' : 'text-primary'}`}>
            NOVA<span className="text-white">LINK</span>
          </h2>
          <div className="flex items-center justify-center space-x-2">
            <span className="text-xs text-white/70 font-mono">v2.1.5</span>
            <div 
              className={`w-1.5 h-1.5 rounded-full animate-pulse ${
                hologramMode === 'alert' ? 'bg-destructive' : 'bg-green-500'
              }`}
            ></div>
            <span className="text-xs text-white/70 font-mono">
              {hologramMode === 'alert' ? 'ALERT' : hologramMode === 'analysis' ? 'ANALYZING' : 'ONLINE'}
            </span>
          </div>
        </div>
        
        {/* Animated interface elements around the hologram */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Status panel */}
          <div 
            className={`absolute top-1/4 right-8 w-48 h-24 border rounded-lg bg-card/10 backdrop-blur-sm flex flex-col p-3 transform rotate-3 animate-pulse-slow ${
              hologramMode === 'alert' ? 'border-destructive/40 alert-flash' : 'border-primary/30'
            }`}
            style={{ 
              boxShadow: hologramMode === 'alert' 
                ? '0 0 10px rgba(255, 45, 85, 0.2)' 
                : '0 0 10px rgba(12, 255, 225, 0.1)'
            }}
          >
            <div className={`text-xs font-mono mb-1 flex justify-between ${
              hologramMode === 'alert' ? 'text-destructive/80' : 'text-primary/80'
            }`}>
              <span>SYSTEM STATUS</span>
              <span className={hologramMode === 'alert' ? 'text-destructive animate-pulse' : 'text-green-400'}>
                [{hologramMode === 'alert' ? 'ALERT' : 'ACTIVE'}]
              </span>
            </div>
            <div className={`border-t my-1 ${
              hologramMode === 'alert' ? 'border-destructive/20' : 'border-primary/20'
            }`}></div>
            <div className={`text-xs font-mono flex justify-between ${
              hologramMode === 'alert' ? 'text-destructive/70' : 'text-primary/70'
            }`}>
              <span>CPU</span>
              <span>{hologramMode === 'alert' ? '86%' : '68%'}</span>
            </div>
            <div className={`text-xs font-mono flex justify-between ${
              hologramMode === 'alert' ? 'text-destructive/70' : 'text-primary/70'
            }`}>
              <span>MEM</span>
              <span>{hologramMode === 'alert' ? '623MB' : '412MB'}</span>
            </div>
            <div className={`text-xs font-mono flex justify-between ${
              hologramMode === 'alert' ? 'text-destructive/70' : 'text-primary/70'
            }`}>
              <span>AGENTS</span>
              <span className={hologramMode === 'alert' ? 'animate-pulse' : ''}>
                {hologramMode === 'alert' 
                  ? "NEEDS ATTENTION" 
                  : hologramMode === 'analysis' 
                    ? "ANALYZING" 
                    : "MONITORING"}
              </span>
            </div>
          </div>
          
          {/* Data panel */}
          <div 
            className="absolute bottom-1/4 left-8 w-44 h-20 border rounded-lg bg-card/10 backdrop-blur-sm flex flex-col p-2 transform -rotate-2 animate-pulse-slow" 
            style={{ 
              animationDelay: '500ms',
              borderColor: hologramMode === 'analysis' ? 'rgba(55, 114, 255, 0.5)' : 'rgba(55, 114, 255, 0.3)',
              boxShadow: hologramMode === 'analysis' ? '0 0 15px rgba(55, 114, 255, 0.3)' : 'none'
            }}
          >
            <div className="text-xs text-accent/80 font-mono flex justify-between">
              <span>{hologramMode === 'analysis' ? 'ANALYZING' : 'DATA STREAM'}</span>
              <div className={`w-1.5 h-1.5 rounded-full bg-accent animate-pulse ${
                hologramMode === 'analysis' ? 'bg-accent' : ''
              }`}></div>
            </div>
            <div className="border-t border-accent/20 my-1"></div>
            <div className="flex-1 font-mono text-[8px] text-accent/60 leading-tight overflow-hidden">
              {binaryData.map((row, i) => (
                <div key={i} className="whitespace-nowrap">
                  {row.map((bit, j) => (
                    <span 
                      key={j} 
                      className={hologramMode === 'analysis' ? 'text-accent' : ''}
                      style={{ 
                        animationDelay: `${(i * 16 + j) * 0.1}s`,
                        opacity: hologramMode === 'analysis' ? (Math.random() * 0.5 + 0.5) : undefined
                      }}
                    >
                      {bit}
                    </span>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Voice interaction indicator */}
        <div className="absolute bottom-32 left-1/2 transform -translate-x-1/2 flex flex-col items-center">
          <div className="flex items-center space-x-1 mb-2">
            {[6, 10, 8, 12, 7, 9, 5].map((height, i) => {
              // Calculate dynamic height based on speaking level and mode
              const dynamicHeight = height + (
                isSpeaking 
                  ? (Math.sin(Date.now() / 200 + i * 0.8) * 6 * speakingLevel) 
                  : hologramMode === 'alert' 
                    ? (Math.sin(Date.now() / 100 + i * 0.5) * 3) 
                    : 0
              );
              
              return (
                <div 
                  key={i}
                  className={`w-1 rounded-full animate-pulse-slow ${
                    hologramMode === 'alert' ? 'bg-destructive/80' : 'bg-primary'
                  }`}
                  style={{ 
                    height: `${dynamicHeight}px`,
                    animationDelay: `${i * 100}ms`,
                    opacity: isSpeaking ? (0.7 + speakingLevel * 0.3) : (
                      hologramMode === 'alert' ? '0.8' : '0.7'
                    )
                  }}
                ></div>
              );
            })}
          </div>
          <div className="flex items-center space-x-1 text-white/80 text-xs">
            <span className={isSpeaking 
              ? hologramMode === 'alert' ? 'text-destructive animate-pulse' : 'text-primary animate-pulse-slow' 
              : hologramMode === 'alert' ? 'text-destructive/80' : ''
            }>
              {isSpeaking 
                ? 'SPEAKING' 
                : hologramMode === 'alert' 
                  ? 'ALERT ACTIVE' 
                  : hologramMode === 'analysis' 
                    ? 'ANALYZING' 
                    : 'VOICE ACTIVE'}
            </span>
            {(isSpeaking || hologramMode === 'alert') && (
              <div className={`h-1.5 w-1.5 rounded-full animate-pulse ${
                hologramMode === 'alert' ? 'bg-destructive' : 'bg-primary'
              }`}></div>
            )}
          </div>
        </div>
      
        {/* Overlay for spoken text with better styling */}
        <div className="absolute bottom-0 left-0 right-0 p-6 z-30">
          <div 
            className={`backdrop-blur-sm border rounded-lg p-4 max-w-3xl mx-auto shadow-lg ${
              hologramMode === 'alert' ? 'bg-card/60 border-destructive/40' : 'bg-card/70 border-accent/30'
            }`}
            style={{ 
              boxShadow: hologramMode === 'alert' 
                ? '0 4px 20px rgba(255, 45, 85, 0.2)' 
                : '0 4px 20px rgba(55, 114, 255, 0.2)'
            }}
          >
            <p className="text-lg font-medium text-white flex items-start">
              <span className={hologramMode === 'alert' ? 'text-destructive font-display mr-2' : 'text-primary font-display mr-2'}>
                NOVA:
              </span>
              <span className={`terminal-text inline-block whitespace-normal ${getTextAnimation()}`}>
                {spokenText || (
                  hologramMode === 'alert' 
                    ? "Alert from Agent 'ChronoCore' in Project AstroPipeline. This agent is awaiting your input about the deployment schedule. Would you like to respond now?" 
                    : hologramMode === 'analysis'
                      ? "Running diagnostics on all active agents. System performance is nominal. Would you like to review the detailed metrics?"
                      : "How can I assist you today? I'm monitoring all active agents and ready to execute your commands."
                )}
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
});

export default Hologram;
