"use client";
import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Fingerprint, Eye, Mic, Lock, Unlock, Shield, ShieldAlert, ShieldCheck,
  Key, KeyRound, Hash, Binary, Cpu, CpuIcon, Activity, Zap,
  AlertTriangle, AlertCircle, CheckCircle, XCircle, Info, Clock,
  Terminal, Code, Bug, Check, X, ChevronRight, ChevronDown,
  MoreVertical, Settings, Bell, BellOff, BellRing,
  BarChart3, PieChart, LineChart, Radar, RadarChart,
  PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer,
  Cell, Tooltip, Legend, Area, AreaChart, Line, XAxis, YAxis,
  CartesianGrid, ScatterChart, Scatter, ZAxis,
  Wifi, WifiOff, Bluetooth, Usb, HardDrive, Thermometer,
  Fan, Power, Battery, BatteryCharging, Gauge, Tachometer,
  MemoryStick, Cloud, CloudOff, CloudUpload, CloudDownload,
  Share2, ExternalLink, Copy, Clipboard, Scissors, Save,
  FolderOpen, File, FileCode, FileText, Archive, Inbox,
  User, Users, Star, Heart, ThumbsUp, ThumbsDown, Award, Trophy,
  Target, Flag, MapPin, Navigation, Compass,
  Sun, Moon, CloudRain, CloudSnow, Flame, Snowflake,
  Umbrella, Wind, Droplets, Timer, TimerOff, TimerReset,
  Stopwatch, Volume2, VolumeX, Camera, CameraOff, Video, VideoOff,
  Phone, Mail, AtSign, Code2, Braces, Command, GitBranch,
  GitCommit, GitPullRequest, Package, Box, Layers, Grid, List,
  Table, Columns, Rows, AlignLeft, AlignCenter, AlignRight,
  Bold, Italic, Underline, Strikethrough, Type, Heading,
  Sparkles, Wand2, Magic, Crown, Gem, Diamond, Feather,
  Anchor, Briefcase, Coffee, CupSoda, Pizza, Beer, Wine,
  Carrot, Apple, Banana, Orange, Lemon, Lime, Grape, Cherry,
  Peach, Pear, Plum, Watermelon, Strawberry, Blueberry,
  Raspberry, Blackberry, Kiwi, Mango, Pineapple, Coconut,
  Avocado, Tomato, Potato, Onion, Garlic, Pepper, Mushroom,
  Broccoli, Cauliflower, Lettuce, Spinach, Kale, Cabbage,
  Celery, Cucumber, Zucchini, Eggplant, Radish, Turnip, Beet,
  Parsnip, Fennel, Asparagus, Artichoke, BrusselsSprouts,
  BokChoy, Chard, CollardGreens, MustardGreens, TurnipGreens,
  BeetGreens, RadishGreens, CarrotGreens,
} from "lucide-react";
import {
  PieChart as RechartsPie, Pie as RechartsPieSlice, Cell as RechartsCell,
  ResponsiveContainer as RechartsResponsiveContainer, Tooltip as RechartsTooltip,
  Legend as RechartsLegend,
} from "recharts";

// ============================================================================
// TYPE DEFINITIONS - BIOMETRIC SECURITY ARCHITECTURE
// ============================================================================

type AuthState = "IDLE" | "SCANNING_FINGERPRINT" | "SCANNING_IRIS" | "SCANNING_VOICE" | "VERIFYING_HASH" | "GRANTED" | "DENIED" | "LOCKED" | "PANIC";
type SecurityLevel = "LEVEL_1_PUBLIC" | "LEVEL_2_RESTRICTED" | "LEVEL_3_CONFIDENTIAL" | "LEVEL_4_SECRET" | "LEVEL_5_TOP_SECRET" | "LEVEL_6_CODENAMES";
type AuthMethod = "FINGERPRINT" | "IRIS" | "VOICE" | "HARDWARE_KEY" | "OTP";

interface BiometricData {
  fingerprintConfidence: number;
  irisConfidence: number;
  voiceConfidence: number;
  livenessScore: number;
  entropyPool: number;
}

interface SecurityToken {
  id: string;
  type: "JWT" | "OAUTH2" | "HARDWARE";
  algorithm: string;
  issuedAt: Date;
  expiresAt: Date;
  signature: string;
  isValid: boolean;
}

interface AuditEntry {
  id: string;
  timestamp: Date;
  action: string;
  actor: string;
  ip: string;
  hash: string;
  previousHash: string;
  status: "SUCCESS" | "FAILURE" | "BLOCKED";
}

interface HSMStatus {
  temperature: number;
  uptime: number;
  rngHealth: number;
  activeConnections: number;
  tamperStatus: "SECURE" | "WARNING" | "TAMPERED";
}

// ============================================================================
// UTILITY FUNCTIONS - CRYPTOGRAPHIC & SECURITY
// ============================================================================

const generateHash = (length: number = 64): string => {
  const chars = "0123456789abcdef";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
};

const generateAuditChain = (count: number): AuditEntry[] => {
  const entries: AuditEntry[] = [];
  let prevHash = "0".repeat(64);
  
  for (let i = 0; i < count; i++) {
    const currentHash = generateHash(64);
    entries.push({
      id: `audit_${i}`,
      timestamp: new Date(Date.now() - (count - i) * 60000),
      action: ["AUTH_SUCCESS", "TOKEN_REFRESH", "KEY_ROTATION", "SESSION_INIT", "POLICY_CHECK"][Math.floor(Math.random() * 5)],
      actor: "ARCHITECT",
      ip: "192.168.1.100",
      hash: currentHash,
      previousHash: prevHash,
      status: Math.random() > 0.9 ? "FAILURE" : "SUCCESS",
    });
    prevHash = currentHash;
  }
  return entries;
};

// ============================================================================
// CUSTOM HOOKS - CANVAS ANIMATIONS
// ============================================================================

const useFingerprintCanvas = (isActive: boolean) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = 300;
    canvas.height = 300;
    let scanY = 0;
    let scanDirection = 1;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw fingerprint ridges (simplified concentric ellipses)
      ctx.strokeStyle = "rgba(6, 182, 212, 0.3)";
      ctx.lineWidth = 2;
      for (let i = 1; i <= 10; i++) {
        ctx.beginPath();
        ctx.ellipse(150, 150, i * 12, i * 15, 0, 0, Math.PI * 2);
        ctx.stroke();
      }

      if (isActive) {
        // Scanning line
        ctx.strokeStyle = "#06b6d4";
        ctx.lineWidth = 4;
        ctx.shadowColor = "#06b6d4";
        ctx.shadowBlur = 15;
        ctx.beginPath();
        ctx.moveTo(50, scanY);
        ctx.lineTo(250, scanY);
        ctx.stroke();
        ctx.shadowBlur = 0;

        scanY += scanDirection * 3;
        if (scanY > 280 || scanY < 20) scanDirection *= -1;
      }

      animationRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isActive]);

  return canvasRef;
};

const useIrisCanvas = (isActive: boolean) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = 300;
    canvas.height = 300;
    let rotation = 0;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const cx = 150, cy = 150;

      // Outer rings
      ctx.strokeStyle = "rgba(168, 85, 247, 0.4)";
      ctx.lineWidth = 1;
      for (let i = 1; i <= 5; i++) {
        ctx.beginPath();
        ctx.arc(cx, cy, i * 25, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Iris pattern
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(rotation);
      ctx.strokeStyle = "#a855f7";
      ctx.lineWidth = 2;
      for (let i = 0; i < 24; i++) {
        ctx.rotate((Math.PI * 2) / 24);
        ctx.beginPath();
        ctx.moveTo(30, 0);
        ctx.lineTo(100, 0);
        ctx.stroke();
      }
      ctx.restore();

      // Pupil
      ctx.fillStyle = "#000";
      ctx.beginPath();
      ctx.arc(cx, cy, 20, 0, Math.PI * 2);
      ctx.fill();

      if (isActive) {
        // Targeting reticle
        ctx.strokeStyle = "#ec4899";
        ctx.lineWidth = 2;
        ctx.shadowColor = "#ec4899";
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(cx, cy, 110 + Math.sin(Date.now() / 200) * 5, 0, Math.PI * 2);
        ctx.stroke();
        ctx.shadowBlur = 0;
        rotation += 0.02;
      }

      animationRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isActive]);

  return canvasRef;
};

// ============================================================================
// SUB-COMPONENTS - SECURITY VISUALIZATION
// ============================================================================

const HashChainVisualizer: React.FC<{ entries: AuditEntry[] }> = ({ entries }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-black/40 border border-green-500/30 rounded-2xl p-6 backdrop-blur-xl shadow-[0_0_30px_rgba(34,197,94,0.2)]"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Hash className="w-5 h-5 text-green-400" />
          <h3 className="text-sm font-bold text-white tracking-wider">CRYPTOGRAPHIC AUDIT CHAIN</h3>
        </div>
        <div className="flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-green-400" />
          <span className="text-[10px] text-green-400 font-bold">CHAIN VALID • NO DATA LOSS</span>
        </div>
      </div>

      <div className="space-y-3 max-h-80 overflow-y-auto custom-scrollbar">
        {entries.slice().reverse().map((entry, i) => (
          <motion.div
            key={entry.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-black/60 border border-white/5 rounded-lg p-3 font-mono text-[10px]"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-white/60">{entry.timestamp.toLocaleTimeString()}</span>
              <span className={`px-2 py-0.5 rounded ${entry.status === "SUCCESS" ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>
                {entry.status}
              </span>
            </div>
            <div className="text-cyan-400 truncate mb-1">
              <span className="text-white/40">HASH:</span> {entry.hash.substring(0, 32)}...
            </div>
            <div className="text-purple-400 truncate">
              <span className="text-white/40">PREV:</span> {entry.previousHash.substring(0, 32)}...
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

const HSMTelemetry: React.FC<{ status: HSMStatus }> = ({ status }) => {
  const metrics = [
    { label: "TEMPERATURE", value: `${status.temperature}°C`, color: status.temperature > 60 ? "text-red-400" : "text-cyan-400" },
    { label: "RNG HEALTH", value: `${status.rngHealth}%`, color: "text-green-400" },
    { label: "UPTIME", value: `${Math.floor(status.uptime / 3600)}h ${Math.floor((status.uptime % 3600) / 60)}m`, color: "text-purple-400" },
    { label: "CONNECTIONS", value: status.activeConnections.toString(), color: "text-yellow-400" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-black/40 border border-cyan-500/30 rounded-2xl p-6 backdrop-blur-xl shadow-[0_0_30px_rgba(6,182,212,0.2)]"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Cpu className="w-5 h-5 text-cyan-400" />
          <h3 className="text-sm font-bold text-white tracking-wider">HARDWARE SECURITY MODULE</h3>
        </div>
        <div className={`px-2 py-1 rounded text-[10px] font-bold border ${
          status.tamperStatus === "SECURE" ? "bg-green-500/20 text-green-400 border-green-500/50" :
          status.tamperStatus === "WARNING" ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/50" :
          "bg-red-500/20 text-red-400 border-red-500/50 animate-pulse"
        }`}>
          {status.tamperStatus}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {metrics.map((metric, i) => (
          <div key={i} className="bg-black/30 rounded-lg p-3 border border-white/5">
            <div className="text-[10px] text-white/40 mb-1">{metric.label}</div>
            <div className={`text-lg font-bold ${metric.color}`}>{metric.value}</div>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-white/10">
        <div className="text-[10px] text-white/40 mb-2">ENTROPY POOL</div>
        <div className="h-2 bg-black/50 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-cyan-500 to-purple-500"
            initial={{ width: 0 }}
            animate={{ width: "98%" }}
            transition={{ duration: 2 }}
          />
        </div>
      </div>
    </motion.div>
  );
};

// ============================================================================
// MAIN BIOMETRIC AUTH COMPONENT
// ============================================================================

export default function BiometricAuth() {
  const [authState, setAuthState] = useState<AuthState>("IDLE");
  const [selectedMethod, setSelectedMethod] = useState<AuthMethod>("FINGERPRINT");
  const [biometricData, setBiometricData] = useState<BiometricData>({
    fingerprintConfidence: 0,
    irisConfidence: 0,
    voiceConfidence: 0,
    livenessScore: 100,
    entropyPool: 98,
  });
  const [auditLog, setAuditLog] = useState<AuditEntry[]>(generateAuditChain(20));
  const [hsmStatus, setHsmStatus] = useState<HSMStatus>({
    temperature: 42,
    uptime: 1245600,
    rngHealth: 99.9,
    activeConnections: 12,
    tamperStatus: "SECURE",
  });
  const [activeTokens, setActiveTokens] = useState<SecurityToken[]>([]);

  const fingerprintCanvasRef = useFingerprintCanvas(authState === "SCANNING_FINGERPRINT");
  const irisCanvasRef = useIrisCanvas(authState === "SCANNING_IRIS");

  // Simulate scanning process
  useEffect(() => {
    if (authState === "IDLE" || authState === "GRANTED" || authState === "DENIED") return;

    const interval = setInterval(() => {
      setBiometricData(prev => {
        const newData = { ...prev };
        if (authState === "SCANNING_FINGERPRINT") {
          newData.fingerprintConfidence = Math.min(100, prev.fingerprintConfidence + Math.random() * 15);
        } else if (authState === "SCANNING_IRIS") {
          newData.irisConfidence = Math.min(100, prev.irisConfidence + Math.random() * 12);
        } else if (authState === "SCANNING_VOICE") {
          newData.voiceConfidence = Math.min(100, prev.voiceConfidence + Math.random() * 10);
        }
        return newData;
      });
    }, 200);

    return () => clearInterval(interval);
  }, [authState]);

  const handleStartAuth = () => {
    setBiometricData({ fingerprintConfidence: 0, irisConfidence: 0, voiceConfidence: 0, livenessScore: 100, entropyPool: 98 });
    
    if (selectedMethod === "FINGERPRINT") setAuthState("SCANNING_FINGERPRINT");
    else if (selectedMethod === "IRIS") setAuthState("SCANNING_IRIS");
    else if (selectedMethod === "VOICE") setAuthState("SCANNING_VOICE");
  };

  const handleVerify = () => {
    setAuthState("VERIFYING_HASH");
    setTimeout(() => {
      const success = Math.random() > 0.2; // 80% success rate
      if (success) {
        setAuthState("GRANTED");
        setActiveTokens(prev => [...prev, {
          id: generateHash(16),
          type: "JWT",
          algorithm: "ES256",
          issuedAt: new Date(),
          expiresAt: new Date(Date.now() + 3600000),
          signature: generateHash(64),
          isValid: true,
        }]);
        setAuditLog(prev => [{
          id: `audit_${Date.now()}`,
          timestamp: new Date(),
          action: "AUTH_SUCCESS",
          actor: "ARCHITECT",
          ip: "192.168.1.100",
          hash: generateHash(64),
          previousHash: prev[prev.length - 1].hash,
          status: "SUCCESS",
        }, ...prev]);
      } else {
        setAuthState("DENIED");
        setAuditLog(prev => [{
          id: `audit_${Date.now()}`,
          timestamp: new Date(),
          action: "AUTH_FAILURE",
          actor: "UNKNOWN",
          ip: "192.168.1.105",
          hash: generateHash(64),
          previousHash: prev[prev.length - 1].hash,
          status: "FAILURE",
        }, ...prev]);
      }
    }, 2000);
  };

  const handleReset = () => {
    setAuthState("IDLE");
    setBiometricData({ fingerprintConfidence: 0, irisConfidence: 0, voiceConfidence: 0, livenessScore: 100, entropyPool: 98 });
  };

  const getConfidenceColor = (value: number) => {
    if (value < 50) return "text-red-400";
    if (value < 80) return "text-yellow-400";
    return "text-green-400";
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
            <ShieldCheck className="w-8 h-8 text-cyan-400" />
            <div>
              <h2 className="text-2xl font-black text-white tracking-wider">BIOMETRIC SOVEREIGNTY GATE</h2>
              <p className="text-xs text-white/60">Multi-Factor Authentication • Zero-Knowledge Proofs • Part 16</p>
            </div>
          </div>
          <div className={`px-4 py-2 rounded-lg text-xs font-bold border ${
            authState === "GRANTED" ? "bg-green-500/20 text-green-400 border-green-500/50" :
            authState === "DENIED" ? "bg-red-500/20 text-red-400 border-red-500/50" :
            authState === "LOCKED" || authState === "PANIC" ? "bg-red-500/20 text-red-400 border-red-500/50 animate-pulse" :
            "bg-cyan-500/20 text-cyan-400 border-cyan-500/50"
          }`}>
            {authState.replace(/_/g, " ")}
          </div>
        </div>

        {/* Method Selector */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {(["FINGERPRINT", "IRIS", "VOICE", "HARDWARE_KEY"] as AuthMethod[]).map(method => (
            <button
              key={method}
              onClick={() => { setSelectedMethod(method); handleReset(); }}
              className={`p-4 rounded-xl border backdrop-blur-xl transition-all ${
                selectedMethod === method
                  ? "bg-cyan-500/10 border-cyan-500/50 shadow-[0_0_20px_rgba(6,182,212,0.2)]"
                  : "bg-black/40 border-white/10 hover:border-white/30"
              }`}
            >
              <div className="flex flex-col items-center gap-2">
                {method === "FINGERPRINT" && <Fingerprint className="w-6 h-6 text-cyan-400" />}
                {method === "IRIS" && <Eye className="w-6 h-6 text-purple-400" />}
                {method === "VOICE" && <Mic className="w-6 h-6 text-green-400" />}
                {method === "HARDWARE_KEY" && <KeyRound className="w-6 h-6 text-yellow-400" />}
                <span className="text-xs font-bold text-white tracking-wider">{method.replace(/_/g, " ")}</span>
              </div>
            </button>
          ))}
        </div>
      </motion.div>

      {/* Main Grid */}
      <div className="grid grid-cols-12 gap-6">
        {/* Left Column - Scanner */}
        <div className="col-span-12 lg:col-span-5 space-y-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-black/40 border border-white/10 rounded-2xl p-6 backdrop-blur-xl flex flex-col items-center justify-center min-h-[400px]"
          >
            {selectedMethod === "FINGERPRINT" && (
              <div className="relative">
                <canvas ref={fingerprintCanvasRef} className="w-[300px] h-[300px]" />
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-xs text-cyan-400 font-mono">
                  CONFIDENCE: {biometricData.fingerprintConfidence.toFixed(1)}%
                </div>
              </div>
            )}
            {selectedMethod === "IRIS" && (
              <div className="relative">
                <canvas ref={irisCanvasRef} className="w-[300px] h-[300px]" />
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-xs text-purple-400 font-mono">
                  CONFIDENCE: {biometricData.irisConfidence.toFixed(1)}%
                </div>
              </div>
            )}
            {selectedMethod === "VOICE" && (
              <div className="flex flex-col items-center gap-4">
                <div className="flex items-end gap-1 h-32">
                  {Array.from({ length: 32 }).map((_, i) => (
                    <motion.div
                      key={i}
                      className="w-2 bg-gradient-to-t from-green-500 to-cyan-500 rounded-t"
                      animate={{ height: authState === "SCANNING_VOICE" ? [10, Math.random() * 100 + 20, 10] : 10 }}
                      transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.05 }}
                    />
                  ))}
                </div>
                <div className="text-xs text-green-400 font-mono">
                  VOICEPRINT MATCH: {biometricData.voiceConfidence.toFixed(1)}%
                </div>
              </div>
            )}
            {selectedMethod === "HARDWARE_KEY" && (
              <div className="flex flex-col items-center gap-6">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <KeyRound className="w-24 h-24 text-yellow-400" />
                </motion.div>
                <div className="text-xs text-yellow-400 font-mono text-center">
                  INSERT YUBIKEY INTO USB PORT<br/>OR TAP NFC READER
                </div>
              </div>
            )}

            {/* Control Buttons */}
            <div className="flex gap-4 mt-8">
              {authState === "IDLE" && (
                <button
                  onClick={handleStartAuth}
                  className="px-8 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-xl font-bold hover:from-cyan-500 hover:to-blue-500 transition-all shadow-[0_0_20px_rgba(6,182,212,0.4)]"
                >
                  START SCAN
                </button>
              )}
              {(authState === "SCANNING_FINGERPRINT" || authState === "SCANNING_IRIS" || authState === "SCANNING_VOICE") && (
                <button
                  onClick={handleVerify}
                  className="px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-bold hover:from-green-500 hover:to-emerald-500 transition-all shadow-[0_0_20px_rgba(34,197,94,0.4)]"
                >
                  VERIFY IDENTITY
                </button>
              )}
              {(authState === "GRANTED" || authState === "DENIED") && (
                <button
                  onClick={handleReset}
                  className="px-8 py-3 bg-white/10 border border-white/20 text-white rounded-xl font-bold hover:bg-white/20 transition-all"
                >
                  RESET SYSTEM
                </button>
              )}
            </div>
          </motion.div>

          {/* Security Metrics */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-black/40 border border-white/10 rounded-xl p-4">
              <div className="text-[10px] text-white/40 mb-2">LIVENESS SCORE</div>
              <div className={`text-2xl font-bold ${getConfidenceColor(biometricData.livenessScore)}`}>
                {biometricData.livenessScore}%
              </div>
            </div>
            <div className="bg-black/40 border border-white/10 rounded-xl p-4">
              <div className="text-[10px] text-white/40 mb-2">ENTROPY POOL</div>
              <div className="text-2xl font-bold text-cyan-400">{biometricData.entropyPool}%</div>
            </div>
          </div>
        </div>

        {/* Right Column - Telemetry & Logs */}
        <div className="col-span-12 lg:col-span-7 space-y-6">
          <HSMTelemetry status={hsmStatus} />
          <HashChainVisualizer entries={auditLog} />
          
          {/* Active Tokens */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-black/40 border border-purple-500/30 rounded-2xl p-6 backdrop-blur-xl shadow-[0_0_30px_rgba(168,85,247,0.2)]"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Key className="w-5 h-5 text-purple-400" />
                <h3 className="text-sm font-bold text-white tracking-wider">ACTIVE SECURITY TOKENS</h3>
              </div>
              <Badge variant="info">{activeTokens.length} Active</Badge>
            </div>

            <div className="space-y-3">
              {activeTokens.length === 0 ? (
                <div className="text-center py-8 text-white/40 text-sm">No active sessions. Authenticate to generate tokens.</div>
              ) : (
                activeTokens.map((token) => (
                  <div key={token.id} className="bg-black/60 border border-white/5 rounded-lg p-4 font-mono text-xs">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-purple-400 font-bold">{token.type} • {token.algorithm}</span>
                      <span className="text-green-400">VALID</span>
                    </div>
                    <div className="text-white/60 truncate mb-1">
                      <span className="text-white/40">SIG:</span> {token.signature.substring(0, 40)}...
                    </div>
                    <div className="flex justify-between text-white/40">
                      <span>Issued: {token.issuedAt.toLocaleTimeString()}</span>
                      <span>Expires: {token.expiresAt.toLocaleTimeString()}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

// Simple Badge component for internal use
const Badge: React.FC<{ children: React.ReactNode; variant?: "default" | "success" | "warning" | "error" | "info" }> = ({ children, variant = "default" }) => {
  const variants = {
    default: "bg-white/10 text-white/70 border-white/20",
    success: "bg-green-500/20 text-green-400 border-green-500/30",
    warning: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    error: "bg-red-500/20 text-red-400 border-red-500/30",
    info: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
  };
  return (
    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${variants[variant]}`}>
      {children}
    </span>
  );
};