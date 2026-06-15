"use client";

import { useEffect, useState } from "react";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  YAxis,
} from "recharts";
import { Activity, Cpu, MemoryStick, Thermometer } from "lucide-react";
import { GlassmorphicPanel } from "./glassmorphic-panel";
import { CircularGauge } from "./circular-gauge";

type Point = { t: number; net: number; load: number };

// Deterministic initial data so SSR and first client render match (no hydration mismatch).
function seed(): Point[] {
  return Array.from({ length: 24 }, (_, i) => ({
    t: i,
    net: 45 + Math.sin(i * 0.5) * 18,
    load: 50 + Math.cos(i * 0.4) * 22,
  }));
}

export function TelemetryDashboard() {
  const [cpu, setCpu] = useState(42);
  const [ram, setRam] = useState(63);
  const [temp, setTemp] = useState(54);
  const [data, setData] = useState<Point[]>(seed);

  useEffect(() => {
    const id = setInterval(() => {
      setCpu((v) => clamp(v + (Math.random() - 0.5) * 18));
      setRam((v) => clamp(v + (Math.random() - 0.5) * 10));
      setTemp((v) => clamp(v + (Math.random() - 0.5) * 8, 35, 95));
      setData((prev) => {
        const next = prev.slice(1);
        next.push({
          t: (prev[prev.length - 1]?.t ?? 0) + 1,
          net: 30 + Math.random() * 55,
          load: 20 + Math.random() * 65,
        });
        return next;
      });
    }, 1600);
    return () => clearInterval(id);
  }, []);

  return (
    <GlassmorphicPanel
      className="p-5"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
    >
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-[var(--color-cyan)]" />
          <h2 className="text-sm font-medium uppercase tracking-widest text-foreground">
            System Telemetry
          </h2>
        </div>
        <span className="flex items-center gap-1.5 text-[0.7rem] uppercase tracking-widest text-[var(--color-success)]">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--color-success)]" />
          Nominal
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <CircularGauge value={cpu} label="CPU" />
        <CircularGauge value={ram} label="Memory" />
        <CircularGauge value={temp} label="Core" unit="°" />
      </div>

      <div className="mt-5 grid grid-cols-3 gap-2 text-center">
        <Metric icon={<Cpu className="h-3.5 w-3.5" />} label="Threads" value="32" />
        <Metric
          icon={<MemoryStick className="h-3.5 w-3.5" />}
          label="Swap"
          value="2.1G"
        />
        <Metric
          icon={<Thermometer className="h-3.5 w-3.5" />}
          label="Fans"
          value="2400"
        />
      </div>

      <div className="mt-5">
        <div className="mb-1 flex items-center justify-between text-[0.7rem] uppercase tracking-widest text-muted-foreground">
          <span>Network Throughput</span>
          <span className="font-mono text-[var(--color-cyan)]">
            {Math.round(data[data.length - 1]?.net ?? 0)} MB/s
          </span>
        </div>
        <div className="h-28 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="netGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#00d4ff" stopOpacity={0.7} />
                  <stop offset="100%" stopColor="#00d4ff" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="loadGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.6} />
                  <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <YAxis hide domain={[0, 100]} />
              <Tooltip
                contentStyle={{
                  background: "rgba(10,14,26,0.9)",
                  border: "1px solid rgba(0,212,255,0.3)",
                  borderRadius: 12,
                  fontSize: 11,
                  color: "#e6f9ff",
                }}
                labelStyle={{ display: "none" }}
              />
              <Area
                type="monotone"
                dataKey="load"
                stroke="#8b5cf6"
                strokeWidth={1.5}
                fill="url(#loadGrad)"
                isAnimationActive={false}
              />
              <Area
                type="monotone"
                dataKey="net"
                stroke="#00d4ff"
                strokeWidth={1.5}
                fill="url(#netGrad)"
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </GlassmorphicPanel>
  );
}

function Metric({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 px-2 py-2.5">
      <div className="mb-1 flex items-center justify-center gap-1 text-[var(--color-cyan)]/80">
        {icon}
      </div>
      <div className="font-mono text-sm font-semibold text-foreground">
        {value}
      </div>
      <div className="text-[0.6rem] uppercase tracking-widest text-muted-foreground">
        {label}
      </div>
    </div>
  );
}

function clamp(v: number, min = 5, max = 99) {
  return Math.max(min, Math.min(max, v));
}
