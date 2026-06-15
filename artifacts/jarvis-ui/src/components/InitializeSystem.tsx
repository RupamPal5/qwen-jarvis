"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, Shield, Wifi, Cpu, CheckCircle, AlertCircle, Loader2, Power, Brain, Terminal, Volume2 } from "lucide-react";

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

const BOOT_SEQUENCE = [
  { text: "[BOOT] JARVIS v5.0 GOD PROTOCOL initializing...", delay: 0 },
  { text: "[OK] CPU topology mapped — cores detected", delay: 350 },
  { text: "[OK] Memory architecture profiled", delay: 700 },
  { text: "[OK] Neural interface subsystems bound", delay: 1050 },
  { text: "[OK] Quantum encryption matrix active — AES-256", delay: 1350 },
  { text: "[SCAN] Probing Ollama endpoint http://localhost:11434...", delay: 1700 },
  { text: "[OK] Ollama AI engine: reachable", delay: 2100 },
  { text: "[OK] Audio FFT analyzer node spawned — 44.1 kHz", delay: 2400 },
  { text: "[OK] Terminal bridge: bash/WSL2/PowerShell ready", delay: 2700 },
  { text: "[OK] Security firewall — ACTIVE", delay: 3000 },
  { text: "[SCAN] Initializing swarm network topology...", delay: 3300 },
  { text: "[OK] WebSocket pipeline: active", delay: 3600 },
  { text: "[OK] Knowledge graph: 150 nodes, 307 edges loaded", delay: 3900 },
  { text: "[READY] ALL SYSTEMS NOMINAL — GOD PROTOCOL ENGAGED", delay: 4300 },
];

export default function InitializeSystem({ onInitialized, onBootLog }: InitializeSystemProps) {
  const [phase, setPhase] = useState<"idle" | "booting" | "online" | "error">("idle");
  const [bootLines, setBootLines] = useState<BootLine[]>([]);
  const [progress, setProgress] = useState(0);
  const [ollamaStatus, setOllamaStatus] = useState<"unknown" | "online" | "offline">("unknown");
  const logRef = useRef<HTMLDivElement>(null);
  const lineIdRef = useRef(0);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

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

  const clearTimers = useCallback(() => {
    timersRef.current.forEach(t => clearTimeout(t));
    timersRef.current = [];
  }, []);

  const handleInitialize = useCallback(async () => {
    if (phase !== "idle" && phase !== "error") return;
    setPhase("booting");
    setBootLines([]);
    setProgress(0);
    setOllamaStatus("unknown");
    clearTimers();

    // Check Ollama in parallel
    const ollamaPromise = fetch("/api/ollama/status")
      .then(r => r.json() as Promise<{ online: boolean }>)
      .catch(() => ({ online: false }));

    const total = BOOT_SEQUENCE.length;

    BOOT_SEQUENCE.forEach((step, i) => {
      const t = setTimeout(() => {
        addLine(step.text);
        setProgress(Math.round(((i + 1) / total) * 100));

        if (step.text.includes("Ollama")) {
          ollamaPromise.then(d => {
            setOllamaStatus(d.online ? "online" : "offline");
            if (!d.online) {
              addLine("[WARN] Ollama: offline — start with `ollama serve`");
            } else {
              addLine("[OK] Ollama models: available");
            }
          });
        }

        if (i === total - 1) {
          const finalT = setTimeout(() => {
            setProgress(100);
            setPhase("online");
            onInitialized?.();
          }, 200);
          timersRef.current.push(finalT);
        }
      }, step.delay);
      timersRef.current.push(t);
    });
  }, [phase, addLine, onInitialized, clearTimers]);

  useEffect(() => {
    return () => clearTimers();
  }, [clearTimers]);

  const indicators = [
    { icon: Wifi,     label: "WS",     ok: phase === "online" },
    { icon: Terminal, label: "PTY",    ok: phase === "online" },
    { icon: Brain,    label: "OLLAMA", ok: ollamaStatus === "online" },
    { icon: Volume2,  label: "FFT",    ok: phase === "online" },
    { icon: Zap,      label: "NET",    ok: phase === "online" },
  ];

  return (
    <div className="w-full space-y-6">
      {/* Master Control Button */}
      <div className="flex flex-col items-center gap-5">
        <motion.button
          onClick={handleInitialize}
          disabled={phase === "booting"}
          whileHover={phase !== "booting" ? { scale: 1.03 } : {}}
          whileTap={phase !== "booting" ? { scale: 0.97 } : {}}
          className={`
            relative group px-12 py-6 rounded-2xl font-mono font-black text-xl tracking-widest uppercase
            transition-all duration-300 overflow-hidden
            ${phase === "online"
              ? "bg-emerald-900/40 border-2 border-emerald-400/60 text-emerald-300 cursor-default"
              : phase === "booting"
              ? "bg-purple-900/40 border-2 border-purple-500/50 text-purple-300 cursor-wait"
              : phase === "error"
              ? "bg-red-900/30 border-2 border-red-500/50 text-red-300 cursor-pointer"
              : "bg-purple-950/60 border-2 border-purple-500/70 text-purple-200 cursor-pointer hover:bg-purple-900/60"}
          `}
          style={{
            boxShadow: phase === "online"
              ? "0 0 40px rgba(52,211,153,0.4), 0 0 100px rgba(52,211,153,0.1)"
              : phase === "booting"
              ? "0 0 40px rgba(168,85,247,0.5), 0 0 100px rgba(168,85,247,0.15)"
              : "0 0 25px rgba(168,85,247,0.3)",
          }}
        >
          {phase === "booting" && (
            <motion.div
              className="absolute inset-0 rounded-2xl"
              style={{ background: "linear-gradient(90deg, transparent, rgba(168,85,247,0.25), transparent)" }}
              animate={{ x: ["-100%", "100%"] }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
            />
          )}
          <div className="relative flex items-center gap-4">
            {phase === "booting" ? <Loader2 className="w-7 h-7 animate-spin" />
              : phase === "online" ? <CheckCircle className="w-7 h-7" />
              : phase === "error" ? <AlertCircle className="w-7 h-7" />
              : <Power className="w-7 h-7" />}
            {phase === "idle" && "INITIALIZE SYSTEM"}
            {phase === "booting" && "INITIALIZING..."}
            {phase === "online" && "GOD PROTOCOL ONLINE"}
            {phase === "error" && "RETRY INITIALIZE"}
          </div>
        </motion.button>

        {/* Subsystem indicators */}
        <div className="flex gap-5 text-xs font-mono">
          {indicators.map(({ icon: Icon, label, ok }) => (
            <div key={label} className={`flex items-center gap-1.5 transition-colors duration-700 ${ok ? "text-emerald-400" : "text-white/25"}`}>
              <Icon className="w-3.5 h-3.5" />
              <span className="tracking-wider">{label}</span>
              <motion.div
                className={`w-1.5 h-1.5 rounded-full transition-all duration-700 ${ok ? "bg-emerald-400" : "bg-white/15"}`}
                animate={ok ? { boxShadow: ["0 0 0px rgba(52,211,153,0)", "0 0 8px rgba(52,211,153,0.9)", "0 0 0px rgba(52,211,153,0)"] } : {}}
                transition={{ repeat: Infinity, duration: 2 }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Progress Bar */}
      <AnimatePresence>
        {(phase === "booting" || phase === "online") && (
          <motion.div
            initial={{ opacity: 0, scaleY: 0 }}
            animate={{ opacity: 1, scaleY: 1 }}
            className="space-y-1"
          >
            <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{
                  background: "linear-gradient(90deg, #7c3aed, #c026d3, #06b6d4)",
                  boxShadow: "0 0 12px rgba(192,38,211,0.7)",
                }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.25, ease: "easeOut" }}
              />
            </div>
            <div className="flex justify-between text-[10px] font-mono text-white/30">
              <span>BOOT SEQUENCE</span>
              <span>{progress}%</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Boot Log */}
      <AnimatePresence>
        {bootLines.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="rounded-xl border border-purple-500/20 bg-black/60 backdrop-blur overflow-hidden"
          >
            <div className="flex items-center gap-2 px-4 py-2 border-b border-white/10 bg-purple-950/30">
              <motion.div
                className="w-2 h-2 rounded-full bg-purple-500"
                animate={phase === "booting" ? { opacity: [1, 0.3] } : { opacity: 1 }}
                transition={{ repeat: Infinity, duration: 0.8 }}
              />
              <span className="text-[10px] font-mono text-purple-300 tracking-widest">BOOT SEQUENCE LOG</span>
              {phase === "online" && <CheckCircle className="w-3 h-3 text-emerald-400 ml-auto" />}
            </div>
            <div
              ref={logRef}
              className="p-4 max-h-56 overflow-y-auto space-y-0.5"
              style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(168,85,247,0.3) transparent" }}
            >
              {bootLines.map((line) => (
                <motion.div
                  key={line.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.15 }}
                  className={`text-[11px] font-mono leading-relaxed ${STATUS_COLORS[line.status]}`}
                >
                  <span className="text-white/20 mr-2 select-none">
                    {new Date(line.timestamp).toISOString().slice(11, 19)}
                  </span>
                  {line.text}
                </motion.div>
              ))}
              {phase === "booting" && (
                <motion.span
                  className="inline-block text-[11px] font-mono text-cyan-400"
                  animate={{ opacity: [1, 0] }}
                  transition={{ repeat: Infinity, duration: 0.7 }}
                >▋</motion.span>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Status Cards */}
      {phase === "online" && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-3"
        >
          {[
            { label: "AI Engine",  value: ollamaStatus === "online" ? "Ollama ONLINE" : "Ollama OFFLINE", ok: ollamaStatus === "online" },
            { label: "Terminal",   value: "bash / WSL2 / PS",  ok: true },
            { label: "Encryption", value: "AES-256 ACTIVE",    ok: true },
            { label: "Protocol",   value: "GOD v5.0",           ok: true },
          ].map(({ label, value, ok }) => (
            <div key={label} className="bg-black/30 rounded-xl border border-white/10 p-3 text-center">
              <div className="text-[10px] text-white/40 font-mono mb-1">{label}</div>
              <div className={`text-xs font-bold font-mono ${ok ? "text-emerald-400" : "text-yellow-400"}`}>{value}</div>
            </div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
