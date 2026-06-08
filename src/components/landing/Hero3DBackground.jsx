import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Stars, MeshTransmissionMaterial, Icosahedron, Torus } from '@react-three/drei';
import * as THREE from 'three';

// Custom Camera Rig that moves based on mouse pointer
const CameraRig = () => {
  useFrame((state) => {
    if (typeof document !== 'undefined' && document.visibilityState !== 'visible') return;
    // Smoothly interpolate camera position
    state.camera.position.x = THREE.MathUtils.lerp(state.camera.position.x, state.pointer.x * 2, 0.05);
    state.camera.position.y = THREE.MathUtils.lerp(state.camera.position.y, state.pointer.y * 2, 0.05);
    state.camera.lookAt(0, 0, 0);
  });
  return null;
};

// Reusable glassy shape component
const GlassShape = ({ geometry, position, color, floatIntensity = 2, rotationIntensity = 2 }) => {
  return (
    <Float 
      speed={2} // Animation speed
      rotationIntensity={rotationIntensity} // XYZ rotation intensity
      floatIntensity={floatIntensity} // Up/down float intensity
      position={position}
    >
      <mesh castShadow receiveShadow>
        {geometry}
        <MeshTransmissionMaterial 
          backside 
          samples={1} 
          thickness={0.1} 
          chromaticAberration={0.2} 
          anisotropy={0.1} 
          distortion={0.2} 
          distortionScale={0.2} 
          temporalDistortion={0.05} 
          clearcoat={0.5} 
          attenuationDistance={0.5} 
          attenuationColor={color} 
          color={color} 
        />
      </mesh>
    </Float>
  );
};

const Hero3DBackground = () => {
  return (
    <div className="absolute inset-0 z-0 pointer-events-none opacity-40">
      <Canvas
        camera={{ position: [0, 0, 10], fov: 50 }}
        dpr={1}
        gl={{ antialias: true, alpha: true, powerPreference: "low-power" }}
      >
        {/* Environment and Lighting */}
        <ambientLight intensity={0.8} />
        <directionalLight position={[10, 10, 5]} intensity={1} color="#ffffff" />
        <pointLight position={[-10, -10, -5]} intensity={1.5} color="#2563eb" /> {/* Neural Blue */}
        <pointLight position={[10, -10, -5]} intensity={1} color="#f8fafc" /> {/* Soft Gray */}

        {/* Camera Rig for Parallax */}
        <CameraRig />

        {/* Floating Geometric Primitives */}
        {/* Left Shape - Icosahedron */}
        <GlassShape 
          geometry={<icosahedronGeometry args={[1.5, 0]} />} 
          position={[-5, 2, -3]} 
          color="#2563eb" 
          floatIntensity={2}
        />
        
        {/* Right Shape - Torus */}
        <GlassShape 
          geometry={<torusGeometry args={[1.2, 0.4, 32, 64]} />} 
          position={[5, -2, -4]} 
          color="#94a3b8" 
          rotationIntensity={3}
        />

        {/* Center Top Shape - Octahedron */}
        <GlassShape 
          geometry={<octahedronGeometry args={[2, 0]} />} 
          position={[0, 6, -10]} 
          color="#e2e8f0" 
          floatIntensity={1}
          rotationIntensity={1}
        />
      </Canvas>
    </div>
  );
};

export default Hero3DBackground;
