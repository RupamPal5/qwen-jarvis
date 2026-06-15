"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ChevronRight, Radio, Terminal } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { GlassmorphicPanel } from "../app/components/glassmorphic-panel";

type LogEntry = { id: number; time: string; level: "info" | "warn" | "ok"; msg: string };

const LOG_TEMPLATES: Array<Omit<LogEntry, "id" | "time">> = [
  { level: "ok", msg: "Neural handshake verified" },
  { level: "info", msg: "Indexing knowledge lattice" },
  { level: "info", msg: "Packet stream stabilized" },
  { level: "warn", msg: "Latency spike on node 7" },
  { level: "ok", msg: "Encryption keys rotated" },
  { level: "info", msg: "Sensor array recalibrated" },
  { level: "ok", msg: "Sovereign protocol heartbeat" },
  { level: "info", msg: "Diagnostics sweep complete" },
];

const levelColor: Record<LogEntry["level"], string> = {
  info: "var(--color-cyan)",
  warn: "var(--color-warning)",
  ok: "var(--color-success)",
};

export function LogsPanel() {
  const [open, setOpen] = useState(true);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const idRef = useRef(0);

  useEffect(() => {
    const push = () => {
      const tpl = LOG_TEMPLATES[Math.floor(Math.random() * LOG_TEMPLATES.length)];
      setLogs((prev) => {
        const entry: LogEntry = {
          ...tpl,
          id: idRef.current++,
          time: new Date().toLocaleTimeString("en-US", { hour12: false }),
        };
        return [...prev.slice(-14), entry];
      });
    };
    push();
    const id = setInterval(push, 2200);
    return () => clearInterval(id);
  }, []);

  return (
    <GlassmorphicPanel
      className="overflow-hidden"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, delay: 0.25 }}
    >
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between px-5 py-4"
        aria-expanded={open}
      >
        <span className="flex items-center gap-2 text-sm font-medium uppercase tracking-widest text-foreground">
          <Terminal className="h-4 w-4 text-[var(--color-cyan)]" />
          Activity Logs
        </span>
        <span className="flex items-center gap-2">
          <Radio className="h-3.5 w-3.5 animate-pulse text-[var(--color-success)]" />
          <motion.span animate={{ rotate: open ? 90 : 0 }}>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </motion.span>
        </span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="flex max-h-72 flex-col gap-1.5 overflow-y-auto px-5 pb-5 font-mono text-xs">
              <AnimatePresence initial={false}>
                {logs.map((log) => (
                  <motion.div
                    key={log.id}
                    layout
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-2"
                  >
                    <span className="text-muted-foreground">{log.time}</span>
                    <span
                      className="h-1.5 w-1.5 shrink-0 rounded-full"
                      style={{
                        background: levelColor[log.level],
                        boxShadow: `0 0 8px ${levelColor[log.level]}`,
                      }}
                    />
                    <span className="text-foreground/80">{log.msg}</span>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </GlassmorphicPanel>
  );
}
