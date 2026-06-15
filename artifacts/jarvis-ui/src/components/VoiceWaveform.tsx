"use client";
import {
  useEffect, useRef
} from "react";
import {
  motion
} from "framer-motion";

interface VoiceWaveformProps {
  isActive: boolean;
  volume?: number;
}

export default function VoiceWaveform({ isActive, volume = 50 }: VoiceWaveformProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const barsRef = useRef<number[]>(Array(64).fill(0));

  useEffect(() => {
    if (!isActive) {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const barWidth = canvas.width / 64;
      const bars = barsRef.current;
      
      bars.forEach((bar, i) => {
        // Simulate voice activity with random fluctuations
        const targetHeight = isActive ? Math.random() * volume * 0.8 + 10 : 2;
        bars[i] += (targetHeight - bar) * 0.3;
        
        const gradient = ctx.createLinearGradient(0, canvas.height - bars[i], 0, canvas.height);
        gradient.addColorStop(0, 'rgba(168, 85, 247, 0.8)');
        gradient.addColorStop(0.5, 'rgba(59, 130, 246, 0.6)');
        gradient.addColorStop(1, 'rgba(6, 182, 212, 0.3)');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(i * barWidth, canvas.height - bars[i], barWidth - 2, bars[i]);
      });
      
      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isActive, volume]);

  return (
    <div className="relative w-full h-24 bg-black/40 rounded-xl border border-purple-500/30 overflow-hidden backdrop-blur-xl">
      <canvas
        ref={canvasRef}
        width={512}
        height={96}
        className="w-full h-full"
      />
      {isActive && (
        <motion.div
          className="absolute inset-0 border-2 border-purple-500/50 rounded-xl"
          animate={{
            boxShadow: [
              "0 0 20px rgba(168,85,247,0.3)",
              "0 0 40px rgba(168,85,247,0.6)",
              "0 0 20px rgba(168,85,247,0.3)"
            ]
          }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
      )}
      <div className="absolute top-2 left-3 text-[10px] text-purple-400 font-mono tracking-wider">
        {isActive ? '● LISTENING' : '○ STANDBY'}
      </div>
      <div className="absolute top-2 right-3 text-[10px] text-cyan-400 font-mono">
        {isActive ? `${volume.toFixed(0)}%` : '0%'}
      </div>
    </div>
  );
}