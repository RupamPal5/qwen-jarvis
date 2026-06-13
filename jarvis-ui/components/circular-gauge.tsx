"use client";

import { motion } from "framer-motion";

type CircularGaugeProps = {
  value: number; // 0-100
  label: string;
  unit?: string;
  size?: number;
};

function statusColor(value: number) {
  if (value < 60) return "var(--color-success)";
  if (value < 85) return "var(--color-warning)";
  return "var(--color-danger)";
}

export function CircularGauge({
  value,
  label,
  unit = "%",
  size = 92,
}: CircularGaugeProps) {
  const stroke = 7;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(100, value));
  const offset = circumference - (clamped / 100) * circumference;
  const color = statusColor(clamped);
  const gid = `gauge-${label.replace(/\s/g, "")}`;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <defs>
            <linearGradient id={gid} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={color} />
              <stop offset="100%" stopColor="var(--color-cyan)" />
            </linearGradient>
          </defs>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth={stroke}
          />
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={`url(#${gid})`}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            style={{ filter: `drop-shadow(0 0 6px ${color})` }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-mono text-lg font-bold tabular-nums text-foreground">
            {Math.round(clamped)}
            <span className="text-xs text-muted-foreground">{unit}</span>
          </span>
        </div>
      </div>
      <span className="text-[0.7rem] uppercase tracking-widest text-muted-foreground">
        {label}
      </span>
    </div>
  );
}
