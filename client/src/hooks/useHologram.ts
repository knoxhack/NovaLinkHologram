import { useState, useEffect, useCallback } from "react";

export interface HologramState {
  rotationSpeed: number;
  pulseIntensity: number;
  hologramMode: 'normal' | 'alert' | 'passive' | 'analysis' | 'listening';
  speakingLevel: number;
  glitchIntensity: number;
  dataVisibility: number;
  voiceRecognitionActive: boolean;
}

export function useHologram() {
  const [rotationSpeed, setRotationSpeed] = useState(0.3);
  const [pulseIntensity, setPulseIntensity] = useState(1.0);
  const [hologramMode, setHologramMode] = useState<'normal' | 'alert' | 'passive' | 'analysis' | 'listening'>('normal');
  const [speakingLevel, setSpeakingLevel] = useState(0);
  const [glitchIntensity, setGlitchIntensity] = useState(0);
  const [dataVisibility, setDataVisibility] = useState(0.8);
  const [voiceRecognitionActive, setVoiceRecognitionActive] = useState(false);
  
  // Adjust hologram properties based on window size
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
  
  // Function to set hologram to listening mode
  const setListeningMode = useCallback((isListening: boolean) => {
    if (isListening) {
      setHologramMode('listening');
      setRotationSpeed(0.4); // Slightly faster rotation while listening
      setPulseIntensity(1.3); // More intense pulse
      setDataVisibility(0.9); // More visible data points
    } else if (hologramMode === 'listening') {
      // Only reset if we're in listening mode (don't override alert, etc.)
      setHologramMode('normal');
      setRotationSpeed(0.3);
      setPulseIntensity(1.0);
      setDataVisibility(0.8);
    }
  }, [hologramMode]);
  
  // Function to update voice recognition state
  const updateVoiceRecognitionState = useCallback((isActive: boolean) => {
    setVoiceRecognitionActive(isActive);
    setListeningMode(isActive);
    
    if (isActive) {
      // Visual effect for starting voice recognition
      glitch();
      pulse();
    }
  }, [glitch, pulse, setListeningMode]);
  
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
    voiceRecognitionActive,
    pulse,
    triggerAlert,
    triggerAnalysis,
    updateSpeaking,
    setListeningMode,
    updateVoiceRecognitionState,
    glitch,
    state: {
      rotationSpeed,
      pulseIntensity,
      hologramMode,
      speakingLevel,
      glitchIntensity,
      dataVisibility,
      voiceRecognitionActive
    } as HologramState
  };
}
