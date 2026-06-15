"use client";

import { motion } from "framer-motion";
import { Cpu, Globe, ShieldCheck, Wifi } from "lucide-react";
import { useEffect, useState } from "react";
import { GlassmorphicPanel } from "../app/components/glassmorphic-panel";

export function StatusBar() {
  const [time, setTime] = useState("--:--:--");

  useEffect(() => {
    const tick = () =>
      setTime(new Date().toLocaleTimeString("en-US", { hour12: false }));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <GlassmorphicPanel
      className="flex flex-wrap items-center justify-between gap-3 px-5 py-3"
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="flex items-center gap-2">
        <motion.div
          className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--color-cyan)] to-[var(--color-purple)]"
          animate={{ boxShadow: ["0 0 12px rgba(0,212,255,0.6)", "0 0 24px rgba(139,92,246,0.6)", "0 0 12px rgba(0,212,255,0.6)"] }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          <Cpu className="h-4 w-4 text-background" />
        </motion.div>
        <div className="leading-tight">
          <p className="text-xs font-semibold tracking-wide text-foreground">
            SOVEREIGN CORE
          </p>
          <p className="text-[0.65rem] uppercase tracking-widest text-[var(--color-success)]">
            Online
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <Stat icon={<ShieldCheck className="h-3.5 w-3.5" />} label="Secure" />
        <Stat icon={<Wifi className="h-3.5 w-3.5" />} label="142ms" />
        <Stat icon={<Globe className="h-3.5 w-3.5" />} label="8 Nodes" />
        <span className="hidden font-mono text-sm tabular-nums text-[var(--color-cyan)] text-glow-cyan sm:inline">
          {time}
        </span>
      </div>
    </GlassmorphicPanel>
  );
}

function Stat({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className="text-[var(--color-cyan)]/80">{icon}</span>
      <span className="tracking-wide">{label}</span>
    </span>
  );
}
