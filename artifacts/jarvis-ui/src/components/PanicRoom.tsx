"use client";
import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import {
  motion, AnimatePresence, useAnimation
} from "framer-motion";
import {
  AlertTriangle, AlertOctagon, ShieldAlert, Lock, Unlock, Skull, Bomb, Timer, Clock, Activity, Zap, Cpu, Database, Network, Server, HardDrive, Wifi, WifiOff, Eye, EyeOff, Key, Fingerprint, X, Check, ChevronRight, Power, Trash2, Flame, Radiation, Siren, BellRing, BellOff, Shield, ShieldCheck, ShieldX, Terminal, Code, Binary, Hash, FileX, FileWarning, AlertCircle, Info, HelpCircle, BarChart3, Brain, Satellite
} from "lucide-react";
import {
  AreaChart as RechartsAreaChart, Area as RechartsArea, LineChart as RechartsLineChart, Line as RechartsLine, XAxis as RechartsXAxis, YAxis as RechartsYAxis, CartesianGrid as RechartsCartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer as RechartsResponsiveContainer
} from "recharts";

// ============================================================================
// TYPE DEFINITIONS - PANIC ROOM ARCHITECTURE
// ============================================================================

type LockdownPhase = "STANDBY" | "ARMED" | "COUNTDOWN" | "EXECUTING" | "COMPLETE" | "ABORTED";
type SectorStatus = "SECURE" | "BREACHED" | "SEALING" | "SEALED" | "WIPED";
type WipeMethod = "CRYPTO_SHRED" | "PHYSICAL_DESTROY" | "OVERWRITE_7_PASS" | "DEGAUSS";

interface ContainmentSector {
  id: string;
  name: string;
  icon: React.ReactNode;
  status: SectorStatus;
  integrity: number;
  lastPing: Date;
}

interface WipeLog {
  id: string;
  timestamp: Date;
  action: string;
  target: string;
  status: "SUCCESS" | "FAILED" | "PENDING";
  hash: string;
}

// ============================================================================
// CONSTANTS & MOCK DATA
// ============================================================================

const INITIAL_SECTORS: ContainmentSector[] = [
  { id: "net", name: "NETWORK MOAT", icon: <Wifi className="w-5 h-5" />, status: "SECURE", integrity: 100, lastPing: new Date() },
  { id: "db", name: "MEMORY PALACE", icon: <Database className="w-5 h-5" />, status: "SECURE", integrity: 100, lastPing: new Date() },
  { id: "ai", name: "NEURAL CORE", icon: <Brain className="w-5 h-5" />, status: "SECURE", integrity: 100, lastPing: new Date() },
  { id: "hw", name: "HARDWARE GUILLOTINE", icon: <Cpu className="w-5 h-5" />, status: "SECURE", integrity: 100, lastPing: new Date() },
  { id: "phys", name: "PHYSICAL LOCKS", icon: <Lock className="w-5 h-5" />, status: "SECURE", integrity: 100, lastPing: new Date() },
  { id: "ext", name: "EXTERNAL COMMS", icon: <Satellite className="w-5 h-5" />, status: "SECURE", integrity: 100, lastPing: new Date() },
];

// ============================================================================
// SUB-COMPONENTS - EMERGENCY VISUALIZATION
// ============================================================================

// --- The Big Red Countdown ---
const CountdownTimer: React.FC<{ timeLeft: number; phase: LockdownPhase }> = ({ timeLeft, phase }) => {
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const ms = Math.floor((timeLeft % 1) * 100);

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="flex flex-col items-center justify-center p-8 bg-black/60 border-2 border-red-500/50 rounded-3xl shadow-[0_0_50px_rgba(239,68,68,0.3)] backdrop-blur-xl"
    >
      <div className="text-xs text-red-400 tracking-[0.5em] font-bold mb-4 animate-pulse">
        {phase === "COUNTDOWN" ? "TIME TO TOTAL WIPE" : phase}
      </div>
      <div className="flex items-baseline gap-2 font-mono">
        <motion.span
          className="text-8xl font-black text-red-500 tabular-nums"
          animate={phase === "COUNTDOWN" ? { opacity: [1, 0.5, 1] } : {}}
          transition={{ duration: 1, repeat: Infinity }}
        >
          {minutes.toString().padStart(2, "0")}
        </motion.span>
        <span className="text-6xl text-red-500/50">:</span>
        <motion.span
          className="text-8xl font-black text-red-500 tabular-nums"
          animate={phase === "COUNTDOWN" ? { opacity: [1, 0.5, 1] } : {}}
          transition={{ duration: 1, repeat: Infinity }}
        >
          {seconds.toString().padStart(2, "0")}
        </motion.span>
        <span className="text-4xl text-red-500/30">.{ms.toString().padStart(2, "0")}</span>
      </div>
    </motion.div>
  );
};

// --- 6-Layer Containment Grid ---
const ContainmentGrid: React.FC<{ sectors: ContainmentSector[] }> = ({ sectors }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {sectors.map((sector) => (
        <motion.div
          key={sector.id}
          layout
          className={`p-4 rounded-xl border backdrop-blur-xl transition-all ${
            sector.status === "SEALED" || sector.status === "WIPED"
              ? "bg-red-950/20 border-red-500/50"
              : sector.status === "SEALING"
              ? "bg-yellow-950/20 border-yellow-500/50 animate-pulse"
              : "bg-black/40 border-white/10"
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className={`p-2 rounded-lg ${sector.status === "SECURE" ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"}`}>
              {sector.icon}
            </div>
            <div className={`w-2 h-2 rounded-full ${
              sector.status === "SECURE" ? "bg-green-400" : 
              sector.status === "SEALING" ? "bg-yellow-400 animate-ping" : 
              "bg-red-400 animate-pulse"
            }`} />
          </div>
          <div className="text-xs font-bold text-white mb-1">{sector.name}</div>
          <div className="text-[10px] text-white/40 mb-2">Status: {sector.status}</div>
          <div className="h-1 bg-black/50 rounded-full overflow-hidden">
            <motion.div
              className={`h-full ${sector.integrity > 50 ? "bg-green-500" : "bg-red-500"}`}
              animate={{ width: `${sector.integrity}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </motion.div>
      ))}
    </div>
  );
};

// --- Data Shredder Visualization ---
const DataShredder: React.FC<{ isWiping: boolean }> = ({ isWiping }) => {
  const [hexDump, setHexDump] = useState<string[]>([]);

  useEffect(() => {
    if (!isWiping) return;
    const interval = setInterval(() => {
      const newLines = Array.from({ length: 8 }, () => {
        const addr = Math.floor(Math.random() * 0xFFFFFFFF).toString(16).padStart(8, "0").toUpperCase();
        const bytes = Array.from({ length: 16 }, () => Math.floor(Math.random() * 256).toString(16).padStart(2, "0").toUpperCase()).join(" ");
        return `${addr}  ${bytes}`;
      });
      setHexDump(prev => [...newLines, ...prev].slice(0, 20));
    }, 50);
    return () => clearInterval(interval);
  }, [isWiping]);

  return (
    <div className="bg-black/80 border border-red-500/30 rounded-xl p-4 font-mono text-xs h-64 overflow-hidden relative">
      <div className="absolute top-2 right-2 text-[10px] text-red-400 font-bold animate-pulse">
        {isWiping ? "CRYPTO-SHREDDING ACTIVE..." : "STANDBY"}
      </div>
      <div className="space-y-1 text-red-300/80">
        {hexDump.map((line, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="truncate"
          >
            {line}
          </motion.div>
        ))}
      </div>
      {isWiping && (
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent pointer-events-none" />
      )}
    </div>
  );
};

// --- Dead Man's Switch ---
const DeadMansSwitch: React.FC<{ isArmed: boolean; onToggle: () => void }> = ({ isArmed, onToggle }) => {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className={`p-6 rounded-2xl border-2 backdrop-blur-xl cursor-pointer transition-all ${
        isArmed 
          ? "bg-red-950/40 border-red-500 shadow-[0_0_30px_rgba(239,68,68,0.4)]" 
          : "bg-black/40 border-white/10 hover:border-red-500/50"
      }`}
      onClick={onToggle}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Skull className={`w-6 h-6 ${isArmed ? "text-red-400 animate-pulse" : "text-white/40"}`} />
          <h3 className="text-sm font-bold text-white tracking-wider">DEAD MAN'S SWITCH</h3>
        </div>
        <div className={`px-3 py-1 rounded text-[10px] font-bold ${isArmed ? "bg-red-500 text-white" : "bg-white/10 text-white/60"}`}>
          {isArmed ? "ARMED" : "SAFE"}
        </div>
      </div>
      <p className="text-xs text-white/60 leading-relaxed">
        If Architect biometric heartbeat is not detected within 30 days, automatically execute Protocol Omega: Wipe all memory, encrypt drives, and sever network.
      </p>
      <div className="mt-4 h-1.5 bg-black/50 rounded-full overflow-hidden">
        <motion.div
          className={`h-full ${isArmed ? "bg-red-500" : "bg-green-500"}`}
          animate={{ width: isArmed ? "100%" : "0%" }}
          transition={{ duration: 1 }}
        />
      </div>
    </motion.div>
  );
};

// ============================================================================
// MAIN PANIC ROOM COMPONENT
// ============================================================================

export default function PanicRoom() {
  const [phase, setPhase] = useState<LockdownPhase>("STANDBY");
  const [countdown, setCountdown] = useState(300); // 5 minutes
  const [sectors, setSectors] = useState<ContainmentSector[]>(INITIAL_SECTORS);
  const [wipeLogs, setWipeLogs] = useState<WipeLog[]>([]);
  const [isWiping, setIsWiping] = useState(false);
  const [abortCode, setAbortCode] = useState("");
  const [showAbortModal, setShowAbortModal] = useState(false);

  // Countdown Logic
  useEffect(() => {
    if (phase !== "COUNTDOWN") return;
    if (countdown <= 0) {
      setPhase("EXECUTING");
      setIsWiping(true);
      // Simulate sector wiping
      let currentSector = 0;
      const wipeInterval = setInterval(() => {
        if (currentSector < sectors.length) {
          setSectors(prev => prev.map((s, i) => 
            i === currentSector ? { ...s, status: "WIPED", integrity: 0 } : s
          ));
          setWipeLogs(prev => [{
            id: `log_${Date.now()}`,
            timestamp: new Date(),
            action: "CRYPTO_SHRED",
            target: sectors[currentSector].name,
            status: "SUCCESS",
            hash: Math.random().toString(36).substring(2, 15),
          }, ...prev]);
          currentSector++;
        } else {
          clearInterval(wipeInterval);
          setPhase("COMPLETE");
          setIsWiping(false);
        }
      }, 1000);
      return () => clearInterval(wipeInterval);
    }
    const timer = setInterval(() => setCountdown(prev => prev - 0.1), 100);
    return () => clearInterval(timer);
  }, [phase, countdown]);

  const handleArm = () => {
    setPhase("COUNTDOWN");
    setCountdown(300);
    setSectors(prev => prev.map(s => ({ ...s, status: "SEALING" })));
  };

  const handleAbort = () => {
    if (abortCode === "OMEGA-7734") { // The secret abort code
      setPhase("ABORTED");
      setIsWiping(false);
      setSectors(prev => prev.map(s => ({ ...s, status: "SECURE", integrity: 100 })));
      setShowAbortModal(false);
      setAbortCode("");
    } else {
      alert("INVALID ABORT CODE. LOCKDOWN CONTINUES.");
    }
  };

  const handleReset = () => {
    setPhase("STANDBY");
    setCountdown(300);
    setSectors(INITIAL_SECTORS);
    setWipeLogs([]);
    setIsWiping(false);
  };

  return (
    <div className="space-y-6 relative">
      {/* Red Alert Background Pulse */}
      {phase === "COUNTDOWN" || phase === "EXECUTING" ? (
        <motion.div
          className="absolute inset-0 bg-red-500/5 pointer-events-none z-0"
          animate={{ opacity: [0.1, 0.3, 0.1] }}
          transition={{ duration: 1, repeat: Infinity }}
        />
      ) : null}

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-red-950/80 to-black/80 border border-red-500/50 rounded-2xl p-6 backdrop-blur-xl shadow-[0_0_50px_rgba(239,68,68,0.3)] relative z-10"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <AlertOctagon className="w-8 h-8 text-red-500 animate-pulse" />
            <div>
              <h2 className="text-2xl font-black text-red-500 tracking-wider">PANIC ROOM // OMEGA PROTOCOL</h2>
              <p className="text-xs text-white/60">Emergency Lockdown • Data Shredder • Dead Man's Switch</p>
            </div>
          </div>
          <div className={`px-4 py-2 rounded-lg text-xs font-bold border ${
            phase === "STANDBY" ? "bg-green-500/20 text-green-400 border-green-500/50" :
            phase === "COUNTDOWN" ? "bg-red-500/20 text-red-400 border-red-500/50 animate-pulse" :
            phase === "COMPLETE" ? "bg-black text-white border-white/50" :
            "bg-yellow-500/20 text-yellow-400 border-yellow-500/50"
          }`}>
            SYSTEM STATUS: {phase}
          </div>
        </div>

        {phase === "STANDBY" && (
          <button
            onClick={handleArm}
            className="w-full py-4 bg-gradient-to-r from-red-600 to-red-800 text-white rounded-xl font-black text-lg tracking-widest hover:from-red-500 hover:to-red-700 transition-all shadow-[0_0_30px_rgba(239,68,68,0.5)] flex items-center justify-center gap-3"
          >
            <Bomb className="w-6 h-6" />
            INITIATE LOCKDOWN SEQUENCE
          </button>
        )}

        {(phase === "COUNTDOWN" || phase === "EXECUTING") && (
          <div className="flex gap-4">
            <CountdownTimer timeLeft={countdown} phase={phase} />
            <div className="flex-1 flex flex-col gap-4">
              <button
                onClick={() => setShowAbortModal(true)}
                className="flex-1 py-4 bg-black/60 border-2 border-yellow-500/50 text-yellow-400 rounded-xl font-bold hover:bg-yellow-500/10 transition-all flex items-center justify-center gap-2"
              >
                <X className="w-5 h-5" />
                ABORT SEQUENCE (REQUIRES CODE)
              </button>
              <div className="text-xs text-white/60 bg-black/40 p-3 rounded-lg border border-white/10">
                <AlertTriangle className="w-4 h-4 text-yellow-400 inline mr-2" />
                WARNING: Aborting requires 256-bit authorization code. Unauthorized attempts will trigger immediate wipe.
              </div>
            </div>
          </div>
        )}

        {phase === "COMPLETE" && (
          <div className="text-center py-8">
            <Skull className="w-16 h-16 text-white mx-auto mb-4" />
            <h3 className="text-3xl font-black text-white mb-2">PROTOCOL OMEGA EXECUTED</h3>
            <p className="text-white/60 mb-6">All systems wiped. Network severed. Goodbye, Architect.</p>
            <button
              onClick={handleReset}
              className="px-8 py-3 bg-white/10 border border-white/20 text-white rounded-xl font-bold hover:bg-white/20 transition-all"
            >
              REBOOT SYSTEM (REQUIRES PHYSICAL ACCESS)
            </button>
          </div>
        )}
      </motion.div>

      {/* Main Grid */}
      <div className="grid grid-cols-12 gap-6 relative z-10">
        {/* Left Column */}
        <div className="col-span-12 lg:col-span-8 space-y-6">
          <div className="bg-black/40 border border-white/10 rounded-2xl p-6 backdrop-blur-xl">
            <h3 className="text-sm font-bold text-white tracking-wider mb-4 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-red-400" />
              6-LAYER CONTAINMENT STATUS
            </h3>
            <ContainmentGrid sectors={sectors} />
          </div>
          
          <div className="bg-black/40 border border-white/10 rounded-2xl p-6 backdrop-blur-xl">
            <h3 className="text-sm font-bold text-white tracking-wider mb-4 flex items-center gap-2">
              <Terminal className="w-5 h-5 text-red-400" />
              LIVE WIPE TELEMETRY
            </h3>
            <DataShredder isWiping={isWiping} />
          </div>
        </div>

        {/* Right Column */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
          <DeadMansSwitch 
            isArmed={phase !== "STANDBY" && phase !== "ABORTED"} 
            onToggle={handleArm} 
          />
          
          <div className="bg-black/40 border border-white/10 rounded-2xl p-6 backdrop-blur-xl">
            <h3 className="text-sm font-bold text-white tracking-wider mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-red-400" />
              EMERGENCY LOGS
            </h3>
            <div className="space-y-2 max-h-64 overflow-y-auto font-mono text-xs">
              {wipeLogs.length === 0 ? (
                <div className="text-white/40 text-center py-4">No emergency events logged.</div>
              ) : (
                wipeLogs.map(log => (
                  <div key={log.id} className="p-2 bg-red-950/20 border border-red-500/20 rounded text-red-300">
                    <div className="flex justify-between mb-1">
                      <span className="text-[10px] text-white/40">{log.timestamp.toLocaleTimeString()}</span>
                      <span className="text-[10px] text-green-400">{log.status}</span>
                    </div>
                    <div className="truncate">{log.action} → {log.target}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Abort Modal */}
      <AnimatePresence>
        {showAbortModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm"
            onClick={() => setShowAbortModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-black border-2 border-yellow-500/50 rounded-2xl p-8 max-w-md w-full shadow-[0_0_50px_rgba(234,179,8,0.3)]"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 mb-6">
                <Lock className="w-6 h-6 text-yellow-400" />
                <h3 className="text-xl font-bold text-white">AUTHORIZATION REQUIRED</h3>
              </div>
              <p className="text-sm text-white/60 mb-6">
                Enter the 256-bit Omega authorization code to abort the lockdown sequence.
              </p>
              <input
                type="password"
                value={abortCode}
                onChange={(e) => setAbortCode(e.target.value.toUpperCase())}
                placeholder="ENTER CODE..."
                className="w-full bg-black/60 border border-yellow-500/30 rounded-lg px-4 py-3 text-yellow-400 font-mono text-lg focus:outline-none focus:border-yellow-500 mb-6"
                autoFocus
              />
              <div className="flex gap-3">
                <button
                  onClick={() => setShowAbortModal(false)}
                  className="flex-1 py-3 bg-white/5 border border-white/10 text-white rounded-lg font-bold hover:bg-white/10"
                >
                  CANCEL
                </button>
                <button
                  onClick={handleAbort}
                  className="flex-1 py-3 bg-yellow-600 text-black rounded-lg font-bold hover:bg-yellow-500"
                >
                  EXECUTE ABORT
                </button>
              </div>
              <div className="mt-4 text-[10px] text-white/40 text-center">
                Hint for testing: OMEGA-7734
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}