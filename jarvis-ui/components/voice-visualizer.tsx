"use client";

import { motion } from "framer-motion";
import { useEffect, useRef } from "react";

type VoiceVisualizerProps = {
  active?: boolean;
  bars?: number;
};

export function VoiceVisualizer({ active = false, bars = 48 }: VoiceVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const phaseRef = useRef(0);
  const ampRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const draw = () => {
      const rect = canvas.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;
      ctx.clearRect(0, 0, w, h);

      const cx = w / 2;
      const cy = h / 2;

      // ease amplitude toward target
      const target = active ? 1 : 0.18;
      ampRef.current += (target - ampRef.current) * 0.08;
      phaseRef.current += active ? 0.09 : 0.03;

      const gap = w / (bars + 2);
      const half = bars / 2;

      for (let i = 0; i < bars; i++) {
        // symmetrical: distance from center
        const dist = Math.abs(i - half) / half; // 0 center -> 1 edges
        const falloff = 1 - dist * 0.75;
        const wave =
          Math.sin(phaseRef.current + i * 0.45) * 0.5 +
          Math.sin(phaseRef.current * 0.6 + i * 0.9) * 0.5;
        const noise = active ? 0.4 + Math.random() * 0.6 : 0.3;
        const barH =
          (8 + Math.abs(wave) * 90 * ampRef.current * falloff * noise) *
          (0.5 + falloff);

        const x = gap + i * gap;

        const grad = ctx.createLinearGradient(x, cy - barH, x, cy + barH);
        grad.addColorStop(0, "rgba(139,92,246,0.95)");
        grad.addColorStop(0.5, "rgba(0,212,255,0.95)");
        grad.addColorStop(1, "rgba(139,92,246,0.95)");

        ctx.fillStyle = grad;
        ctx.shadowBlur = 16 * ampRef.current;
        ctx.shadowColor = "rgba(0,212,255,0.7)";

        const bw = Math.max(2, gap * 0.45);
        // top + bottom mirror
        roundRect(ctx, x - bw / 2, cy - barH, bw, barH * 2, bw / 2);
        ctx.fill();
      }
      ctx.shadowBlur = 0;

      rafRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
    };
  }, [active, bars]);

  return (
    <div className="relative flex aspect-square w-full max-w-md items-center justify-center">
      {/* outer rotating rings */}
      <motion.div
        className="absolute inset-0 rounded-full border border-[var(--color-cyan)]/20"
        animate={{ rotate: 360 }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
      />
      <motion.div
        className="absolute inset-6 rounded-full border border-dashed border-[var(--color-purple)]/30"
        animate={{ rotate: -360 }}
        transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
      />
      <motion.div
        className="absolute inset-12 rounded-full border border-[var(--color-cyan)]/15"
        animate={{ rotate: 360 }}
        transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
      />

      {/* glow halo */}
      <motion.div
        className="absolute inset-16 rounded-full blur-2xl"
        style={{
          background:
            "radial-gradient(circle, rgba(0,212,255,0.5), rgba(139,92,246,0.25) 60%, transparent 75%)",
        }}
        animate={{
          scale: active ? [1, 1.18, 1] : [1, 1.05, 1],
          opacity: active ? [0.6, 1, 0.6] : [0.4, 0.55, 0.4],
        }}
        transition={{
          duration: active ? 1.6 : 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* center orb */}
      <motion.div
        className="glow-cyan absolute z-10 flex h-28 w-28 items-center justify-center rounded-full border border-white/30 bg-gradient-to-br from-[var(--color-cyan)]/30 to-[var(--color-purple)]/30 backdrop-blur-md sm:h-32 sm:w-32"
        animate={{
          scale: active ? [1, 1.12, 1] : [1, 1.04, 1],
        }}
        transition={{
          duration: active ? 1.1 : 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <motion.div
          className="h-14 w-14 rounded-full bg-gradient-to-br from-[var(--color-cyan-soft)] to-[var(--color-purple-soft)] sm:h-16 sm:w-16"
          animate={{
            scale: active ? [1, 0.82, 1] : [1, 0.94, 1],
            boxShadow: [
              "0 0 24px rgba(0,212,255,0.8)",
              "0 0 48px rgba(139,92,246,0.9)",
              "0 0 24px rgba(0,212,255,0.8)",
            ],
          }}
          transition={{
            duration: active ? 1.1 : 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </motion.div>

      {/* waveform canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full"
        aria-hidden="true"
      />
    </div>
  );
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}
