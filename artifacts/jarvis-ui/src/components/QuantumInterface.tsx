"use client";
import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import {
  motion, AnimatePresence
} from "framer-motion";
import {
  Atom, Zap, Cpu, Activity, GitBranch, Layers, Search, Filter, Download, Upload, Trash2, Play, Pause, RotateCcw, Maximize2, Minimize2, ChevronRight, ChevronDown, MoreVertical, Settings, AlertTriangle, CheckCircle, Info, X, BarChart3, Brain, Shield, Lock, Unlock, Key, Fingerprint, Network, Globe, Server, Database, Terminal, Code, Bug, Eye, EyeOff, Radio, Signal, Wifi, WifiOff, Bluetooth, Usb, HardDrive, Thermometer, Fan, Power, Battery, BatteryCharging, Gauge, MemoryStick, Cloud, CloudOff, CloudUpload, CloudDownload, Share2, ExternalLink, Copy, Clipboard, Scissors, Save, FolderOpen, File, FileCode, FileText, Archive, Inbox, Bell, BellOff, Clock, Calendar, User, Users, Star, Heart, ThumbsUp, ThumbsDown, Award, Trophy, Target, Flag, MapPin, Navigation, Compass, Sun, Moon, CloudRain, CloudSnow, Flame, Snowflake, Umbrella, Wind, Droplets, Timer, TimerOff, TimerReset, Volume2, VolumeX, Mic, MicOff, Camera, CameraOff, Video, VideoOff, Phone, Mail, AtSign, Hash, Binary, Code2, Braces, Command, Grid, List, Table, Columns, Rows, AlignLeft, AlignCenter, AlignRight, Bold, Italic, Underline, Strikethrough, Type, Heading, Sparkles, Wand2, Crown, Gem, Diamond, Feather, Anchor, Briefcase, Coffee, CupSoda, Pizza, Beer, Wine, Carrot, Apple, Banana, Grape, Cherry, BarChart, LineChart
} from "lucide-react";
import {
  PieChart as RechartsPie, Pie as RechartsPieSlice, Cell as RechartsCell, ResponsiveContainer as RechartsResponsiveContainer, Tooltip as RechartsTooltip, Legend as RechartsLegend, Bar, BarChart as RechartsBarChart, CartesianGrid, Line, LineChart as RechartsLineChart, XAxis, YAxis
} from "recharts";

// ============================================================================
// TYPE DEFINITIONS - QUANTUM ARCHITECTURE
// ============================================================================

type GateType = "H" | "X" | "Y" | "Z" | "CNOT" | "T" | "S" | "RX" | "RY" | "RZ" | "SWAP" | "MEASURE";
type QubitState = "GROUND" | "SUPERPOSITION" | "ENTANGLED" | "MEASURED";
type TopologyType = "HEAVY_HEX" | "HEAVY_SQUARE" | "LINEAR" | "RING";

interface ComplexNumber {
  re: number;
  im: number;
}

interface Qubit {
  id: number;
  label: string;
  state: QubitState;
  blochTheta: number; // 0 to PI
  blochPhi: number;   // 0 to 2PI
  t1Relaxation: number; // microseconds
  t2Relaxation: number; // microseconds
  gateFidelity: number; // percentage
  readoutError: number; // percentage
  frequency: number; // GHz
  anharmonicity: number; // MHz
  isEntangled: boolean;
  entangledWith?: number;
}

interface QuantumGate {
  id: string;
  type: GateType;
  qubit: number;
  controlQubit?: number; // For CNOT, SWAP
  angle?: number; // For RX, RY, RZ
  timestamp: Date;
}

interface CircuitStep {
  time: number;
  gates: QuantumGate[];
}

interface MeasurementResult {
  state: string; // e.g., "00", "01", "10", "11"
  probability: number; // 0 to 1
  counts: number;
}

interface QuantumMetrics {
  totalQubits: number;
  activeQubits: number;
  avgGateFidelity: number;
  avgT1: number;
  avgT2: number;
  quantumVolume: number;
  circuitDepth: number;
  errorRate: number;
  coherenceTime: number;
  temperature: number; // milliKelvin
}

// ============================================================================
// QUANTUM MATH ENGINE (Simplified for UI Visualization)
// ============================================================================

const COMPLEX = {
  add: (a: ComplexNumber, b: ComplexNumber): ComplexNumber => ({ re: a.re + b.re, im: a.im + b.im }),
  sub: (a: ComplexNumber, b: ComplexNumber): ComplexNumber => ({ re: a.re - b.re, im: a.im - b.im }),
  mul: (a: ComplexNumber, b: ComplexNumber): ComplexNumber => ({
    re: a.re * b.re - a.im * b.im,
    im: a.re * b.im + a.im * b.re,
  }),
  scale: (a: ComplexNumber, s: number): ComplexNumber => ({ re: a.re * s, im: a.im * s }),
  magnitude: (a: ComplexNumber): number => Math.sqrt(a.re * a.re + a.im * a.im),
  phase: (a: ComplexNumber): number => Math.atan2(a.im, a.re),
};

// Apply single qubit gate to Bloch sphere angles (simplified visualization math)
const applyGateToBloch = (theta: number, phi: number, gate: GateType, angle?: number): { theta: number; phi: number } => {
  switch (gate) {
    case "X": return { theta: Math.PI - theta, phi: phi + Math.PI };
    case "Y": return { theta: Math.PI - theta, phi: -phi };
    case "Z": return { theta, phi: phi + Math.PI };
    case "H": 
      // Hadamard is complex, approximated for visual sphere
      const newTheta = Math.PI / 2 - theta;
      return { theta: Math.abs(newTheta), phi: phi + Math.PI / 2 };
    case "T": return { theta, phi: phi + Math.PI / 4 };
    case "S": return { theta, phi: phi + Math.PI / 2 };
    case "RX": return { theta: theta + (angle || Math.PI/2), phi };
    case "RY": return { theta: theta, phi: phi + (angle || Math.PI/2) };
    case "RZ": return { theta, phi: phi + (angle || Math.PI/2) };
    case "MEASURE": return { theta: Math.random() > 0.5 ? 0 : Math.PI, phi: 0 }; // Collapse
    default: return { theta, phi };
  }
};

// ============================================================================
// MOCK DATA GENERATORS
// ============================================================================

const generateQubits = (count: number): Qubit[] => {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    label: `Q${i}`,
    state: "GROUND" as QubitState,
    blochTheta: 0,
    blochPhi: 0,
    t1Relaxation: 50 + Math.random() * 100,
    t2Relaxation: 20 + Math.random() * 50,
    gateFidelity: 99.5 + Math.random() * 0.49,
    readoutError: Math.random() * 2,
    frequency: 4.5 + Math.random() * 1.5,
    anharmonicity: -200 - Math.random() * 100,
    isEntangled: false,
  }));
};

const GATE_LIBRARY: { type: GateType; name: string; color: string; icon: string }[] = [
  { type: "H", name: "Hadamard", color: "#06b6d4", icon: "H" },
  { type: "X", name: "Pauli-X", color: "#ef4444", icon: "X" },
  { type: "Y", name: "Pauli-Y", color: "#10b981", icon: "Y" },
  { type: "Z", name: "Pauli-Z", color: "#8b5cf6", icon: "Z" },
  { type: "CNOT", name: "CNOT", color: "#f59e0b", icon: "⊕" },
  { type: "T", name: "T Gate", color: "#ec4899", icon: "T" },
  { type: "S", name: "S Gate", color: "#3b82f6", icon: "S" },
  { type: "MEASURE", name: "Measure", color: "#64748b", icon: "M" },
];

// ============================================================================
// SUB-COMPONENTS - QUANTUM VISUALIZATION
// ============================================================================

// --- Interactive Bloch Sphere ---
const BlochSphere: React.FC<{ qubit: Qubit }> = ({ qubit }) => {
  const size = 200;
  const center = size / 2;
  const radius = 80;
  
  // Calculate 3D to 2D projection for the state vector
  const x = radius * Math.sin(qubit.blochTheta) * Math.cos(qubit.blochPhi);
  const y = radius * Math.sin(qubit.blochTheta) * Math.sin(qubit.blochPhi);
  const z = radius * Math.cos(qubit.blochTheta);
  
  // Simple orthographic projection
  const projX = center + x;
  const projY = center - z; // Flip Y for screen coords

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-black/40 border border-cyan-500/30 rounded-2xl p-6 backdrop-blur-xl shadow-[0_0_30px_rgba(6,182,212,0.2)] flex flex-col items-center"
    >
      <div className="flex items-center justify-between w-full mb-4">
        <div className="flex items-center gap-3">
          <Atom className="w-5 h-5 text-cyan-400" />
          <h3 className="text-sm font-bold text-white tracking-wider">BLOCH SPHERE</h3>
        </div>
        <div className={`px-2 py-1 rounded text-[10px] font-bold border ${
          qubit.state === "ENTANGLED" ? "bg-purple-500/20 text-purple-400 border-purple-500/50" :
          qubit.state === "SUPERPOSITION" ? "bg-cyan-500/20 text-cyan-400 border-cyan-500/50" :
          qubit.state === "MEASURED" ? "bg-gray-500/20 text-gray-400 border-gray-500/50" :
          "bg-green-500/20 text-green-400 border-green-500/50"
        }`}>
          {qubit.state}
        </div>
      </div>

      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="absolute inset-0">
          <defs>
            <radialGradient id="sphereGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="rgba(6,182,212,0.1)" />
              <stop offset="100%" stopColor="rgba(6,182,212,0)" />
            </radialGradient>
          </defs>
          
          {/* Sphere Background */}
          <circle cx={center} cy={center} r={radius} fill="url(#sphereGlow)" stroke="rgba(6,182,212,0.3)" strokeWidth="1" />
          
          {/* Equator */}
          <ellipse cx={center} cy={center} rx={radius} ry={radius * 0.3} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1" strokeDasharray="4 4" />
          
          {/* Vertical Axis (Z) */}
          <line x1={center} y1={center - radius - 10} x2={center} y2={center + radius + 10} stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
          <text x={center + 5} y={center - radius - 5} fill="rgba(255,255,255,0.5)" fontSize="10">|0⟩</text>
          <text x={center + 5} y={center + radius + 15} fill="rgba(255,255,255,0.5)" fontSize="10">|1⟩</text>

          {/* Horizontal Axis (X) */}
          <line x1={center - radius - 10} y1={center} x2={center + radius + 10} y2={center} stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
          <text x={center + radius + 15} y={center + 4} fill="rgba(255,255,255,0.5)" fontSize="10">|+⟩</text>
        </svg>

        {/* State Vector */}
        <motion.line
          x1={center}
          y1={center}
          x2={projX}
          y2={projY}
          stroke={qubit.isEntangled ? "#a855f7" : "#06b6d4"}
          strokeWidth="3"
          strokeLinecap="round"
          initial={false}
          animate={{ x2: projX, y2: projY }}
          transition={{ type: "spring", stiffness: 100, damping: 15 }}
          style={{ filter: `drop-shadow(0 0 5px ${qubit.isEntangled ? "#a855f7" : "#06b6d4"})` }}
        />
        <motion.circle
          cx={projX}
          cy={projY}
          r="6"
          fill={qubit.isEntangled ? "#a855f7" : "#06b6d4"}
          initial={false}
          animate={{ cx: projX, cy: projY }}
          transition={{ type: "spring", stiffness: 100, damping: 15 }}
          style={{ filter: `drop-shadow(0 0 8px ${qubit.isEntangled ? "#a855f7" : "#06b6d4"})` }}
        />
      </div>

      <div className="grid grid-cols-2 gap-4 mt-6 w-full text-xs">
        <div className="bg-black/30 rounded-lg p-3 border border-white/5">
          <div className="text-white/40 mb-1">Theta (θ)</div>
          <div className="text-cyan-400 font-mono">{(qubit.blochTheta * 180 / Math.PI).toFixed(1)}°</div>
        </div>
        <div className="bg-black/30 rounded-lg p-3 border border-white/5">
          <div className="text-white/40 mb-1">Phi (φ)</div>
          <div className="text-purple-400 font-mono">{(qubit.blochPhi * 180 / Math.PI).toFixed(1)}°</div>
        </div>
        <div className="bg-black/30 rounded-lg p-3 border border-white/5">
          <div className="text-white/40 mb-1">Frequency</div>
          <div className="text-green-400 font-mono">{qubit.frequency.toFixed(3)} GHz</div>
        </div>
        <div className="bg-black/30 rounded-lg p-3 border border-white/5">
          <div className="text-white/40 mb-1">Anharmonicity</div>
          <div className="text-yellow-400 font-mono">{qubit.anharmonicity.toFixed(0)} MHz</div>
        </div>
      </div>
    </motion.div>
  );
};

// --- Quantum Circuit Builder ---
const CircuitBuilder: React.FC<{
  qubits: Qubit[];
  steps: CircuitStep[];
  onAddGate: (gate: GateType, qubit: number, controlQubit?: number) => void;
  onReset: () => void;
  onRun: () => void;
  isRunning: boolean;
}> = ({ qubits, steps, onAddGate, onReset, onRun, isRunning }) => {
  const [selectedGate, setSelectedGate] = useState<GateType | null>(null);
  const [controlQubit, setControlQubit] = useState<number | null>(null);

  const handleQubitClick = (qubitId: number, timeStep: number) => {
    if (!selectedGate) return;
    
    if (selectedGate === "CNOT") {
      if (controlQubit === null) {
        setControlQubit(qubitId);
      } else {
        onAddGate("CNOT", qubitId, controlQubit);
        setControlQubit(null);
        setSelectedGate(null);
      }
    } else {
      onAddGate(selectedGate, qubitId);
      setSelectedGate(null);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-black/40 border border-purple-500/30 rounded-2xl p-6 backdrop-blur-xl shadow-[0_0_30px_rgba(168,85,247,0.2)]"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <GitBranch className="w-5 h-5 text-purple-400" />
          <h3 className="text-sm font-bold text-white tracking-wider">QUANTUM CIRCUIT</h3>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onReset}
            className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs text-white/60 hover:bg-white/10 flex items-center gap-2"
          >
            <RotateCcw className="w-3 h-3" /> Reset
          </button>
          <button
            onClick={onRun}
            disabled={isRunning}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 ${
              isRunning ? "bg-green-500/20 text-green-400 border border-green-500/50" : "bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-500 hover:to-blue-500"
            }`}
          >
            {isRunning ? <><Activity className="w-3 h-3 animate-pulse" /> RUNNING</> : <><Play className="w-3 h-3" /> EXECUTE</>}
          </button>
        </div>
      </div>

      {/* Gate Palette */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {GATE_LIBRARY.map(gate => (
          <button
            key={gate.type}
            onClick={() => { setSelectedGate(gate.type); setControlQubit(null); }}
            className={`flex-shrink-0 w-12 h-12 rounded-lg border flex items-center justify-center font-bold text-sm transition-all ${
              selectedGate === gate.type
                ? "bg-purple-500/20 border-purple-500/50 text-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.3)]"
                : "bg-black/40 border-white/10 text-white/60 hover:border-white/30"
            }`}
            style={{ color: selectedGate === gate.type ? gate.color : undefined }}
          >
            {gate.icon}
          </button>
        ))}
      </div>

      {/* Circuit Grid */}
      <div className="relative bg-black/60 rounded-xl p-4 border border-white/5 overflow-x-auto">
        <div className="min-w-[600px]">
          {qubits.map((qubit, qIdx) => (
            <div key={qubit.id} className="flex items-center h-16 relative">
              {/* Qubit Label */}
              <div className="w-12 text-xs font-mono text-cyan-400 font-bold">{qubit.label}</div>
              
              {/* Wire */}
              <div className="flex-1 h-px bg-white/20 relative">
                {steps.map((step, sIdx) => {
                  const gate = step.gates.find(g => g.qubit === qubit.id || g.controlQubit === qubit.id);
                  if (!gate) return null;
                  
                  const isControl = gate.controlQubit === qubit.id;
                  const gateDef = GATE_LIBRARY.find(g => g.type === gate.type);
                  
                  return (
                    <motion.div
                      key={gate.id}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className={`absolute top-1/2 -translate-y-1/2 w-10 h-10 rounded-lg flex items-center justify-center font-bold text-xs border-2 cursor-pointer hover:scale-110 transition-transform ${
                        isControl ? "bg-black border-yellow-500 text-yellow-500" : "bg-black/80 border-cyan-500 text-cyan-400"
                      }`}
                      style={{ left: `${sIdx * 64 + 20}px` }}
                      onClick={() => { /* Remove gate logic */ }}
                    >
                      {isControl ? "•" : gateDef?.icon}
                    </motion.div>
                  );
                })}
                
                {/* Click targets for adding gates */}
                {Array.from({ length: Math.max(steps.length + 1, 8) }).map((_, sIdx) => (
                  <div
                    key={sIdx}
                    className="absolute top-1/2 -translate-y-1/2 w-10 h-10 cursor-pointer hover:bg-white/5 rounded-lg transition-colors"
                    style={{ left: `${sIdx * 64 + 20}px` }}
                    onClick={() => handleQubitClick(qubit.id, sIdx)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

// --- Qubit Topology Map ---
const TopologyMap: React.FC<{ qubits: Qubit[]; type: TopologyType }> = ({ qubits, type }) => {
  // Generate positions based on topology
  const positions = useMemo(() => {
    const pos: Record<number, { x: number; y: number }> = {};
    const count = qubits.length;
    
    if (type === "RING" || type === "HEAVY_HEX") {
      const radius = 120;
      const center = 150;
      qubits.forEach((q, i) => {
        const angle = (i / count) * Math.PI * 2;
        pos[q.id] = { x: center + radius * Math.cos(angle), y: center + radius * Math.sin(angle) };
      });
    } else if (type === "LINEAR") {
      const spacing = 280 / (count - 1 || 1);
      qubits.forEach((q, i) => {
        pos[q.id] = { x: 20 + i * spacing, y: 150 };
      });
    } else {
      // Grid
      const cols = Math.ceil(Math.sqrt(count));
      const spacing = 60;
      qubits.forEach((q, i) => {
        const row = Math.floor(i / cols);
        const col = i % cols;
        pos[q.id] = { x: 40 + col * spacing, y: 40 + row * spacing };
      });
    }
    return pos;
  }, [qubits, type]);

  // Generate connections (nearest neighbors)
  const connections = useMemo(() => {
    const conns: { source: number; target: number }[] = [];
    qubits.forEach((q, i) => {
      if (type === "RING") {
        conns.push({ source: q.id, target: qubits[(i + 1) % qubits.length].id });
      } else if (type === "LINEAR") {
        if (i < qubits.length - 1) conns.push({ source: q.id, target: qubits[i + 1].id });
      } else {
        // Grid/Hex connections
        if (i + 1 < qubits.length && (i + 1) % Math.ceil(Math.sqrt(qubits.length)) !== 0) {
          conns.push({ source: q.id, target: qubits[i + 1].id });
        }
        if (i + Math.ceil(Math.sqrt(qubits.length)) < qubits.length) {
          conns.push({ source: q.id, target: qubits[i + Math.ceil(Math.sqrt(qubits.length))].id });
        }
      }
    });
    return conns;
  }, [qubits, type]);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-black/40 border border-green-500/30 rounded-2xl p-6 backdrop-blur-xl shadow-[0_0_30px_rgba(34,197,94,0.2)]"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Network className="w-5 h-5 text-green-400" />
          <h3 className="text-sm font-bold text-white tracking-wider">QUBIT TOPOLOGY</h3>
        </div>
        <div className="flex gap-2">
          {(["HEAVY_HEX", "LINEAR", "RING"] as TopologyType[]).map(t => (
            <button key={t} className={`px-2 py-1 rounded text-[10px] font-bold ${t === type ? "bg-green-500/20 text-green-400 border border-green-500/50" : "bg-white/5 text-white/40"}`}>
              {t.replace("_", " ")}
            </button>
          ))}
        </div>
      </div>

      <div className="relative h-64 bg-black/40 rounded-xl border border-white/5 overflow-hidden">
        <svg width="100%" height="100%" viewBox="0 0 300 300">
          {/* Connections */}
          {connections.map((conn, i) => {
            const source = positions[conn.source];
            const target = positions[conn.target];
            if (!source || !target) return null;
            return (
              <motion.line
                key={i}
                x1={source.x}
                y1={source.y}
                x2={target.x}
                y2={target.y}
                stroke="rgba(34,197,94,0.3)"
                strokeWidth="2"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1, delay: i * 0.1 }}
              />
            );
          })}
          
          {/* Qubits */}
          {qubits.map(qubit => {
            const pos = positions[qubit.id];
            if (!pos) return null;
            return (
              <g key={qubit.id}>
                <motion.circle
                  cx={pos.x}
                  cy={pos.y}
                  r={qubit.isEntangled ? 12 : 8}
                  fill={qubit.state === "GROUND" ? "#10b981" : qubit.state === "SUPERPOSITION" ? "#06b6d4" : "#a855f7"}
                  stroke="white"
                  strokeWidth="1"
                  animate={{ r: qubit.isEntangled ? [10, 14, 10] : 8 }}
                  transition={{ duration: 2, repeat: Infinity }}
                  style={{ filter: `drop-shadow(0 0 5px ${qubit.state === "GROUND" ? "#10b981" : qubit.state === "SUPERPOSITION" ? "#06b6d4" : "#a855f7"})` }}
                />
                <text x={pos.x} y={pos.y + 20} fill="rgba(255,255,255,0.6)" fontSize="8" textAnchor="middle">{qubit.label}</text>
              </g>
            );
          })}
        </svg>
      </div>

      <div className="grid grid-cols-3 gap-2 mt-4 text-[10px]">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500" />
          <span className="text-white/60">Ground |0⟩</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-cyan-500" />
          <span className="text-white/60">Superposition</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-purple-500" />
          <span className="text-white/60">Entangled</span>
        </div>
      </div>
    </motion.div>
  );
};

// --- Quantum Metrics Dashboard ---
const QuantumMetricsPanel: React.FC<{ metrics: QuantumMetrics; qubits: Qubit[] }> = ({ metrics, qubits }) => {
  const t1Data = qubits.map(q => ({ name: q.label, T1: q.t1Relaxation, T2: q.t2Relaxation }));
  const fidelityData = qubits.map(q => ({ name: q.label, fidelity: q.gateFidelity }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-black/40 border border-yellow-500/30 rounded-2xl p-6 backdrop-blur-xl shadow-[0_0_30px_rgba(234,179,8,0.2)]"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Activity className="w-5 h-5 text-yellow-400" />
          <h3 className="text-sm font-bold text-white tracking-wider">QUANTUM METRICS</h3>
        </div>
        <div className="flex items-center gap-2">
          <Thermometer className="w-4 h-4 text-blue-400" />
          <span className="text-xs text-blue-400 font-mono">{metrics.temperature} mK</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-black/30 rounded-lg p-3 border border-white/5">
          <div className="text-[10px] text-white/40 mb-1">QUANTUM VOLUME</div>
          <div className="text-xl font-bold text-yellow-400">{metrics.quantumVolume}</div>
        </div>
        <div className="bg-black/30 rounded-lg p-3 border border-white/5">
          <div className="text-[10px] text-white/40 mb-1">CIRCUIT DEPTH</div>
          <div className="text-xl font-bold text-cyan-400">{metrics.circuitDepth}</div>
        </div>
        <div className="bg-black/30 rounded-lg p-3 border border-white/5">
          <div className="text-[10px] text-white/40 mb-1">AVG GATE FIDELITY</div>
          <div className="text-xl font-bold text-green-400">{metrics.avgGateFidelity.toFixed(3)}%</div>
        </div>
        <div className="bg-black/30 rounded-lg p-3 border border-white/5">
          <div className="text-[10px] text-white/40 mb-1">ERROR RATE</div>
          <div className="text-xl font-bold text-red-400">{(metrics.errorRate * 100).toFixed(2)}%</div>
        </div>
      </div>

      <div className="h-40">
        <div className="text-[10px] text-white/40 mb-2">T1 / T2 RELAXATION TIMES (μs)</div>
        <RechartsResponsiveContainer width="100%" height="100%">
          <RechartsLineChart data={t1Data}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="name" stroke="rgba(255,255,255,0.3)" tick={{ fontSize: 10 }} />
            <YAxis stroke="rgba(255,255,255,0.3)" tick={{ fontSize: 10 }} />
            <RechartsTooltip contentStyle={{ backgroundColor: "rgba(0,0,0,0.9)", border: "1px solid rgba(234,179,8,0.3)", borderRadius: "8px", color: "white", fontSize: "10px" }} />
            <Line type="monotone" dataKey="T1" stroke="#eab308" strokeWidth={2} dot={{ r: 3 }} />
            <Line type="monotone" dataKey="T2" stroke="#06b6d4" strokeWidth={2} dot={{ r: 3 }} />
          </RechartsLineChart>
        </RechartsResponsiveContainer>
      </div>
    </motion.div>
  );
};

// --- Measurement Histogram ---
const MeasurementHistogram: React.FC<{ results: MeasurementResult[] }> = ({ results }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-black/40 border border-pink-500/30 rounded-2xl p-6 backdrop-blur-xl shadow-[0_0_30px_rgba(236,72,153,0.2)]"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <BarChart3 className="w-5 h-5 text-pink-400" />
          <h3 className="text-sm font-bold text-white tracking-wider">MEASUREMENT HISTOGRAM</h3>
        </div>
        <div className="text-xs text-white/40">1024 Shots</div>
      </div>

      <RechartsResponsiveContainer width="100%" height={200}>
        <RechartsBarChart data={results}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis dataKey="state" stroke="rgba(255,255,255,0.3)" tick={{ fontSize: 12, fill: "#ec4899" }} />
          <YAxis stroke="rgba(255,255,255,0.3)" tick={{ fontSize: 10 }} />
          <RechartsTooltip contentStyle={{ backgroundColor: "rgba(0,0,0,0.9)", border: "1px solid rgba(236,72,153,0.3)", borderRadius: "8px", color: "white" }} />
          <Bar dataKey="counts" fill="#ec4899" radius={[4, 4, 0, 0]}>
            {results.map((entry, index) => (
              <RechartsCell key={`cell-${index}`} fill={`rgba(236,72,153,${0.3 + entry.probability * 0.7})`} stroke="#ec4899" strokeWidth={1} />
            ))}
          </Bar>
        </RechartsBarChart>
      </RechartsResponsiveContainer>

      <div className="grid grid-cols-4 gap-2 mt-4">
        {results.map(res => (
          <div key={res.state} className="bg-black/30 rounded-lg p-2 border border-white/5 text-center">
            <div className="text-[10px] text-white/40 font-mono">|{res.state}⟩</div>
            <div className="text-sm font-bold text-pink-400">{(res.probability * 100).toFixed(1)}%</div>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

// ============================================================================
// MAIN QUANTUM INTERFACE COMPONENT
// ============================================================================

export default function QuantumInterface() {
  const [qubits, setQubits] = useState<Qubit[]>(generateQubits(4));
  const [steps, setSteps] = useState<CircuitStep[]>([]);
  const [measurements, setMeasurements] = useState<MeasurementResult[]>([
    { state: "00", probability: 1, counts: 1024 },
    { state: "01", probability: 0, counts: 0 },
    { state: "10", probability: 0, counts: 0 },
    { state: "11", probability: 0, counts: 0 },
  ]);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedQubitId, setSelectedQubitId] = useState<number>(0);
  const [metrics, setMetrics] = useState<QuantumMetrics>({
    totalQubits: 4,
    activeQubits: 4,
    avgGateFidelity: 99.82,
    avgT1: 85.4,
    avgT2: 42.1,
    quantumVolume: 64,
    circuitDepth: 0,
    errorRate: 0.0018,
    coherenceTime: 120,
    temperature: 15,
  });

  const handleAddGate = useCallback((gate: GateType, qubit: number, controlQubit?: number) => {
    const newGate: QuantumGate = {
      id: `gate_${Date.now()}_${Math.random()}`,
      type: gate,
      qubit,
      controlQubit,
      timestamp: new Date(),
    };

    setSteps(prev => {
      const lastStep = prev[prev.length - 1];
      if (lastStep && lastStep.time === (prev.length > 0 ? prev.length : 0)) {
        // Add to existing step if same time (simplified)
        const newSteps = [...prev];
        newSteps[newSteps.length - 1].gates.push(newGate);
        return newSteps;
      }
      return [...prev, { time: prev.length, gates: [newGate] }];
    });

    // Update Qubit State Visualization
    setQubits(prev => prev.map(q => {
      if (q.id === qubit) {
        const newBloch = applyGateToBloch(q.blochTheta, q.blochPhi, gate);
        let newState: QubitState = q.state;
        if (gate === "H" || gate.startsWith("R")) newState = "SUPERPOSITION";
        if (gate === "CNOT") newState = "ENTANGLED";
        if (gate === "MEASURE") newState = "MEASURED";
        
        return { ...q, blochTheta: newBloch.theta, blochPhi: newBloch.phi, state: newState };
      }
      if (q.id === controlQubit) {
        return { ...q, isEntangled: true, entangledWith: qubit };
      }
      return q;
    }));

    setMetrics(prev => ({ ...prev, circuitDepth: prev.circuitDepth + 1 }));
  }, []);

  const handleReset = useCallback(() => {
    setQubits(generateQubits(4));
    setSteps([]);
    setMeasurements([
      { state: "00", probability: 1, counts: 1024 },
      { state: "01", probability: 0, counts: 0 },
      { state: "10", probability: 0, counts: 0 },
      { state: "11", probability: 0, counts: 0 },
    ]);
    setMetrics(prev => ({ ...prev, circuitDepth: 0 }));
  }, []);

  const handleRun = useCallback(() => {
    setIsRunning(true);
    
    // Simulate quantum execution delay
    setTimeout(() => {
      // Generate random measurement results based on circuit complexity
      const totalShots = 1024;
      const newMeasurements: MeasurementResult[] = [
        { state: "00", probability: Math.random() * 0.5 + 0.2, counts: 0 },
        { state: "01", probability: Math.random() * 0.3, counts: 0 },
        { state: "10", probability: Math.random() * 0.3, counts: 0 },
        { state: "11", probability: Math.random() * 0.2, counts: 0 },
      ];
      
      // Normalize probabilities
      const totalProb = newMeasurements.reduce((sum, m) => sum + m.probability, 0);
      newMeasurements.forEach(m => m.probability /= totalProb);
      newMeasurements.forEach(m => m.counts = Math.floor(m.probability * totalShots));
      
      setMeasurements(newMeasurements);
      setIsRunning(false);
    }, 2000);
  }, []);

  const selectedQubit = qubits.find(q => q.id === selectedQubitId) || qubits[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-slate-900/80 to-black/80 border border-cyan-500/30 rounded-2xl p-6 backdrop-blur-xl shadow-[0_0_30px_rgba(6,182,212,0.2)]"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <Atom className="w-8 h-8 text-cyan-400 animate-pulse" />
            <div>
              <h2 className="text-2xl font-black text-white tracking-wider">QUANTUM COMMAND INTERFACE</h2>
              <p className="text-xs text-white/60">Superconducting Transmon Qubits • 15 mK Dilution Refrigerator • Part 14</p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="px-4 py-2 rounded-lg bg-purple-500/20 border border-purple-500/50 text-purple-400 text-xs font-bold">
              QISKIT COMPATIBLE
            </div>
            <div className="px-4 py-2 rounded-lg bg-cyan-500/20 border border-cyan-500/50 text-cyan-400 text-xs font-bold">
              {metrics.activeQubits}/{metrics.totalQubits} QUBITS ACTIVE
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          <div className="bg-black/30 rounded-lg p-3 border border-white/5">
            <div className="text-[10px] text-white/40 mb-1">TEMPERATURE</div>
            <div className="text-lg font-bold text-blue-400">{metrics.temperature} mK</div>
          </div>
          <div className="bg-black/30 rounded-lg p-3 border border-white/5">
            <div className="text-[10px] text-white/40 mb-1">COHERENCE</div>
            <div className="text-lg font-bold text-green-400">{metrics.coherenceTime} μs</div>
          </div>
          <div className="bg-black/30 rounded-lg p-3 border border-white/5">
            <div className="text-[10px] text-white/40 mb-1">QUANTUM VOL</div>
            <div className="text-lg font-bold text-yellow-400">{metrics.quantumVolume}</div>
          </div>
          <div className="bg-black/30 rounded-lg p-3 border border-white/5">
            <div className="text-[10px] text-white/40 mb-1">AVG T1</div>
            <div className="text-lg font-bold text-cyan-400">{metrics.avgT1.toFixed(1)} μs</div>
          </div>
          <div className="bg-black/30 rounded-lg p-3 border border-white/5">
            <div className="text-[10px] text-white/40 mb-1">AVG T2</div>
            <div className="text-lg font-bold text-purple-400">{metrics.avgT2.toFixed(1)} μs</div>
          </div>
          <div className="bg-black/30 rounded-lg p-3 border border-white/5">
            <div className="text-[10px] text-white/40 mb-1">FIDELITY</div>
            <div className="text-lg font-bold text-green-400">{metrics.avgGateFidelity.toFixed(2)}%</div>
          </div>
        </div>
      </motion.div>

      {/* Main Grid */}
      <div className="grid grid-cols-12 gap-6">
        {/* Left Column - Circuit & Topology */}
        <div className="col-span-12 lg:col-span-8 space-y-6">
          <CircuitBuilder
            qubits={qubits}
            steps={steps}
            onAddGate={handleAddGate}
            onReset={handleReset}
            onRun={handleRun}
            isRunning={isRunning}
          />
          <MeasurementHistogram results={measurements} />
        </div>

        {/* Right Column - Bloch Sphere & Metrics */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
          <div className="space-y-4">
            <div className="flex gap-2 overflow-x-auto pb-2">
              {qubits.map(q => (
                <button
                  key={q.id}
                  onClick={() => setSelectedQubitId(q.id)}
                  className={`flex-shrink-0 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                    selectedQubitId === q.id
                      ? "bg-cyan-500/20 border border-cyan-500/50 text-cyan-400"
                      : "bg-black/40 border border-white/10 text-white/60 hover:border-white/30"
                  }`}
                >
                  {q.label}
                </button>
              ))}
            </div>
            <BlochSphere qubit={selectedQubit} />
          </div>
          
          <TopologyMap qubits={qubits} type="HEAVY_HEX" />
          <QuantumMetricsPanel metrics={metrics} qubits={qubits} />
        </div>
      </div>
    </div>
  );
}