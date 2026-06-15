"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo, useRef, useState } from "react";
import * as THREE from "three";

function ParticleField({ count = 1800 }: { count?: number }) {
  const pointsRef = useRef<THREE.Points>(null);

  const { positions, colors } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const cyan = new THREE.Color("#00d4ff");
    const purple = new THREE.Color("#8b5cf6");

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      positions[i3] = (Math.random() - 0.5) * 22;
      positions[i3 + 1] = (Math.random() - 0.5) * 14;
      positions[i3 + 2] = (Math.random() - 0.5) * 14;

      const c = Math.random() > 0.5 ? cyan : purple;
      const intensity = 0.35 + Math.random() * 0.65;
      colors[i3] = c.r * intensity;
      colors[i3 + 1] = c.g * intensity;
      colors[i3 + 2] = c.b * intensity;
    }
    return { positions, colors };
  }, [count]);

  useFrame((state) => {
    if (!pointsRef.current) return;
    const t = state.clock.getElapsedTime();
    // slow rotation
    pointsRef.current.rotation.y = t * 0.04;
    pointsRef.current.rotation.x = Math.sin(t * 0.05) * 0.08;

    // parallax toward pointer
    const targetX = sharedMouse.x * 0.06;
    const targetY = sharedMouse.y * 0.04;
    pointsRef.current.position.x +=
      (targetX - pointsRef.current.position.x) * 0.03;
    pointsRef.current.position.y +=
      (-targetY - pointsRef.current.position.y) * 0.03;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.045}
        vertexColors
        transparent
        opacity={0.85}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

// lightweight shared mouse via module scope (no extra deps)
const sharedMouse = { x: 0, y: 0 };

export function ParticleBackground() {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  return (
    <div
      className="fixed inset-0 -z-10"
      aria-hidden="true"
      onPointerMove={(e) => {
        const x = (e.clientX / window.innerWidth - 0.5) * 2;
        const y = (e.clientY / window.innerHeight - 0.5) * 2;
        sharedMouse.x = x * 10;
        sharedMouse.y = y * 10;
        setTilt({ x, y });
      }}
    >
      {/* Base color wash */}
      <div className="absolute inset-0 bg-background" />

      {/* Animated aurora blobs */}
      <div
        className="aurora-blob absolute -left-32 top-1/4 h-[36rem] w-[36rem] rounded-full blur-[120px]"
        style={{
          background:
            "radial-gradient(circle, rgba(0,212,255,0.45), transparent 65%)",
          transform: `translate(${tilt.x * 18}px, ${tilt.y * 18}px)`,
        }}
      />
      <div
        className="aurora-blob absolute -right-24 bottom-0 h-[34rem] w-[34rem] rounded-full blur-[120px]"
        style={{
          background:
            "radial-gradient(circle, rgba(139,92,246,0.4), transparent 65%)",
          animationDelay: "-6s",
          transform: `translate(${tilt.x * -18}px, ${tilt.y * -18}px)`,
        }}
      />

      {/* 3D particles */}
      <Canvas camera={{ position: [0, 0, 9], fov: 70 }} dpr={[1, 2]}>
        <ParticleField />
      </Canvas>

      {/* Grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(0,212,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,255,0.6) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
          maskImage:
            "radial-gradient(circle at center, black 30%, transparent 80%)",
        }}
      />

      {/* Moving scanline */}
      <div className="scanline pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-transparent via-[rgba(0,212,255,0.06)] to-transparent" />

      {/* Vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_40%,rgba(3,4,10,0.85))]" />
    </div>
  );
}
