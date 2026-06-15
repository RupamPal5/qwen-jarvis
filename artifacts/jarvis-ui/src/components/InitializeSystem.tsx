"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, Shield, Wifi, Cpu, CheckCircle, AlertCircle, Loader2, Power } from "lucide-react";

interface BootLine {
  id: string;
  text: string;
  status: "ok" | "warn" | "error" | "scanning" | "info";
  timestamp: number;
}

interface InitializeSystemProps {
  wsUrl?: string;
  onInitialized?: () => void;
  onBootLog?: (line: string) => void;
}

const STATUS_COLORS = {
  ok: "text-emerald-400",
  warn: "text-yellow-400",
  error: "text-red-400",
  scanning: "text-cyan-400",
  info: "text-purple-400",
};

function parseStatus(msg: string): BootLine["status"] {
  if (msg.includes("[OK]")) return "ok";
  if (msg.includes("[WARN]")) return "warn";
  if (msg.includes("[ERROR]")) return "error";
  if (msg.includes("[SCAN]")) return "scanning";
  if (msg.includes("[READY]")) return "ok";
  return "info";
}

export default function InitializeSystem({ wsUrl, onInitialized, onBootLog }: InitializeSystemProps) {
  const [phase, setPhase] = useState<"idle" | "booting" | "online" | "error">("idle");
  const [bootLines, setBootLines] = useState<BootLine[]>([]);
  const [progress, setProgress] = useState(0);
  const [ollamaStatus, setOllamaStatus] = useState<"unknown" | "online" | "offline">("unknown");
  const wsRef = useRef<WebSocket | null>(null);
  const logRef = useRef<HTMLDivElement>(null);
  const lineIdRef = useRef(0);

  const addLine = useCallback((text: string) => {
    const line: BootLine = {
      id: `line-${lineIdRef.current++}`,
      text,
      status: parseStatus(text),
      timestamp: Date.now(),
    };
    setBootLines(prev => [...prev, line]);
    onBootLog?.(text);
    setTimeout(() => {
      logRef.current?.scrollTo({ top: logRef.current.scrollHeight, behavior: "smooth" });
    }, 30);
  }, [onBootLog]);

  const handleInitialize = useCallback(() => {
    if (phase !== "idle" && phase !== "error") return;
    setPhase("booting");
    setBootLines([]);
    setProgress(0);
    setOllamaStatus("unknown");

    const proto = window.location.protocol === "https:" ? "wss:" : "ws:";
    const url = wsUrl ?? `${proto}//${window.location.host}/ws`;
    const ws = new WebSocket(url);
    wsRef.current = ws;

    const progressInterval = setInterval(() => {
      setProgress(p => Math.min(p + 1.8, 95));
    }, 80);

    ws.onopen = () => {
      addLine("[BOOT] JARVIS v5.0 GOD PROTOCOL — connection established");
      ws.send(JSON.stringify({ type: "initialize" }));
    };

    ws.onmessage = (evt) => {
      try {
        const msg = JSON.parse(evt.data as string) as { type: string; message?: string; status?: string };
        if (msg.type === "boot_log" && msg.message) {
          addLine(msg.message);
          if (msg.message.includes("Ollama")) {
            setOllamaStatus(msg.message.includes("[OK]") ? "online" : "offline");
          }
        }
        if (msg.type === "initialized") {
          clearInterval(progressInterval);
          setProgress(100);
          setPhase("online");
          onInitialized?.();
        }
      } catch {
        // ignore
      }
    };

    ws.onerror = () => {
      clearInterval(progressInterval);
      addLine("[ERROR] WebSocket connection failed — backend offline");
      setPhase("error");
    };

    ws.onclose = () => clearInterval(progressInterval);

    // Fallback: simulate boot if backend not available
    const fallbackTimeout = setTimeout(() => {
      if (phase === "booting" && ws.readyState !== WebSocket.OPEN) {
        clearInterval(progressInterval);
        const lines = [
          "[BOOT] JARVIS v5.0 GOD PROTOCOL initializing...",
          "[OK] Neural interface subsystems bound",
          "[OK] Quantum encryption matrix active",
          "[OK] WebSocket pipeline: simulation mode",
          "[SCAN] Probing Ollama endpoint http://localhost:11434...",
          "[WARN] Ollama: running in offline simulation mode",
          "[OK] WSL2 subsystem bridge: simulation ready",
          "[OK] Audio FFT analyzer node spawned",
          "[READY] ALL SYSTEMS NOMINAL — GOD PROTOCOL ENGAGED",
        ];
        let i = 0;
        const simInterval = setInterval(() => {
          if (i < lines.length) {
            addLine(lines[i++]);
            setProgress(Math.round((i / lines.length) * 100));
          } else {
            clearInterval(simInterval);
            setProgress(100);
            setPhase("online");
            setOllamaStatus("offline");
            onInitialized?.();
          }
        }, 450);
      }
    }, 2000);

    return () => {
      clearTimeout(fallbackTimeout);
      clearInterval(progressInterval);
    };
  }, [phase, wsUrl, addLine, onInitialized]);

  useEffect(() => {
    return () => { wsRef.current?.close(); };
  }, []);

  return (
    <div className="w-full space-y-4">
      {/* Master Control Button */}
      <motion.div className="flex flex-col items-center gap-4">
        <motion.button
          onClick={handleInitialize}
          disabled={phase === "booting"}
          whileHover={phase === "idle" || phase === "error" ? { scale: 1.04 } : {}}
          whileTap={phase === "idle" || phase === "error" ? { scale: 0.97 } : {}}
          className={`
            relative group px-10 py-5 rounded-xl font-mono font-bold text-lg tracking-widest uppercase
            transition-all duration-300 overflow-hidden
            ${phase === "online"
              ? "bg-emerald-900/40 border-2 border-emerald-400/60 text-emerald-300 cursor-default"
              : phase === "booting"
              ? "bg-purple-900/40 border-2 border-purple-500/50 text-purple-300 cursor-wait"
              : phase === "error"
              ? "bg-red-900/30 border-2 border-red-500/50 text-red-300 cursor-pointer hover:bg-red-900/50"
              : "bg-purple-950/60 border-2 border-purple-500/70 text-purple-200 cursor-pointer hover:bg-purple-900/60"}
          `}
          style={{
            boxShadow: phase === "online"
              ? "0 0 30px rgba(52,211,153,0.4), 0 0 80px rgba(52,211,153,0.15)"
              : phase === "booting"
              ? "0 0 30px rgba(168,85,247,0.5), 0 0 80px rgba(168,85,247,0.2)"
              : "0 0 20px rgba(168,85,247,0.3)",
          }}
        >
          {/* Animated border sweep */}
          {phase === "booting" && (
            <motion.div
              className="absolute inset-0 rounded-xl"
              style={{
                background: "linear-gradient(90deg, transparent, rgba(168,85,247,0.3), transparent)",
              }}
              animate={{ x: ["-100%", "100%"] }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
            />
          )}

          <div className="relative flex items-center gap-3">
            {phase === "booting" ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : phase === "online" ? (
              <CheckCircle className="w-6 h-6" />
            ) : phase === "error" ? (
              <AlertCircle className="w-6 h-6" />
            ) : (
              <Power className="w-6 h-6" />
            )}
            {phase === "idle" && "INITIALIZE SYSTEM"}
            {phase === "booting" && "INITIALIZING..."}
            {phase === "online" && "GOD PROTOCOL ONLINE"}
            {phase === "error" && "RETRY INITIALIZE"}
          </div>
        </motion.button>

        {/* Status indicators */}
        <div className="flex gap-6 text-xs font-mono">
          {[
            { icon: Wifi, label: "WS", ok: phase === "online" },
            { icon: Cpu, label: "PTY", ok: phase === "online" },
            { icon: Shield, label: "OLLAMA", ok: ollamaStatus === "online" },
            { icon: Zap, label: "FFT", ok: phase === "online" },
          ].map(({ icon: Icon, label, ok }) => (
            <div key={label} className={`flex items-center gap-1.5 transition-colors duration-500 ${ok ? "text-emerald-400" : "text-white/30"}`}>
              <Icon className="w-3.5 h-3.5" />
              <span>{label}</span>
              <div className={`w-1.5 h-1.5 rounded-full transition-all duration-500 ${ok ? "bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]" : "bg-white/20"}`} />
            </div>
          ))}
        </div>
      </motion.div>

      {/* Progress Bar */}
      <AnimatePresence>
        {(phase === "booting" || phase === "online") && (
          <motion.div
            initial={{ opacity: 0, scaleY: 0 }}
            animate={{ opacity: 1, scaleY: 1 }}
            className="h-1 bg-white/10 rounded-full overflow-hidden"
          >
            <motion.div
              className="h-full rounded-full"
              style={{
                background: "linear-gradient(90deg, #7c3aed, #c026d3, #06b6d4)",
                boxShadow: "0 0 10px rgba(192,38,211,0.7)",
              }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Boot Log Terminal */}
      <AnimatePresence>
        {bootLines.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="rounded-xl border border-purple-500/20 bg-black/60 backdrop-blur overflow-hidden"
          >
            <div className="flex items-center gap-2 px-4 py-2 border-b border-white/10 bg-purple-950/30">
              <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
              <span className="text-[10px] font-mono text-purple-300 tracking-widest">BOOT SEQUENCE LOG</span>
            </div>
            <div
              ref={logRef}
              className="p-4 max-h-48 overflow-y-auto space-y-0.5 scrollbar-thin"
              style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(168,85,247,0.3) transparent" }}
            >
              {bootLines.map((line, i) => (
                <motion.div
                  key={line.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.02 * i }}
                  className={`text-[11px] font-mono leading-relaxed ${STATUS_COLORS[line.status]}`}
                >
                  <span className="text-white/20 mr-2 select-none">
                    {new Date(line.timestamp).toISOString().slice(11, 19)}
                  </span>
                  {line.text}
                </motion.div>
              ))}
              {phase === "booting" && (
                <div className="text-[11px] font-mono text-cyan-400 flex items-center gap-1 mt-1">
                  <motion.span animate={{ opacity: [1, 0] }} transition={{ repeat: Infinity, duration: 0.8 }}>▋</motion.span>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
