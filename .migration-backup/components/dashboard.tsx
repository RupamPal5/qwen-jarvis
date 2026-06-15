"use client";

import { motion } from "framer-motion";
import { Mic, Power } from "lucide-react";
import { useState } from "react";
import { CommandInterface } from "../app/components/command-interface";
import { HolographicHeader } from "./holographic-header";
import { LogsPanel } from "./logs-panel";
import { StatusBar } from "./status-bar";
import { TelemetryDashboard } from "./telemetry-dashboard";
import { VoiceVisualizer } from "./voice-visualizer";

export function Dashboard() {
  const [speaking, setSpeaking] = useState(false);
  const [listening, setListening] = useState(false);

  const active = speaking || listening;

  return (
    <main className="relative mx-auto flex min-h-screen max-w-7xl flex-col gap-5 px-4 py-5 sm:px-6 lg:px-8">
      <StatusBar />

      <div className="grid flex-1 grid-cols-1 gap-5 lg:grid-cols-[1fr_minmax(0,1.5fr)_1fr]">
        {/* Left column: telemetry */}
        <div className="order-2 flex flex-col gap-5 lg:order-1">
          <TelemetryDashboard />
        </div>

        {/* Center column: visualizer + header */}
        <div className="order-1 flex flex-col items-center justify-center gap-6 lg:order-2">
          <HolographicHeader />

          <VoiceVisualizer active={active} />

          <div className="flex items-center gap-3">
            <motion.button
              type="button"
              onClick={() => setListening((l) => !l)}
              whileTap={{ scale: 0.94 }}
              className={`flex items-center gap-2 rounded-full border px-5 py-2.5 text-sm font-medium tracking-wide transition-all ${
                listening
                  ? "glow-cyan border-[var(--color-cyan)]/60 bg-[var(--color-cyan)]/15 text-foreground"
                  : "border-white/15 bg-white/5 text-muted-foreground hover:text-foreground"
              }`}
            >
              <Mic className="h-4 w-4" />
              {listening ? "Listening..." : "Activate Voice"}
            </motion.button>

            <motion.button
              type="button"
              whileTap={{ scale: 0.94 }}
              aria-label="Power"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-[var(--color-danger)]/30 bg-[var(--color-danger)]/10 text-[var(--color-danger)] transition-colors hover:bg-[var(--color-danger)]/20"
            >
              <Power className="h-4 w-4" />
            </motion.button>
          </div>
        </div>

        {/* Right column: logs */}
        <div className="order-3 flex flex-col gap-5">
          <LogsPanel />
        </div>
      </div>

      {/* Bottom: command interface */}
      <div className="mx-auto w-full max-w-3xl">
        <CommandInterface onSpeakingChange={setSpeaking} />
      </div>
    </main>
  );
}
