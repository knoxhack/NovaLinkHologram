import { useState, useEffect } from "react";

export function useHologram() {
  const [rotationSpeed, setRotationSpeed] = useState(0.3);
  const [pulseIntensity, setPulseIntensity] = useState(1.0);
  
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
  const pulse = () => {
    setPulseIntensity(2.0);
    setTimeout(() => {
      setPulseIntensity(1.0);
    }, 2000);
  };
  
  return {
    rotationSpeed,
    pulseIntensity,
    pulse,
  };
}
