"use client";
import React, { useState, useEffect, useRef, useCallback, useMemo, memo } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";
import {
  Sun, Moon, Sunrise, Sunset, Clock, Activity, Brain, Zap,
  Eye, EyeOff, Thermometer, ThermometerSun, ThermometerSnowflake,
  Wind, Droplets, Cloud, CloudRain, CloudSnow, CloudLightning,
  Flame, Snowflake, Umbrella, Lightbulb, Power, Battery,
  BatteryCharging, BatteryFull, Wifi, WifiOff, Signal, Radio,
  Bluetooth, Settings, Sliders, SlidersHorizontal, ToggleLeft, ToggleRight,
  CheckCircle, AlertCircle, Info, HelpCircle, Search, Filter,
  Download, Upload, Share2, ExternalLink, Copy, Clipboard,
  Scissors, Save, FolderOpen, File, FileText, FileCode,
  FileJson, FileImage, FileVideo, FileAudio, FileArchive,
  Trash, Trash2, Delete, Edit, Edit2, Edit3, Pencil,
  Pen, PenTool, Plus, Minus, MoreVertical, MoreHorizontal,
  Menu, ChevronRight, ChevronLeft, ChevronDown, ChevronUp,
  ArrowRight, ArrowLeft, ArrowDown, ArrowUp, RefreshCw,
  RotateCw, RotateCcw, Undo, Redo, Bell, BellRing, BellOff,
  BellDot, BellMinus, BellPlus, Notification, NotificationOff,
  Notifications, NotificationsOff, MessageSquare, MessageCircle,
  User, Users, UserCheck, UserX, UserPlus, UserMinus,
  Award, Trophy, Medal, Crown, Gem, Diamond, Target,
  Flag, Bookmark, Tag, Hash, AtSign, Phone, Mail,
  Binary, Code, Code2, Braces, Terminal, Command, GitBranch,
  GitCommit, GitPullRequest, Package, Box, Layers, Grid,
  List, Table, Columns, Rows, LayoutDashboard, LayoutGrid,
  LayoutList, LayoutTemplate, Layout, Stack, Folder,
  FileSpreadsheet, FilePresentation, FileDocument, CloudUpload,
  CloudDownload, Link as LinkIcon, Unlink, Heart, Star,
  ThumbsUp, ThumbsDown, Home, Building, Factory, Warehouse,
  Store, Hospital, School, University, Church, Mosque,
  Synagogue, Temple, Car, Bike, Train, Plane, Bus,
  Truck, Ship, MapPin, Navigation, Compass, Globe, Satellite,
  Cpu, MemoryStick, HardDrive, Server, Database, Network,
  Router, Switch, Hub, BarChart3, BarChart, BarChart2,
  BarChart4, BarChartHorizontal, PieChart, PieChart2, LineChart,
  LineChart2, AreaChart, Radar, RadarChart, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Cell,
  Tooltip, Legend, Area, Line, XAxis, YAxis, CartesianGrid,
  ScatterChart, Scatter, ZAxis,
} from "lucide-react";
import {
  AreaChart as RechartsAreaChart, Area as RechartsArea,
  LineChart as RechartsLineChart, Line as RechartsLine,
  XAxis as RechartsXAxis, YAxis as RechartsYAxis,
  CartesianGrid as RechartsCartesianGrid, Tooltip as RechartsTooltip,
  ResponsiveContainer as RechartsResponsiveContainer,
  BarChart as RechartsBarChart, Bar as RechartsBar,
} from "recharts";

// ============================================================================
// TYPE DEFINITIONS - CIRCADIAN ARCHITECTURE
// ============================================================================

type Chronotype = "LARK" | "OWL" | "HUMMINGBIRD" | "DOLPHIN" | "BEAR" | "WOLF";
type CircadianPhase = "NIGHT" | "DAWN" | "MORNING" | "MIDDAY" | "AFTERNOON" | "DUSK" | "EVENING";
type AIState = "DEEP_FOCUS" | "CREATIVE" | "ANALYTICAL" | "WIND_DOWN" | "SLEEP_MODE" | "ALERT";
type SleepStage = "AWAKE" | "REM" | "LIGHT" | "DEEP";

interface CircadianDataPoint {
  hour: number;
  cortisol: number; // ng/mL
  melatonin: number; // pg/mL
  energy: number; // 0-100
  coreTemp: number; // Celsius
  alertness: number; // 0-100
}

interface SleepArchitecture {
  hour: number;
  stage: SleepStage;
  duration: number; // minutes
}

interface EnvironmentalState {
  lux: number;
  colorTemp: number; // Kelvin
  blueLightFilter: number; // 0-100
  noiseLevel: number; // dB
  humidity: number; // %
  airQuality: number; // AQI
}

interface AIStateRule {
  id: string;
  startTime: string; // "HH:MM"
  endTime: string;
  state: AIState;
  priority: number;
  overrides: string[];
}

// ============================================================================
// CONSTANTS & MATHEMATICAL MODELS
// ============================================================================

const CHRONOTYPE_PROFILES: Record<Chronotype, { wakeTime: number; sleepTime: number; peakEnergy: number }> = {
  LARK: { wakeTime: 6, sleepTime: 22, peakEnergy: 10 },
  OWL: { wakeTime: 10, sleepTime: 2, peakEnergy: 20 },
  HUMMINGBIRD: { wakeTime: 5, sleepTime: 21, peakEnergy: 9 },
  DOLPHIN: { wakeTime: 7, sleepTime: 23, peakEnergy: 11 },
  BEAR: { wakeTime: 7, sleepTime: 23, peakEnergy: 13 },
  WOLF: { wakeTime: 9, sleepTime: 1, peakEnergy: 18 },
};

// Mathematical model for Cortisol (peaks ~30 mins after waking)
const calculateCortisol = (hour: number, wakeTime: number): number => {
  const hoursSinceWake = (hour - wakeTime + 24) % 24;
  if (hoursSinceWake < 0.5) return 15; // Baseline
  if (hoursSinceWake < 2) return 25 - (hoursSinceWake - 0.5) * 5; // CAR (Cortisol Awakening Response)
  if (hoursSinceWake < 12) return 20 * Math.exp(-(hoursSinceWake - 2) / 6); // Diurnal decline
  return 5 + Math.random() * 2; // Nighttime baseline
};

// Mathematical model for Melatonin (rises at dusk, peaks at 2-4 AM)
const calculateMelatonin = (hour: number): number => {
  if (hour >= 21 || hour < 5) {
    const nightHour = hour >= 21 ? hour - 21 : hour + 3;
    return 80 * Math.sin((nightHour / 8) * Math.PI); // Peak at 4 hours into night
  }
  return Math.random() * 5; // Daytime suppression
};

// Mathematical model for Core Body Temperature (lowest at 4 AM, highest at 6 PM)
const calculateCoreTemp = (hour: number): number => {
  return 36.1 + 0.7 * Math.sin(((hour - 4) / 24) * Math.PI * 2 - Math.PI / 2);
};

// ============================================================================
// MOCK DATA GENERATORS
// ============================================================================

const generateCircadianData = (chronotype: Chronotype): CircadianDataPoint[] => {
  const profile = CHRONOTYPE_PROFILES[chronotype];
  const data: CircadianDataPoint[] = [];
  
  for (let i = 0; i < 24; i++) {
    const hour = i + Math.random(); // Add slight jitter for realism
    const cortisol = calculateCortisol(i, profile.wakeTime);
    const melatonin = calculateMelatonin(i);
    const energy = 50 + 40 * Math.sin(((i - profile.wakeTime - 4) / 24) * Math.PI * 2);
    const coreTemp = calculateCoreTemp(i);
    const alertness = Math.max(0, Math.min(100, energy + (cortisol * 2) - (melatonin * 0.5)));
    
    data.push({
      hour: i,
      cortisol: parseFloat(cortisol.toFixed(1)),
      melatonin: parseFloat(melatonin.toFixed(1)),
      energy: parseFloat(Math.max(0, Math.min(100, energy)).toFixed(1)),
      coreTemp: parseFloat(coreTemp.toFixed(2)),
      alertness: parseFloat(Math.max(0, Math.min(100, alertness)).toFixed(1)),
    });
  }
  return data;
};

const generateSleepArchitecture = (): SleepArchitecture[] => {
  const stages: SleepStage[] = ["AWAKE", "LIGHT", "DEEP", "REM", "LIGHT", "DEEP", "REM", "LIGHT", "AWAKE"];
  const data: SleepArchitecture[] = [];
  let currentHour = 23;
  
  for (let i = 0; i < 48; i++) { // 30-minute intervals
    const stage = stages[Math.floor(Math.random() * stages.length)];
    data.push({
      hour: currentHour + (i % 2) * 0.5,
      stage,
      duration: 30,
    });
  }
  return data;
};

const generateAIStateRules = (): AIStateRule[] => [
  { id: "rule_1", startTime: "06:00", endTime: "09:00", state: "ALERT", priority: 1, overrides: [] },
  { id: "rule_2", startTime: "09:00", endTime: "12:00", state: "DEEP_FOCUS", priority: 2, overrides: ["notifications"] },
  { id: "rule_3", startTime: "12:00", endTime: "14:00", state: "CREATIVE", priority: 1, overrides: [] },
  { id: "rule_4", startTime: "14:00", endTime: "18:00", state: "ANALYTICAL", priority: 2, overrides: ["social"] },
  { id: "rule_5", startTime: "18:00", endTime: "21:00", state: "WIND_DOWN", priority: 1, overrides: ["work"] },
  { id: "rule_6", startTime: "21:00", endTime: "06:00", state: "SLEEP_MODE", priority: 3, overrides: ["all"] },
];

// ============================================================================
// CUSTOM HOOKS - TIME & BIOLOGICAL TRACKING
// ============================================================================

const useCircadianTime = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [chronotype, setChronotype] = useState<Chronotype>("BEAR");

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const currentHour = currentTime.getHours() + currentTime.getMinutes() / 60;
  const phase: CircadianPhase = 
    currentHour >= 21 || currentHour < 5 ? "NIGHT" :
    currentHour >= 5 && currentHour < 7 ? "DAWN" :
    currentHour >= 7 && currentHour < 11 ? "MORNING" :
    currentHour >= 11 && currentHour < 14 ? "MIDDAY" :
    currentHour >= 14 && currentHour < 17 ? "AFTERNOON" :
    currentHour >= 17 && currentHour < 19 ? "DUSK" : "EVENING";

  return { currentTime, currentHour, phase, chronotype, setChronotype };
};

// ============================================================================
// SUB-COMPONENTS - VISUALIZATION MODULES
// ============================================================================

// --- 24-Hour Circadian Wheel ---
const CircadianWheel: React.FC<{ currentHour: number; data: CircadianDataPoint[] }> = memo(({ currentHour, data }) => {
  const radius = 120;
  const center = 150;
  
  const getCoordinates = (hour: number, r: number) => {
    const angle = ((hour / 24) * Math.PI * 2) - Math.PI / 2;
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle),
    };
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-black/40 border border-cyan-500/30 rounded-2xl p-6 backdrop-blur-xl shadow-[0_0_30px_rgba(6,182,212,0.2)] flex flex-col items-center"
    >
      <div className="flex items-center justify-between w-full mb-4">
        <div className="flex items-center gap-3">
          <Clock className="w-5 h-5 text-cyan-400" />
          <h3 className="text-sm font-bold text-white tracking-wider">24H CIRCADIAN RHYTHM</h3>
        </div>
        <div className="text-xs text-cyan-400 font-mono">
          {Math.floor(currentHour).toString().padStart(2, "0")}:{Math.floor((currentHour % 1) * 60).toString().padStart(2, "0")}
        </div>
      </div>

      <div className="relative w-[300px] h-[300px]">
        <svg width="300" height="300" className="absolute inset-0">
          <defs>
            <linearGradient id="dayGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.2" />
            </linearGradient>
            <linearGradient id="nightGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#4c1d95" stopOpacity="0.2" />
            </linearGradient>
          </defs>

          {/* Day/Night Background Arcs */}
          <path d={`M ${center} ${center} L ${getCoordinates(6, radius).x} ${getCoordinates(6, radius).y} A ${radius} ${radius} 0 0 1 ${getCoordinates(18, radius).x} ${getCoordinates(18, radius).y} Z`} fill="url(#dayGradient)" opacity="0.3" />
          <path d={`M ${center} ${center} L ${getCoordinates(18, radius).x} ${getCoordinates(18, radius).y} A ${radius} ${radius} 0 0 1 ${getCoordinates(6, radius).x} ${getCoordinates(6, radius).y} Z`} fill="url(#nightGradient)" opacity="0.3" />

          {/* Hour Markers */}
          {Array.from({ length: 24 }).map((_, i) => {
            const pos = getCoordinates(i, radius - 10);
            const isMainHour = i % 3 === 0;
            return (
              <g key={i}>
                <line x1={getCoordinates(i, radius - 5).x} y1={getCoordinates(i, radius - 5).y} x2={getCoordinates(i, radius).x} y2={getCoordinates(i, radius).y} stroke="rgba(255,255,255,0.3)" strokeWidth={isMainHour ? 2 : 1} />
                {isMainHour && (
                  <text x={getCoordinates(i, radius - 20).x} y={getCoordinates(i, radius - 20).y} fill="rgba(255,255,255,0.6)" fontSize="10" textAnchor="middle" dominantBaseline="middle">{i}</text>
                )}
              </g>
            );
          })}

          {/* Energy Curve */}
          <path
            d={data.map((d, i) => {
              const pos = getCoordinates(d.hour, radius * (d.energy / 100));
              return `${i === 0 ? "M" : "L"} ${pos.x} ${pos.y}`;
            }).join(" ") + " Z"}
            fill="none"
            stroke="#06b6d4"
            strokeWidth="2"
            opacity="0.8"
          />

          {/* Current Time Indicator */}
          <motion.line
            x1={center}
            y1={center}
            x2={getCoordinates(currentHour, radius).x}
            y2={getCoordinates(currentHour, radius).y}
            stroke="#ef4444"
            strokeWidth="3"
            strokeLinecap="round"
            animate={{ x2: getCoordinates(currentHour, radius).x, y2: getCoordinates(currentHour, radius).y }}
            transition={{ type: "spring", stiffness: 50, damping: 20 }}
            style={{ filter: "drop-shadow(0 0 5px #ef4444)" }}
          />
          <motion.circle
            cx={getCoordinates(currentHour, radius).x}
            cy={getCoordinates(currentHour, radius).y}
            r="6"
            fill="#ef4444"
            animate={{ cx: getCoordinates(currentHour, radius).x, cy: getCoordinates(currentHour, radius).y }}
            transition={{ type: "spring", stiffness: 50, damping: 20 }}
          />
        </svg>

        {/* Center Info */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <div className="text-[10px] text-white/40 uppercase tracking-widest">Current Phase</div>
          <div className="text-lg font-bold text-white mt-1">{currentHour >= 6 && currentHour < 18 ? "DAY" : "NIGHT"}</div>
          <div className="text-xs text-cyan-400 mt-1">Energy: {data[Math.floor(currentHour)]?.energy.toFixed(0)}%</div>
        </div>
      </div>
    </motion.div>
  );
});

// --- Sun/Moon Trajectory ---
const SunMoonTrajectory: React.FC<{ currentHour: number }> = memo(({ currentHour }) => {
  const sunAngle = ((currentHour - 6) / 12) * Math.PI; // Sun rises at 6, sets at 18
  const moonAngle = ((currentHour - 18) / 12) * Math.PI; // Moon rises at 18, sets at 6

  const isDay = currentHour >= 6 && currentHour < 18;
  const celestialAngle = isDay ? sunAngle : moonAngle;
  const celestialX = 50 + 40 * Math.cos(celestialAngle - Math.PI/2);
  const celestialY = 80 - 60 * Math.sin(celestialAngle - Math.PI/2);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-black/40 border border-yellow-500/30 rounded-2xl p-6 backdrop-blur-xl shadow-[0_0_30px_rgba(234,179,8,0.2)]"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          {isDay ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-indigo-400" />}
          <h3 className="text-sm font-bold text-white tracking-wider">CELESTIAL TRAJECTORY</h3>
        </div>
        <div className="text-xs text-white/60">
          {isDay ? "Solar" : "Lunar"} Elevation: {Math.max(0, Math.sin(celestialAngle - Math.PI/2) * 90).toFixed(1)}°
        </div>
      </div>

      <div className="relative h-48 bg-gradient-to-b from-black/60 to-black/20 rounded-xl border border-white/5 overflow-hidden">
        <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
          {/* Horizon */}
          <line x1="0" y1="80" x2="100" y2="80" stroke="rgba(255,255,255,0.2)" strokeWidth="0.5" />
          
          {/* Trajectory Arc */}
          <path d={`M 10 80 Q 50 ${isDay ? 10 : 30} 90 80`} fill="none" stroke={isDay ? "rgba(251,191,36,0.3)" : "rgba(139,92,246,0.3)"} strokeWidth="1" strokeDasharray="2 2" />

          {/* Celestial Body */}
          <motion.circle
            cx={celestialX}
            cy={celestialY}
            r="6"
            fill={isDay ? "#fbbf24" : "#e0e7ff"}
            animate={{ cx: celestialX, cy: celestialY }}
            transition={{ type: "spring", stiffness: 50, damping: 20 }}
            style={{ filter: `drop-shadow(0 0 10px ${isDay ? "#fbbf24" : "#8b5cf6"})` }}
          />
          
          {/* Glow */}
          <motion.circle
            cx={celestialX}
            cy={celestialY}
            r="12"
            fill={isDay ? "rgba(251,191,36,0.2)" : "rgba(139,92,246,0.2)"}
            animate={{ cx: celestialX, cy: celestialY, r: [10, 14, 10] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </svg>

        {/* Time Markers */}
        <div className="absolute bottom-2 left-0 right-0 flex justify-between px-4 text-[10px] text-white/40">
          <span>06:00</span>
          <span>12:00</span>
          <span>18:00</span>
          <span>00:00</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mt-4">
        <div className="bg-black/30 rounded-lg p-3 border border-white/5">
          <div className="text-[10px] text-white/40 mb-1">SUNRISE</div>
          <div className="text-sm font-bold text-yellow-400">06:14 AM</div>
        </div>
        <div className="bg-black/30 rounded-lg p-3 border border-white/5">
          <div className="text-[10px] text-white/40 mb-1">SUNSET</div>
          <div className="text-sm font-bold text-orange-400">08:42 PM</div>
        </div>
      </div>
    </motion.div>
  );
});

// --- Hormone Monitor ---
const HormoneMonitor: React.FC<{ data: CircadianDataPoint[]; currentHour: number }> = memo(({ data, currentHour }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-black/40 border border-purple-500/30 rounded-2xl p-6 backdrop-blur-xl shadow-[0_0_30px_rgba(168,85,247,0.2)]"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Activity className="w-5 h-5 text-purple-400" />
          <h3 className="text-sm font-bold text-white tracking-wider">NEUROENDOCRINE PROFILE</h3>
        </div>
        <div className="flex gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-orange-400" />
            <span className="text-white/60">Cortisol</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-indigo-400" />
            <span className="text-white/60">Melatonin</span>
          </div>
        </div>
      </div>

      <RechartsResponsiveContainer width="100%" height={200}>
        <RechartsLineChart data={data}>
          <RechartsCartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <RechartsXAxis dataKey="hour" stroke="rgba(255,255,255,0.3)" tick={{ fontSize: 10 }} />
          <RechartsYAxis stroke="rgba(255,255,255,0.3)" tick={{ fontSize: 10 }} />
          <RechartsTooltip contentStyle={{ backgroundColor: "rgba(0,0,0,0.9)", border: "1px solid rgba(168,85,247,0.3)", borderRadius: "8px", color: "white", fontSize: "10px" }} />
          <RechartsReferenceLine x={Math.floor(currentHour)} stroke="#ef4444" strokeDasharray="3 3" />
          <RechartsLine type="monotone" dataKey="cortisol" stroke="#f97316" strokeWidth={2} dot={false} name="Cortisol (ng/mL)" />
          <RechartsLine type="monotone" dataKey="melatonin" stroke="#818cf8" strokeWidth={2} dot={false} name="Melatonin (pg/mL)" />
        </RechartsLineChart>
      </RechartsResponsiveContainer>

      <div className="grid grid-cols-3 gap-4 mt-4">
        <div className="bg-black/30 rounded-lg p-3 border border-white/5">
          <div className="text-[10px] text-white/40 mb-1">CORTISOL</div>
          <div className="text-lg font-bold text-orange-400">{data[Math.floor(currentHour)]?.cortisol} ng/mL</div>
        </div>
        <div className="bg-black/30 rounded-lg p-3 border border-white/5">
          <div className="text-[10px] text-white/40 mb-1">MELATONIN</div>
          <div className="text-lg font-bold text-indigo-400">{data[Math.floor(currentHour)]?.melatonin} pg/mL</div>
        </div>
        <div className="bg-black/30 rounded-lg p-3 border border-white/5">
          <div className="text-[10px] text-white/40 mb-1">CORE TEMP</div>
          <div className="text-lg font-bold text-red-400">{data[Math.floor(currentHour)]?.coreTemp}°C</div>
        </div>
      </div>
    </motion.div>
  );
});

// --- AI State Modulator ---
const AIStateModulator: React.FC<{ rules: AIStateRule[]; currentHour: number }> = memo(({ rules, currentHour }) => {
  const getCurrentState = () => {
    const currentMinutes = Math.floor(currentHour * 60);
    return rules.find(rule => {
      const [startH, startM] = rule.startTime.split(":").map(Number);
      const [endH, endM] = rule.endTime.split(":").map(Number);
      const startMinutes = startH * 60 + startM;
      const endMinutes = endH * 60 + endM;
      
      if (startMinutes < endMinutes) {
        return currentMinutes >= startMinutes && currentMinutes < endMinutes;
      } else {
        return currentMinutes >= startMinutes || currentMinutes < endMinutes;
      }
    });
  };

  const currentState = getCurrentState();
  const stateColors: Record<AIState, string> = {
    DEEP_FOCUS: "from-cyan-500 to-blue-600",
    CREATIVE: "from-purple-500 to-pink-600",
    ANALYTICAL: "from-green-500 to-emerald-600",
    WIND_DOWN: "from-orange-500 to-red-600",
    SLEEP_MODE: "from-indigo-500 to-purple-600",
    ALERT: "from-red-500 to-orange-600",
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-black/40 border border-green-500/30 rounded-2xl p-6 backdrop-blur-xl shadow-[0_0_30px_rgba(34,197,94,0.2)]"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Brain className="w-5 h-5 text-green-400" />
          <h3 className="text-sm font-bold text-white tracking-wider">AI STATE MODULATOR</h3>
        </div>
        <div className={`px-3 py-1 rounded-lg text-xs font-bold bg-gradient-to-r ${stateColors[currentState?.state || "SLEEP_MODE"]} text-white`}>
          {currentState?.state.replace(/_/g, " ")}
        </div>
      </div>

      <div className="space-y-3">
        {rules.map((rule) => {
          const [startH] = rule.startTime.split(":").map(Number);
          const [endH] = rule.endTime.split(":").map(Number);
          const isActive = currentState?.id === rule.id;
          
          return (
            <motion.div
              key={rule.id}
              layout
              className={`p-3 rounded-xl border transition-all ${
                isActive ? "bg-white/10 border-green-500/50 shadow-[0_0_15px_rgba(34,197,94,0.2)]" : "bg-black/30 border-white/5"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${isActive ? "bg-green-400 animate-pulse" : "bg-white/20"}`} />
                  <span className="text-xs font-bold text-white">{rule.state.replace(/_/g, " ")}</span>
                </div>
                <span className="text-[10px] text-white/60 font-mono">{rule.startTime} - {rule.endTime}</span>
              </div>
              <div className="text-[10px] text-white/40">
                Overrides: {rule.overrides.length > 0 ? rule.overrides.join(", ") : "None"}
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
});

// --- Sleep Architecture (Hypnogram) ---
const SleepArchitecture: React.FC<{ data: SleepArchitecture[] }> = memo(({ data }) => {
  const stageColors: Record<SleepStage, string> = {
    AWAKE: "#ef4444",
    REM: "#fbbf24",
    LIGHT: "#3b82f6",
    DEEP: "#8b5cf6",
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-black/40 border border-indigo-500/30 rounded-2xl p-6 backdrop-blur-xl shadow-[0_0_30px_rgba(139,92,246,0.2)]"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Moon className="w-5 h-5 text-indigo-400" />
          <h3 className="text-sm font-bold text-white tracking-wider">SLEEP ARCHITECTURE</h3>
        </div>
        <div className="flex gap-3 text-[10px]">
          {Object.entries(stageColors).map(([stage, color]) => (
            <div key={stage} className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
              <span className="text-white/60">{stage}</span>
            </div>
          ))}
        </div>
      </div>

      <RechartsResponsiveContainer width="100%" height={150}>
        <RechartsBarChart data={data} barSize={10}>
          <RechartsCartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <RechartsXAxis dataKey="hour" stroke="rgba(255,255,255,0.3)" tick={{ fontSize: 10 }} />
          <RechartsYAxis stroke="rgba(255,255,255,0.3)" tick={{ fontSize: 10 }} domain={[0, 4]} ticks={[0, 1, 2, 3, 4]} tickFormatter={(val) => ["AWAKE", "REM", "LIGHT", "DEEP"][val] || ""} />
          <RechartsTooltip contentStyle={{ backgroundColor: "rgba(0,0,0,0.9)", border: "1px solid rgba(139,92,246,0.3)", borderRadius: "8px", color: "white", fontSize: "10px" }} formatter={(value: number) => ["AWAKE", "REM", "LIGHT", "DEEP"][value] || ""} />
          <RechartsBar dataKey="stage" radius={[2, 2, 0, 0]}>
            {data.map((entry, index) => (
              <RechartsCell key={`cell-${index}`} fill={stageColors[entry.stage]} />
            ))}
          </RechartsBar>
        </RechartsBarChart>
      </RechartsResponsiveContainer>

      <div className="grid grid-cols-4 gap-2 mt-4">
        <div className="bg-black/30 rounded-lg p-2 border border-white/5 text-center">
          <div className="text-[10px] text-white/40">DEEP</div>
          <div className="text-sm font-bold text-purple-400">22%</div>
        </div>
        <div className="bg-black/30 rounded-lg p-2 border border-white/5 text-center">
          <div className="text-[10px] text-white/40">LIGHT</div>
          <div className="text-sm font-bold text-blue-400">45%</div>
        </div>
        <div className="bg-black/30 rounded-lg p-2 border border-white/5 text-center">
          <div className="text-[10px] text-white/40">REM</div>
          <div className="text-sm font-bold text-yellow-400">25%</div>
        </div>
        <div className="bg-black/30 rounded-lg p-2 border border-white/5 text-center">
          <div className="text-[10px] text-white/40">AWAKE</div>
          <div className="text-sm font-bold text-red-400">8%</div>
        </div>
      </div>
    </motion.div>
  );
});

// --- Environmental Controls ---
const EnvironmentalControls: React.FC<{ envState: EnvironmentalState; setEnvState: React.Dispatch<React.SetStateAction<EnvironmentalState>> }> = memo(({ envState, setEnvState }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-black/40 border border-orange-500/30 rounded-2xl p-6 backdrop-blur-xl shadow-[0_0_30px_rgba(249,115,22,0.2)]"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Lightbulb className="w-5 h-5 text-orange-400" />
          <h3 className="text-sm font-bold text-white tracking-wider">ENVIRONMENTAL SYNC</h3>
        </div>
        <div className="text-xs text-orange-400 font-mono">{envState.lux} LUX</div>
      </div>

      <div className="space-y-6">
        {/* Color Temperature */}
        <div>
          <div className="flex justify-between text-xs mb-2">
            <span className="text-white/60">Color Temperature</span>
            <span className="text-orange-400 font-bold">{envState.colorTemp}K</span>
          </div>
          <div className="h-2 bg-gradient-to-r from-orange-500 via-yellow-200 to-blue-500 rounded-full relative">
            <motion.div
              className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white border-2 border-black shadow-lg"
              style={{ left: `${((envState.colorTemp - 2000) / 4500) * 100}%` }}
              drag="x"
              dragConstraints={{ left: 0, right: 100 }}
              onDrag={(e, info) => {
                const newTemp = 2000 + (info.point.x / 100) * 4500;
                setEnvState(prev => ({ ...prev, colorTemp: Math.max(2000, Math.min(6500, newTemp)) }));
              }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-white/40 mt-1">
            <span>Warm (2000K)</span>
            <span>Cool (6500K)</span>
          </div>
        </div>

        {/* Blue Light Filter */}
        <div>
          <div className="flex justify-between text-xs mb-2">
            <span className="text-white/60">Blue Light Filter</span>
            <span className="text-indigo-400 font-bold">{envState.blueLightFilter}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={envState.blueLightFilter}
            onChange={(e) => setEnvState(prev => ({ ...prev, blueLightFilter: parseInt(e.target.value) }))}
            className="w-full h-2 bg-black/50 rounded-full appearance-none cursor-pointer accent-indigo-500"
          />
        </div>

        {/* Ambient Noise */}
        <div>
          <div className="flex justify-between text-xs mb-2">
            <span className="text-white/60">Ambient Noise</span>
            <span className="text-green-400 font-bold">{envState.noiseLevel} dB</span>
          </div>
          <div className="h-1.5 bg-black/50 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-green-500 to-yellow-500"
              animate={{ width: `${(envState.noiseLevel / 100) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
});

// ============================================================================
// MAIN CIRCADIAN SYNC COMPONENT
// ============================================================================

export default function CircadianSync() {
  const { currentTime, currentHour, phase, chronotype, setChronotype } = useCircadianTime();
  const [circadianData, setCircadianData] = useState<CircadianDataPoint[]>([]);
  const [sleepData, setSleepData] = useState<SleepArchitecture[]>([]);
  const [aiRules, setAiRules] = useState<AIStateRule[]>([]);
  const [envState, setEnvState] = useState<EnvironmentalState>({
    lux: 500,
    colorTemp: 4500,
    blueLightFilter: 20,
    noiseLevel: 40,
    humidity: 45,
    airQuality: 85,
  });

  useEffect(() => {
    setCircadianData(generateCircadianData(chronotype));
    setSleepData(generateSleepArchitecture());
    setAiRules(generateAIStateRules());
  }, [chronotype]);

  // Update environmental state based on time of day
  useEffect(() => {
    const isNight = currentHour >= 20 || currentHour < 6;
    setEnvState(prev => ({
      ...prev,
      lux: isNight ? 50 : 500 + Math.sin((currentHour / 24) * Math.PI) * 400,
      colorTemp: isNight ? 2700 : 5500,
      blueLightFilter: isNight ? 80 : 10,
    }));
  }, [currentHour]);

  const phaseColors: Record<CircadianPhase, string> = {
    NIGHT: "text-indigo-400",
    DAWN: "text-orange-400",
    MORNING: "text-yellow-400",
    MIDDAY: "text-cyan-400",
    AFTERNOON: "text-green-400",
    DUSK: "text-red-400",
    EVENING: "text-purple-400",
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-slate-900/80 to-black/80 border border-cyan-500/30 rounded-2xl p-6 backdrop-blur-xl shadow-[0_0_30px_rgba(6,182,212,0.2)]"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Sun className="w-8 h-8 text-yellow-400 animate-pulse" />
            <div>
              <h2 className="text-2xl font-black text-white tracking-wider">CIRCADIAN SYNC ENGINE</h2>
              <p className="text-xs text-white/60">Biological Rhythm Alignment • Environmental Modulation • Part 18</p>
            </div>
          </div>
          <div className="flex gap-3">
            <select
              value={chronotype}
              onChange={(e) => setChronotype(e.target.value as Chronotype)}
              className="px-4 py-2 bg-black/40 border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-500/50"
            >
              {Object.keys(CHRONOTYPE_PROFILES).map(type => (
                <option key={type} value={type}>{type} Chronotype</option>
              ))}
            </select>
            <div className={`px-4 py-2 rounded-lg text-xs font-bold border ${phaseColors[phase]} bg-black/40 border-current`}>
              {phase.replace(/_/g, " ")}
            </div>
          </div>
        </div>

        {/* Quick Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          <div className="bg-black/30 rounded-lg p-3 border border-white/5">
            <div className="text-[10px] text-white/40 mb-1">BIO TIME</div>
            <div className="text-lg font-bold text-cyan-400">
              {Math.floor(currentHour).toString().padStart(2, "0")}:{Math.floor((currentHour % 1) * 60).toString().padStart(2, "0")}
            </div>
          </div>
          <div className="bg-black/30 rounded-lg p-3 border border-white/5">
            <div className="text-[10px] text-white/40 mb-1">ENERGY</div>
            <div className="text-lg font-bold text-green-400">{circadianData[Math.floor(currentHour)]?.energy.toFixed(0)}%</div>
          </div>
          <div className="bg-black/30 rounded-lg p-3 border border-white/5">
            <div className="text-[10px] text-white/40 mb-1">ALERTNESS</div>
            <div className="text-lg font-bold text-yellow-400">{circadianData[Math.floor(currentHour)]?.alertness.toFixed(0)}%</div>
          </div>
          <div className="bg-black/30 rounded-lg p-3 border border-white/5">
            <div className="text-[10px] text-white/40 mb-1">LUX</div>
            <div className="text-lg font-bold text-orange-400">{envState.lux.toFixed(0)}</div>
          </div>
          <div className="bg-black/30 rounded-lg p-3 border border-white/5">
            <div className="text-[10px] text-white/40 mb-1">COLOR TEMP</div>
            <div className="text-lg font-bold text-purple-400">{envState.colorTemp}K</div>
          </div>
          <div className="bg-black/30 rounded-lg p-3 border border-white/5">
            <div className="text-[10px] text-white/40 mb-1">AIR QUALITY</div>
            <div className="text-lg font-bold text-green-400">{envState.airQuality} AQI</div>
          </div>
        </div>
      </motion.div>

      {/* Main Grid */}
      <div className="grid grid-cols-12 gap-6">
        {/* Left Column */}
        <div className="col-span-12 lg:col-span-5 space-y-6">
          <CircadianWheel currentHour={currentHour} data={circadianData} />
          <SunMoonTrajectory currentHour={currentHour} />
        </div>

        {/* Right Column */}
        <div className="col-span-12 lg:col-span-7 space-y-6">
          <HormoneMonitor data={circadianData} currentHour={currentHour} />
          <div className="grid grid-cols-2 gap-6">
            <AIStateModulator rules={aiRules} currentHour={currentHour} />
            <EnvironmentalControls envState={envState} setEnvState={setEnvState} />
          </div>
          <SleepArchitecture data={sleepData} />
        </div>
      </div>
    </div>
  );
}