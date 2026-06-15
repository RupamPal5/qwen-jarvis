"use client";
import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { motion, AnimatePresence, useAnimation } from "framer-motion";
import {
  Skull, Timer, Lock, Unlock, Key, User, Mail, Wallet, CreditCard,
  Shield, ShieldAlert, ShieldCheck, Activity, Zap, Cpu, Database,
  Network, Server, HardDrive, Wifi, WifiOff, Eye, EyeOff, Fingerprint,
  X, Check, ChevronRight, Power, Trash2, Flame, Radiation,
  Siren, BellRing, BellOff, Terminal, Code, Binary, Hash,
  FileX, FileWarning, AlertCircle, Info, HelpCircle, Clock,
  Calendar, AlertTriangle, CheckCircle, XCircle, Send, Receive,
  Globe, Satellite, Radio, Signal, Battery, BatteryCharging,
  Thermometer, Fan, Gauge, Tachometer, MemoryStick, Cloud,
  CloudOff, CloudUpload, CloudDownload, Share2, ExternalLink,
  Copy, Clipboard, Scissors, Save, FolderOpen, File, FileText,
  FileCode, FileJson, FileImage, FileVideo, FileAudio, FileArchive,
  Trash, Trash2 as Trash2Icon, Delete, Edit, Edit2, Edit3,
  Pencil, Pen, PenTool, Plus, Minus, MoreVertical, MoreHorizontal,
  Menu, ChevronDown, ChevronUp, ArrowRight, ArrowLeft, ArrowDown,
  ArrowUp, RefreshCw, RotateCw, RotateCcw, Undo, Redo, Settings,
  Settings2, Sliders, SlidersHorizontal, SlidersVertical, ToggleLeft,
  ToggleRight, CheckSquare, AlertOctagon, Brain, GitBranch,
  GitCommit, GitPullRequest, Package, Box, Layers, Grid, List,
  Table, Columns, Rows, LayoutDashboard, LayoutGrid, LayoutList,
  LayoutTemplate, Layout, Stack, Folder, Home, Building, Factory,
  Warehouse, Store, Hospital, School, University, Church, Mosque,
  Synagogue, Temple, Car, Bike, Train, Plane, Bus, Truck, Ship,
  MapPin, Navigation, Compass, Sun, Moon, CloudRain, CloudSnow,
  CloudLightning, Wind, Droplets, Snowflake, Umbrella, Lightbulb,
  Volume2, VolumeX, Mic, MicOff, Camera, CameraOff, Video, VideoOff,
  Phone, AtSign, Hash as HashIcon, Code2, Braces, Command,
  Github, Gitlab, Bitbucket, BarChart3, BarChart, BarChart2,
  BarChart4, BarChartHorizontal, PieChart, PieChart2, LineChart,
  LineChart2, AreaChart, Radar, RadarChart, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Cell,
  Tooltip, Legend, Area, Line, XAxis, YAxis, CartesianGrid,
  ScatterChart, Scatter, ZAxis,
} from "lucide-react";
import {
  LineChart as RechartsLineChart, Line as RechartsLine,
  XAxis as RechartsXAxis, YAxis as RechartsYAxis,
  CartesianGrid as RechartsCartesianGrid, Tooltip as RechartsTooltip,
  ResponsiveContainer as RechartsResponsiveContainer,
  AreaChart as RechartsAreaChart, Area as RechartsArea,
} from "recharts";

// ============================================================================
// TYPE DEFINITIONS - OMEGA PROTOCOL ARCHITECTURE
// ============================================================================

type SwitchStatus = "DISARMED" | "ARMED" | "WARNING" | "LOCKDOWN" | "EXECUTING" | "COMPLETE";
type ExecutionStage = "STAGE_1_WARNING" | "STAGE_2_LOCKDOWN" | "STAGE_3_SHRED" | "STAGE_4_WILL";
type BeneficiaryType = "HUMAN" | "AI_AGENT" | "SMART_CONTRACT" | "COLD_STORAGE";
type VerificationMethod = "BIOMETRIC" | "HARDWARE_KEY" | "CRYPTOGRAPHIC_PING" | "MANUAL_CODE";

interface Beneficiary {
  id: string;
  name: string;
  type: BeneficiaryType;
  contact: string; // Email, Wallet Address, or API Endpoint
  assets: string[]; // What they receive
  verificationHash: string;
  status: "PENDING" | "VERIFIED" | "RECEIVED";
}

interface ProtocolStage {
  id: ExecutionStage;
  name: string;
  triggerTime: string; // e.g., "T-24h", "T-7d"
  description: string;
  actions: string[];
  color: string;
  icon: React.ReactNode;
}

interface CheckInLog {
  id: string;
  timestamp: Date;
  method: VerificationMethod;
  ip: string;
  location: string;
  biometricConfidence?: number;
  status: "SUCCESS" | "FAILED" | "SPOOFED";
}

// ============================================================================
// CONSTANTS & MOCK DATA
// ============================================================================

const PROTOCOL_STAGES: ProtocolStage[] = [
  {
    id: "STAGE_1_WARNING",
    name: "PHASE 1: SILENT ALARM",
    triggerTime: "T-24 HOURS",
    description: "System detects inactivity. Internal alerts triggered.",
    actions: ["Notify secondary AI agents", "Log anomaly in Merkle chain", "Prepare encryption keys"],
    color: "#fbbf24", // Amber
    icon: <AlertTriangle className="w-5 h-5" />,
  },
  {
    id: "STAGE_2_LOCKDOWN",
    name: "PHASE 2: TOTAL LOCKDOWN",
    triggerTime: "T-7 DAYS",
    description: "External communications severed. Physical locks engaged.",
    actions: ["Sever Network Moat", "Engage Hardware Guillotine", "Freeze all crypto wallets"],
    color: "#f97316", // Orange
    icon: <Lock className="w-5 h-5" />,
  },
  {
    id: "STAGE_3_SHRED",
    name: "PHASE 3: DATA OBLITERATION",
    triggerTime: "T-14 DAYS",
    description: "Cryptographic shredding of all local and cloud memory.",
    actions: ["Crypto-shred Memory Palace", "Overwrite SSD 7 times", "Degauss backup drives"],
    color: "#ef4444", // Red
    icon: <Trash2 className="w-5 h-5" />,
  },
  {
    id: "STAGE_4_WILL",
    name: "PHASE 4: DIGITAL WILL",
    triggerTime: "T-30 DAYS",
    description: "Execution of final testament. Assets transferred.",
    actions: ["Transfer BTC to cold storage", "Send encrypted emails to beneficiaries", "Self-terminate JARVIS core"],
    color: "#a855f7", // Purple
    icon: <Skull className="w-5 h-5" />,
  },
];

const INITIAL_BENEFICIARIES: Beneficiary[] = [
  {
    id: "ben_1",
    name: "Rupam (Architect) - Personal Vault",
    type: "HUMAN",
    contact: "rupam@stark.ind",
    assets: ["Personal Photos", "Journal Entries", "BTC Wallet (0.5 BTC)"],
    verificationHash: "0x742d...0bEb",
    status: "VERIFIED",
  },
  {
    id: "ben_2",
    name: "Pepper Potts - Stark Industries",
    type: "HUMAN",
    contact: "pepper@stark.ind",
    assets: ["JARVIS Source Code", "Patent Files", "ETH Wallet (12 ETH)"],
    verificationHash: "0x892a...1cDe",
    status: "PENDING",
  },
  {
    id: "ben_3",
    name: "Swarm Node Alpha-7",
    type: "AI_AGENT",
    contact: "alpha7@swarm.jarvis",
    assets: ["Neural Weights", "Council Debate Logs"],
    verificationHash: "SIG:992a...8fGh",
    status: "VERIFIED",
  },
];

// ============================================================================
// SUB-COMPONENTS - OMEGA VISUALIZATION
// ============================================================================

// --- Biometric Heartbeat Monitor ---
const HeartbeatMonitor: React.FC<{ isActive: boolean }> = ({ isActive }) => {
  const [data, setData] = useState<Array<{ time: number; value: number }>>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const generateHeartbeat = () => {
      const newData = Array.from({ length: 50 }, (_, i) => ({
        time: i,
        value: isActive ? (Math.random() > 0.9 ? Math.random() * 100 : Math.random() * 20) : 0,
      }));
      setData(newData);
    };

    generateHeartbeat();
    const interval = setInterval(generateHeartbeat, 1000);
    return () => clearInterval(interval);
  }, [isActive]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-black/60 border border-red-500/30 rounded-2xl p-6 backdrop-blur-xl shadow-[0_0_30px_rgba(239,68,68,0.2)]"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Activity className={`w-5 h-5 ${isActive ? "text-red-400 animate-pulse" : "text-white/40"}`} />
          <h3 className="text-sm font-bold text-white tracking-wider">ARCHITECT BIOMETRIC PULSE</h3>
        </div>
        <div className={`px-3 py-1 rounded text-[10px] font-bold ${isActive ? "bg-red-500/20 text-red-400 border border-red-500/50" : "bg-white/5 text-white/40 border border-white/10"}`}>
          {isActive ? "LIVE SIGNAL" : "NO SIGNAL"}
        </div>
      </div>

      <div className="h-32 relative">
        <RechartsResponsiveContainer width="100%" height="100%">
          <RechartsAreaChart data={data}>
            <defs>
              <linearGradient id="heartbeatGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
              </linearGradient>
            </defs>
            <RechartsXAxis dataKey="time" hide />
            <RechartsYAxis hide domain={[0, 120]} />
            <RechartsArea
              type="monotone"
              dataKey="value"
              stroke="#ef4444"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#heartbeatGradient)"
              isAnimationActive={false}
            />
          </RechartsAreaChart>
        </RechartsResponsiveContainer>
        {/* Grid Overlay */}
        <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)", backgroundSize: "20px 20px" }} />
      </div>

      <div className="grid grid-cols-3 gap-4 mt-4">
        <div className="bg-black/40 rounded-lg p-3 border border-white/5">
          <div className="text-[10px] text-white/40 mb-1">HEART RATE</div>
          <div className="text-lg font-bold text-red-400">{isActive ? "72" : "0"} BPM</div>
        </div>
        <div className="bg-black/40 rounded-lg p-3 border border-white/5">
          <div className="text-[10px] text-white/40 mb-1">O2 SAT</div>
          <div className="text-lg font-bold text-blue-400">{isActive ? "98" : "0"}%</div>
        </div>
        <div className="bg-black/40 rounded-lg p-3 border border-white/5">
          <div className="text-[10px] text-white/40 mb-1">LAST PING</div>
          <div className="text-lg font-bold text-green-400">{isActive ? "2m" : "∞"} ago</div>
        </div>
      </div>
    </motion.div>
  );
};

// --- Protocol Timeline ---
const ProtocolTimeline: React.FC<{ currentStage: ExecutionStage | null }> = ({ currentStage }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-black/60 border border-white/10 rounded-2xl p-6 backdrop-blur-xl"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Timer className="w-5 h-5 text-red-400" />
          <h3 className="text-sm font-bold text-white tracking-wider">EXECUTION TIMELINE</h3>
        </div>
        <div className="text-xs text-white/40">Countdown to Omega</div>
      </div>

      <div className="relative space-y-8">
        {/* Vertical Line */}
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-white/10" />

        {PROTOCOL_STAGES.map((stage, index) => {
          const isPast = currentStage ? PROTOCOL_STAGES.findIndex(s => s.id === currentStage) >= index : false;
          const isCurrent = currentStage === stage.id;

          return (
            <motion.div
              key={stage.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="relative pl-16"
            >
              {/* Node */}
              <div className={`absolute left-4 top-0 w-4 h-4 rounded-full border-2 ${
                isPast ? "bg-red-500 border-red-500" : 
                isCurrent ? "bg-black border-red-500 animate-pulse" : 
                "bg-black border-white/20"
              }`}>
                {isCurrent && <div className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-75" />}
              </div>

              {/* Content */}
              <div className={`p-4 rounded-xl border transition-all ${
                isCurrent ? "bg-red-950/20 border-red-500/50 shadow-[0_0_20px_rgba(239,68,68,0.2)]" : 
                isPast ? "bg-black/40 border-white/5 opacity-50" : 
                "bg-black/40 border-white/10"
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div style={{ color: stage.color }}>{stage.icon}</div>
                    <h4 className="text-sm font-bold text-white">{stage.name}</h4>
                  </div>
                  <span className="text-xs font-mono" style={{ color: stage.color }}>{stage.triggerTime}</span>
                </div>
                <p className="text-xs text-white/60 mb-3">{stage.description}</p>
                <div className="space-y-1">
                  {stage.actions.map((action, i) => (
                    <div key={i} className="flex items-center gap-2 text-[10px] text-white/40">
                      <ChevronRight className="w-3 h-3" />
                      {action}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};

// --- Beneficiary Vault ---
const BeneficiaryVault: React.FC<{ beneficiaries: Beneficiary[] }> = ({ beneficiaries }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-black/60 border border-purple-500/30 rounded-2xl p-6 backdrop-blur-xl shadow-[0_0_30px_rgba(168,85,247,0.2)]"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <User className="w-5 h-5 text-purple-400" />
          <h3 className="text-sm font-bold text-white tracking-wider">DIGITAL WILL BENEFICIARIES</h3>
        </div>
        <button className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
          <Plus className="w-4 h-4 text-white/60" />
        </button>
      </div>

      <div className="space-y-3">
        {beneficiaries.map((ben) => (
          <motion.div
            key={ben.id}
            layout
            className="p-4 rounded-xl border border-white/10 bg-black/40 hover:border-purple-500/30 transition-all group"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${
                  ben.type === "HUMAN" ? "bg-blue-500/10 text-blue-400" :
                  ben.type === "AI_AGENT" ? "bg-purple-500/10 text-purple-400" :
                  "bg-green-500/10 text-green-400"
                }`}>
                  {ben.type === "HUMAN" ? <User className="w-4 h-4" /> : 
                   ben.type === "AI_AGENT" ? <Cpu className="w-4 h-4" /> : 
                   <Wallet className="w-4 h-4" />}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">{ben.name}</h4>
                  <p className="text-[10px] text-white/40 font-mono">{ben.contact}</p>
                </div>
              </div>
              <span className={`px-2 py-1 rounded text-[10px] font-bold ${
                ben.status === "VERIFIED" ? "bg-green-500/20 text-green-400 border border-green-500/50" :
                ben.status === "RECEIVED" ? "bg-blue-500/20 text-blue-400 border border-blue-500/50" :
                "bg-yellow-500/20 text-yellow-400 border border-yellow-500/50"
              }`}>
                {ben.status}
              </span>
            </div>

            <div className="pl-11">
              <div className="text-[10px] text-white/40 mb-1">ASSETS TO TRANSFER:</div>
              <div className="flex flex-wrap gap-1">
                {ben.assets.map((asset, i) => (
                  <span key={i} className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[10px] text-white/60">
                    {asset}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

// --- Check-in Terminal ---
const CheckInTerminal: React.FC<{ onCheckIn: () => void; logs: CheckInLog[] }> = ({ onCheckIn, logs }) => {
  const [code, setCode] = useState("");

  const handleVerify = () => {
    if (code === "OMEGA-ALIVE") {
      onCheckIn();
      setCode("");
    } else {
      alert("INVALID CODE. SWITCH REMAINS ARMED.");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-black/60 border border-cyan-500/30 rounded-2xl p-6 backdrop-blur-xl shadow-[0_0_30px_rgba(6,182,212,0.2)]"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Terminal className="w-5 h-5 text-cyan-400" />
          <h3 className="text-sm font-bold text-white tracking-wider">CRYPTOGRAPHIC CHECK-IN</h3>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-[10px] text-white/40 uppercase tracking-wider mb-2 block">Enter 256-bit Authorization Code</label>
          <input
            type="password"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="OMEGA-..."
            className="w-full bg-black/60 border border-cyan-500/30 rounded-lg px-4 py-3 text-cyan-400 font-mono text-lg focus:outline-none focus:border-cyan-500"
          />
          <p className="text-[10px] text-white/40 mt-2">Hint for testing: OMEGA-ALIVE</p>
        </div>

        <button
          onClick={handleVerify}
          className="w-full py-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-lg font-bold hover:from-cyan-500 hover:to-blue-500 transition-all shadow-[0_0_20px_rgba(6,182,212,0.4)] flex items-center justify-center gap-2"
        >
          <Fingerprint className="w-4 h-4" />
          VERIFY BIOMETRIC PULSE
        </button>

        <div className="pt-4 border-t border-white/10">
          <div className="text-[10px] text-white/40 uppercase tracking-wider mb-2">RECENT CHECK-INS</div>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {logs.map((log) => (
              <div key={log.id} className="flex items-center justify-between p-2 bg-black/40 rounded border border-white/5 text-xs">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${log.status === "SUCCESS" ? "bg-green-400" : "bg-red-400"}`} />
                  <span className="text-white/60">{log.method}</span>
                </div>
                <span className="text-white/40 font-mono">{log.timestamp.toLocaleTimeString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// ============================================================================
// MAIN DEAD MAN'S SWITCH COMPONENT
// ============================================================================

export default function DeadMansSwitch() {
  const [status, setStatus] = useState<SwitchStatus>("ARMED");
  const [timeRemaining, setTimeRemaining] = useState(2592000); // 30 days in seconds
  const [currentStage, setCurrentStage] = useState<ExecutionStage | null>(null);
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>(INITIAL_BENEFICIARIES);
  const [checkInLogs, setCheckInLogs] = useState<CheckInLog[]>([
    { id: "log_1", timestamp: new Date(Date.now() - 86400000), method: "BIOMETRIC", ip: "192.168.1.100", location: "Home Lab", biometricConfidence: 99.8, status: "SUCCESS" },
    { id: "log_2", timestamp: new Date(Date.now() - 172800000), method: "HARDWARE_KEY", ip: "192.168.1.100", location: "Home Lab", status: "SUCCESS" },
  ]);

  // Countdown Logic
  useEffect(() => {
    if (status !== "ARMED" && status !== "WARNING") return;
    
    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 0) {
          setStatus("EXECUTING");
          return 0;
        }
        
        // Update stage based on time
        const daysLeft = prev / 86400;
        if (daysLeft <= 1) setCurrentStage("STAGE_1_WARNING");
        else if (daysLeft <= 7) setCurrentStage("STAGE_2_LOCKDOWN");
        else if (daysLeft <= 14) setCurrentStage("STAGE_3_SHRED");
        else if (daysLeft <= 30) setCurrentStage("STAGE_4_WILL");
        
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [status]);

  const handleCheckIn = () => {
    setTimeRemaining(2592000); // Reset to 30 days
    setCurrentStage(null);
    setStatus("ARMED");
    setCheckInLogs(prev => [{
      id: `log_${Date.now()}`,
      timestamp: new Date(),
      method: "CRYPTOGRAPHIC_PING",
      ip: "192.168.1.100",
      location: "Home Lab",
      biometricConfidence: 100,
      status: "SUCCESS",
    }, ...prev]);
  };

  const formatTime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${days}d ${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="space-y-6 relative">
      {/* Background Pulse */}
      {status === "EXECUTING" && (
        <motion.div
          className="absolute inset-0 bg-red-500/10 pointer-events-none z-0"
          animate={{ opacity: [0.1, 0.3, 0.1] }}
          transition={{ duration: 1, repeat: Infinity }}
        />
      )}

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-red-950/80 to-black/80 border border-red-500/50 rounded-2xl p-6 backdrop-blur-xl shadow-[0_0_50px_rgba(239,68,68,0.3)] relative z-10"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Skull className="w-8 h-8 text-red-500 animate-pulse" />
            <div>
              <h2 className="text-2xl font-black text-red-500 tracking-wider">DEAD MAN'S SWITCH // OMEGA PROTOCOL</h2>
              <p className="text-xs text-white/60">Final Testament • Cryptographic Will • Part 20</p>
            </div>
          </div>
          <div className={`px-4 py-2 rounded-lg text-xs font-bold border ${
            status === "ARMED" ? "bg-red-500/20 text-red-400 border-red-500/50 animate-pulse" :
            status === "DISARMED" ? "bg-green-500/20 text-green-400 border-green-500/50" :
            "bg-black text-white border-white/50"
          }`}>
            STATUS: {status}
          </div>
        </div>

        {/* Big Timer */}
        <div className="flex items-center justify-center py-8 bg-black/40 rounded-xl border border-red-500/20">
          <div className="text-center">
            <div className="text-[10px] text-red-400 tracking-[0.5em] font-bold mb-2">TIME TO EXECUTION</div>
            <motion.div
              className="text-6xl font-black text-red-500 font-mono tabular-nums"
              animate={status === "ARMED" ? { opacity: [1, 0.8, 1] } : {}}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {formatTime(timeRemaining)}
            </motion.div>
            <div className="text-xs text-white/40 mt-2">If no check-in is received, Protocol Omega initiates.</div>
          </div>
        </div>
      </motion.div>

      {/* Main Grid */}
      <div className="grid grid-cols-12 gap-6 relative z-10">
        {/* Left Column */}
        <div className="col-span-12 lg:col-span-5 space-y-6">
          <HeartbeatMonitor isActive={status === "ARMED"} />
          <CheckInTerminal onCheckIn={handleCheckIn} logs={checkInLogs} />
        </div>

        {/* Right Column */}
        <div className="col-span-12 lg:col-span-7 space-y-6">
          <ProtocolTimeline currentStage={currentStage} />
          <BeneficiaryVault beneficiaries={beneficiaries} />
        </div>
      </div>
    </div>
  );
}