import { useRef, useState, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { useSpring, animated } from "@react-spring/three";
import * as THREE from "three";

interface HologramModelProps {
  position: [number, number, number];
  scale: number;
  rotationSpeed: number;
  pulseIntensity: number;
  showAlert?: boolean;
}

export function HologramModel({ 
  position, 
  scale,
  rotationSpeed,
  pulseIntensity,
  showAlert = false 
}: HologramModelProps) {
  const meshRef = useRef<THREE.Mesh>(null!);
  const innerRef = useRef<THREE.Mesh>(null!);
  const circuitRef = useRef<THREE.Mesh>(null!);
  const alertRef = useRef<THREE.Mesh>(null!);
  
  // State for animation
  const [hovered, setHovered] = useState(false);
  
  // Spring animation for the alert
  const alertSpring = useSpring({
    scale: showAlert ? 1 : 0,
    config: { mass: 1, tension: 280, friction: 60 }
  });
  
  // Pulse animation
  useFrame((state, delta) => {
    // Rotate the hologram slowly
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * rotationSpeed;
    }
    
    // Make inner mesh pulse
    if (innerRef.current) {
      innerRef.current.scale.x = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.05 * pulseIntensity;
      innerRef.current.scale.y = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.05 * pulseIntensity;
      innerRef.current.scale.z = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.05 * pulseIntensity;
    }
    
    // Rotate circuit layer in opposite direction
    if (circuitRef.current) {
      circuitRef.current.rotation.y -= delta * rotationSpeed * 0.3;
      circuitRef.current.rotation.z += delta * rotationSpeed * 0.1;
    }
    
    // Pulse alert if visible
    if (alertRef.current && showAlert) {
      alertRef.current.scale.x = 1 + Math.sin(state.clock.elapsedTime * 4) * 0.1;
      alertRef.current.scale.y = 1 + Math.sin(state.clock.elapsedTime * 4) * 0.1;
      alertRef.current.scale.z = 1 + Math.sin(state.clock.elapsedTime * 4) * 0.1;
    }
  });
  
  // Create custom hologram shader material
  const hologramMaterial = new THREE.ShaderMaterial({
    uniforms: {
      time: { value: 0 },
      color: { value: new THREE.Color(0x0CFFE1) },
    },
    vertexShader: `
      varying vec2 vUv;
      varying vec3 vPosition;
      void main() {
        vUv = uv;
        vPosition = position;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform float time;
      uniform vec3 color;
      varying vec2 vUv;
      varying vec3 vPosition;
      
      float line(vec2 p, vec2 a, vec2 b, float width) {
        vec2 pa = p - a;
        vec2 ba = b - a;
        float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
        float d = length(pa - ba * h);
        return smoothstep(width, 0.0, d);
      }
      
      void main() {
        // Scanlines effect
        float scanLine = sin(vUv.y * 100.0 + time * 5.0) * 0.5 + 0.5;
        scanLine = smoothstep(0.4, 0.6, scanLine) * 0.2;
        
        // Horizontal data lines
        float dataLine = 0.0;
        for (float i = 0.0; i < 10.0; i++) {
          float y = fract((vUv.y + time * 0.1) * (i + 1.0) * 0.5);
          if (y < 0.5) {
            dataLine += 0.04;
          }
        }
        
        // Edge glow
        float edge = 1.0 - smoothstep(0.6, 0.9, distance(vUv, vec2(0.5)));
        
        // Final color
        vec3 finalColor = color * (0.5 + edge * 0.5 + scanLine + dataLine);
        float alpha = 0.75 * edge + scanLine + dataLine;
        
        gl_FragColor = vec4(finalColor, alpha);
      }
    `,
    transparent: true,
    side: THREE.DoubleSide,
  });
  
  // Update time uniform
  useFrame(({ clock }) => {
    hologramMaterial.uniforms.time.value = clock.getElapsedTime();
  });
  
  // Circuit material
  const circuitMaterial = new THREE.ShaderMaterial({
    uniforms: {
      time: { value: 0 },
      color: { value: new THREE.Color(0xFF45E9) },
    },
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform float time;
      uniform vec3 color;
      varying vec2 vUv;
      
      float random(vec2 st) {
        return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
      }
      
      void main() {
        // Create circuit pattern
        float cell = 0.1;
        vec2 grid = fract(vUv / cell);
        float r = random(floor(vUv / cell));
        
        // Draw circuit lines
        float line = 0.0;
        if (r > 0.8) {
          line = smoothstep(0.45, 0.55, grid.x) + smoothstep(0.45, 0.55, grid.y);
        } else if (r > 0.6) {
          line = smoothstep(0.45, 0.55, grid.x);
        } else if (r > 0.4) {
          line = smoothstep(0.45, 0.55, grid.y);
        }
        
        // Pulse effect
        float pulse = sin(time + r * 10.0) * 0.5 + 0.5;
        line *= 0.5 + pulse * 0.5;
        
        // Edge fade
        float edge = 1.0 - smoothstep(0.4, 0.8, distance(vUv, vec2(0.5)));
        
        vec3 finalColor = color * line;
        float alpha = line * edge * 0.5;
        
        gl_FragColor = vec4(finalColor, alpha);
      }
    `,
    transparent: true,
    side: THREE.DoubleSide,
  });
  
  // Update time uniform for circuit material
  useFrame(({ clock }) => {
    circuitMaterial.uniforms.time.value = clock.getElapsedTime();
  });
  
  // Alert material
  const alertMaterial = new THREE.MeshBasicMaterial({
    color: new THREE.Color(0xFF4B4B),
    transparent: true,
    opacity: 0.8,
  });

  return (
    <group position={position} scale={scale}>
      {/* Main hologram body */}
      <mesh
        ref={meshRef}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        {/* Core cylinder */}
        <cylinderGeometry args={[0.5, 0.5, 2, 32, 1, true]} />
        <primitive object={hologramMaterial} attach="material" />
        
        {/* Inner glowing core */}
        <mesh ref={innerRef} scale={[0.8, 0.8, 0.8]}>
          <sphereGeometry args={[0.6, 32, 32]} />
          <meshBasicMaterial color={0x3772FF} transparent opacity={0.2} />
        </mesh>
        
        {/* Circuit overlay */}
        <mesh ref={circuitRef} scale={[1.1, 1.1, 1.1]}>
          <cylinderGeometry args={[0.55, 0.55, 2.1, 32, 1, true]} />
          <primitive object={circuitMaterial} attach="material" />
        </mesh>
        
        {/* Alert icon */}
        <animated.mesh
          ref={alertRef}
          position={[0, 0.2, 0.4]}
          scale={alertSpring.scale}
        >
          <cylinderGeometry args={[0.1, 0.1, 0.1, 3]} />
          <primitive object={alertMaterial} attach="material" />
        </animated.mesh>
      </mesh>
      
      {/* Base platform with glow */}
      <mesh position={[0, -1.2, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.8, 0.8, 0.05, 32]} />
        <meshBasicMaterial color={0x0CFFE1} transparent opacity={0.5} />
      </mesh>
    </group>
  );
}
