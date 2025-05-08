import { useState, useEffect, useCallback } from "react";

export interface HologramState {
  rotationSpeed: number;
  pulseIntensity: number;
  hologramMode: 'normal' | 'alert' | 'passive' | 'analysis';
  speakingLevel: number;
  glitchIntensity: number;
  dataVisibility: number;
}

export function useHologram() {
  const [rotationSpeed, setRotationSpeed] = useState(0.3);
  const [pulseIntensity, setPulseIntensity] = useState(1.0);
  const [hologramMode, setHologramMode] = useState<'normal' | 'alert' | 'passive' | 'analysis'>('normal');
  const [speakingLevel, setSpeakingLevel] = useState(0);
  const [glitchIntensity, setGlitchIntensity] = useState(0);
  const [dataVisibility, setDataVisibility] = useState(0.8);
  
  // Optional: Adjust hologram properties based on window size or other conditions
  useEffect(() => {
    function handleResize() {
      // Adjust rotation speed based on window width
      if (window.innerWidth < 768) {
        setRotationSpeed(0.2); // Slower on mobile
      } else {
        setRotationSpeed(0.3);
      }
    }
    
    window.addEventListener('resize', handleResize);
    handleResize(); // Initial call
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  
  // Function to temporarily increase pulse intensity
  const pulse = useCallback(() => {
    setPulseIntensity(2.0);
    setTimeout(() => {
      setPulseIntensity(1.0);
    }, 2000);
  }, []);
  
  // Function to trigger alert mode
  const triggerAlert = useCallback(() => {
    setHologramMode('alert');
    setPulseIntensity(2.0);
    setGlitchIntensity(0.7);
    
    setTimeout(() => {
      setGlitchIntensity(0.2);
      setPulseIntensity(1.5);
    }, 2000);
    
    // Keep alert mode active for a while then return to normal
    setTimeout(() => {
      setHologramMode('normal');
      setPulseIntensity(1.0);
      setGlitchIntensity(0);
    }, 5000);
  }, []);
  
  // Function to trigger analysis mode
  const triggerAnalysis = useCallback(() => {
    setHologramMode('analysis');
    setDataVisibility(1);
    setRotationSpeed(0.5);
    
    // Return to normal after a while
    setTimeout(() => {
      setHologramMode('normal');
      setDataVisibility(0.8);
      setRotationSpeed(0.3);
    }, 10000);
  }, []);
  
  // Function to update speaking animation
  const updateSpeaking = useCallback((isSpeaking: boolean, textLength?: number) => {
    if (isSpeaking) {
      setSpeakingLevel(textLength ? Math.min(1, textLength / 100) : 0.8);
    } else {
      setSpeakingLevel(0);
    }
  }, []);
  
  // Function to trigger a random glitch effect
  const glitch = useCallback(() => {
    setGlitchIntensity(Math.random() * 0.8 + 0.2);
    setTimeout(() => {
      setGlitchIntensity(0);
    }, 300 + Math.random() * 700);
  }, []);
  
  // Occasionally trigger glitches for cyberpunk feel
  useEffect(() => {
    const glitchInterval = setInterval(() => {
      if (Math.random() > 0.85) {
        glitch();
      }
    }, 8000);
    
    return () => clearInterval(glitchInterval);
  }, [glitch]);
  
  return {
    rotationSpeed,
    pulseIntensity,
    hologramMode,
    speakingLevel,
    glitchIntensity,
    dataVisibility,
    pulse,
    triggerAlert,
    triggerAnalysis,
    updateSpeaking,
    glitch,
    state: {
      rotationSpeed,
      pulseIntensity,
      hologramMode,
      speakingLevel,
      glitchIntensity,
      dataVisibility
    } as HologramState
  };
}
