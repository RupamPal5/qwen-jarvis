"use client";
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere, Points, PointMaterial, Stars } from '@react-three/drei';
import { useRef, useMemo } from 'react';
import * as THREE from 'three';

function RotatingGlobe() {
  const meshRef = useRef<THREE.Mesh>(null);
  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.1;
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.2) * 0.1;
    }
  });

  return (
    <mesh ref={meshRef}>
      <Sphere args={[2.5, 32, 32]}>
        <meshBasicMaterial color="#4c1d95" wireframe transparent opacity={0.15} />
      </Sphere>
      <Sphere args={[2.52, 32, 32]}>
        <meshBasicMaterial color="#3b82f6" wireframe transparent opacity={0.05} />
      </Sphere>
    </mesh>
  );
}

function NeuralParticles() {
  const points = useRef<THREE.Points>(null);
  const [positions] = useMemo(() => {
    const count = 1500;
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r = 4 + Math.random() * 6;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = r * Math.cos(phi);
    }
    return [pos];
  }, []);

  useFrame((state, delta) => {
    if (points.current) {
      points.current.rotation.y -= delta * 0.05;
    }
  });

  return (
    <Points ref={points} positions={positions} stride={3} frustumCulled={false}>
      <PointMaterial transparent color="#a855f7" size={0.02} sizeAttenuation={true} depthWrite={false} />
    </Points>
  );
}

export default function Scene3D() {
  return (
    <div className="fixed inset-0 z-0">
      <Canvas camera={{ position: [0, 0, 8], fov: 45 }}>
        <ambientLight intensity={0.5} />
        <Stars radius={50} depth={50} count={2000} factor={4} saturation={0} fade speed={1} />
        <RotatingGlobe />
        <NeuralParticles />
      </Canvas>
    </div>
  );
}