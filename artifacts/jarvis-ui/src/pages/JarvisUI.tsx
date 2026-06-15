// JARVIS V5.0 GOD PROTOCOL - ULTIMATE EDITION
import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Brain, Shield, Activity, MessageSquare, Terminal,
  Mic, Zap, Cpu, Network, Lock,
  AlertTriangle, CheckCircle, Clock, TrendingUp,
  BarChart3, Settings, Server, Wifi,
  Power, RefreshCw, Download, Upload,
  Bell, FileText, Folder, HardDrive,
  X, Menu,
  LayoutDashboard, 
  Send,
  Key, Fingerprint,
  Bluetooth, Monitor,
  Smartphone, 
  Cloud, 
  Play, Pause, 
  Heart, Star, Trophy, Award, Target,
  AtSign, Phone, Mail, MapPin, ExternalLink,
  Copy,  Save, FolderOpen, File,
  Layers, Box, Package,  Grid3X3,
  List,  CheckSquare,
  Sun, Moon,  Wind,
  Flame,  Timer,
  AlarmClock, 
  BellRing,
  MessageCircle, 
  Scale,
  ArrowUp, ArrowDown, ArrowLeft, ArrowRight,
  RotateCw, RotateCcw, 
  ZoomIn, ZoomOut, 
  Locate, MapPin as MapPinIcon,
  Building, Building2, 
  Atom,
  Kanban,
  ShieldAlert,
  Skull,
  AlertOctagon,
  FoldHorizontal,
  SquareCode,
  Database,
  Globe,
  Unlock,
  XCircle,
  TrendingDown,
  PieChart,
  LineChart,
  Users,
  Filter,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  MoreVertical,
  MoreHorizontal,
  Calendar,
  MemoryStick,
  Thermometer,
  Radio,
  Signal,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  Home,
  GitBranch,
  GitCommit,
  GitPullRequest,
  Command,
  Code,
  Code2,
  Braces,
  EyeOff,
  Scan,
  QrCode,
  Tablet,
  Laptop,
  CloudOff,
  CloudDownload,
  CloudUpload,
  StopCircle,
  SkipForward,
  SkipBack,
  Repeat,
  Shuffle,
  Flag,
  Bookmark,
  Tag,
  Hash,
  Unlink,
  Clipboard,
  Scissors,
  File as FileIcon,
  FileCode,
  Columns,
  Rows,
  Table,
  ListOrdered,
  Square,
  Circle,
  Triangle,
  Hexagon,
  Octagon,
  CloudRain,
  CloudSnow,
  CloudLightning,
  Droplets,
  Snowflake,
  Umbrella,
  Compass,
  Map,
  Rocket,
  Plane,
  Train,
  Bus,
  Car,
  Dumbbell,
  Wrench,
  Hammer,
  Sliders,
  SlidersHorizontal,
  ToggleLeft,
  ToggleRight,
  Trash,
  Trash2,
  Archive,
  Inbox,
  ArrowUpLeft,
  ArrowUpRight,
  ArrowDownLeft,
  ArrowDownRight,
  ArrowUpDown,
  ArrowLeftRight,
  CornerUpLeft,
  CornerUpRight,
  FlipHorizontal,
  FlipVertical,
  Maximize,
  Minimize,
  Eye,
  Crosshair,
  Crop,
  Hospital,
  School,
  Leaf,
  Sprout,
  Apple,
  Wheat,
} from "lucide-react";
import { useStore, type Message } from "../store";
import AdvancedSettings from "../components/AdvancedSettings";
import Scene3D from "../components/Scene3D";
import VoiceWaveform from "../components/VoiceWaveform";
import TradingDashboard from "../components/TradingDashboard";
import SwarmNetwork from "../components/SwarmNetwork";
import BlockchainIdentityPanel from "../components/BlockchainIdentity";
import LogViewer from "../components/LogViewer";
import TaskManager from "../components/TaskManager";
import SecurityDashboard from "../components/SecurityDashboard";
import MemoryPalace from "../components/MemoryPalace";
import CouncilOfThree from "../components/CouncilOfThree";
import VoiceInterface from "../components/VoiceInterface";
import TerminalEmulator from "../components/TerminalEmulator";
import FileManager from "../components/FileManager";
import NetworkMonitor from "../components/NetworkMonitor";
import QuantumInterface from "../components/QuantumInterface";
import IoTDeviceControl from "../components/IoTDeviceControl";
import BiometricAuth from "../components/BiometricAuth";
import KnowledgeGraph from "../components/KnowledgeGraph";
import CircadianSync from "../components/CircadianSync";
import PanicRoom from "../components/PanicRoom";
import DeadMansSwitch from "../components/DeadMansSwitch";

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

interface SystemMetrics {
  cpuUsage: number;
  cpuTemperature: number;
  memoryUsage: number;
  memoryAvailable: number;
  diskUsage: number;
  diskAvailable: number;
  networkUpload: number;
  networkDownload: number;
  gpuUsage: number;
  gpuTemperature: number;
  gpuMemory: number;
  processes: number;
  threads: number;
  uptime: number;
  loadAverage: [number, number, number];
}

interface Notification {
  id: string;
  type: "INFO" | "SUCCESS" | "WARNING" | "ERROR";
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  duration?: number;
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

const formatTimestamp = (date: Date): string => {
  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
};

const generateId = (): string => {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
};

// ============================================================================
// CUSTOM HOOKS
// ============================================================================

const useSystemMetrics = () => {
  const [metrics, setMetrics] = useState<SystemMetrics>({
    cpuUsage: 0,
    cpuTemperature: 0,
    memoryUsage: 0,
    memoryAvailable: 0,
    diskUsage: 0,
    diskAvailable: 0,
    networkUpload: 0,
    networkDownload: 0,
    gpuUsage: 0,
    gpuTemperature: 0,
    gpuMemory: 0,
    processes: 0,
    threads: 0,
    uptime: 0,
    loadAverage: [0, 0, 0],
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics({
        cpuUsage: Math.random() * 100,
        cpuTemperature: 40 + Math.random() * 40,
        memoryUsage: 30 + Math.random() * 50,
        memoryAvailable: 16 - Math.random() * 8,
        diskUsage: 40 + Math.random() * 30,
        diskAvailable: 500 - Math.random() * 200,
        networkUpload: Math.random() * 1000,
        networkDownload: Math.random() * 5000,
        gpuUsage: Math.random() * 80,
        gpuTemperature: 50 + Math.random() * 30,
        gpuMemory: 8 + Math.random() * 8,
        processes: 150 + Math.floor(Math.random() * 100),
        threads: 1500 + Math.floor(Math.random() * 500),
        uptime: performance.now() / 1000,
        loadAverage: [
          Math.random() * 4,
          Math.random() * 4,
          Math.random() * 4,
        ],
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return metrics;
};

const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = useCallback((notification: Omit<Notification, "id" | "timestamp" | "read">) => {
    const newNotification: Notification = {
      ...notification,
      id: generateId(),
      timestamp: new Date(),
      read: false,
    };
    setNotifications((prev) => [...prev, newNotification]);

    if (notification.duration) {
      setTimeout(() => {
        removeNotification(newNotification.id);
      }, notification.duration);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  return {
    notifications,
    addNotification,
    removeNotification,
  };
};

// ============================================================================
// UI COMPONENTS
// ============================================================================

const Card: React.FC<{
  children: React.ReactNode;
  className?: string;
  glow?: "cyan" | "purple" | "green" | "red" | "orange" | "none";
  size?: "sm" | "md" | "lg" | "xl";
  padding?: "none" | "sm" | "md" | "lg";
  hover?: boolean;
  onClick?: () => void;
}> = ({ children, className = "", glow = "none", size = "md", padding = "md", hover = false, onClick }) => {
  const glowColors = {
    cyan: "shadow-[0_0_30px_rgba(6,182,212,0.3)] border-cyan-500/30",
    purple: "shadow-[0_0_30px_rgba(168,85,247,0.3)] border-purple-500/30",
    green: "shadow-[0_0_30px_rgba(34,197,94,0.3)] border-green-500/30",
    red: "shadow-[0_0_30px_rgba(239,68,68,0.3)] border-red-500/30",
    orange: "shadow-[0_0_30px_rgba(249,115,22,0.3)] border-orange-500/30",
    none: "",
  };

  const sizes = {
    sm: "rounded-lg",
    md: "rounded-xl",
    lg: "rounded-2xl",
    xl: "rounded-3xl",
  };

  const paddings = {
    none: "",
    sm: "p-3",
    md: "p-6",
    lg: "p-8",
  };

  return (
    <motion.div
      className={`bg-black/40 backdrop-blur-xl border ${glowColors[glow]} ${sizes[size]} ${paddings[padding]} ${hover ? "cursor-pointer transition-all duration-300 hover:scale-105" : ""} ${className}`}
      onClick={onClick}
      whileHover={hover ? { scale: 1.02 } : {}}
      whileTap={onClick ? { scale: 0.98 } : {}}
    >
      {children}
    </motion.div>
  );
};

const Button: React.FC<{
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  className?: string;
}> = ({ children, variant = "primary", size = "md", onClick, disabled = false, loading = false, icon, className = "" }) => {
  const variants = {
    primary: "bg-gradient-to-r from-cyan-600 to-blue-600 text-white hover:from-cyan-500 hover:to-blue-500 shadow-[0_0_20px_rgba(6,182,212,0.4)]",
    secondary: "bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-500 hover:to-pink-500 shadow-[0_0_20px_rgba(168,85,247,0.4)]",
    outline: "border-2 border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10",
    ghost: "text-white/70 hover:text-white hover:bg-white/5",
    danger: "bg-gradient-to-r from-red-600 to-orange-600 text-white hover:from-red-500 hover:to-orange-500 shadow-[0_0_20px_rgba(239,68,68,0.4)]",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-6 py-2.5 text-sm",
    lg: "px-8 py-3 text-base",
  };

  return (
    <motion.button
      className={`${variants[variant]} ${sizes[size]} rounded-lg font-semibold transition-all duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      onClick={onClick}
      disabled={disabled || loading}
      whileHover={!disabled ? { scale: 1.05 } : {}}
      whileTap={!disabled ? { scale: 0.95 } : {}}
    >
      {loading && <RefreshCw className="w-4 h-4 animate-spin" />}
      {icon && !loading && icon}
      {children}
    </motion.button>
  );
};

const ProgressBar: React.FC<{
  value: number;
  max?: number;
  color?: "cyan" | "purple" | "green" | "red" | "orange";
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  animated?: boolean;
  className?: string;
}> = ({ value, max = 100, color = "cyan", size = "md", showLabel = true, animated = true, className = "" }) => {
  const percentage = Math.min((value / max) * 100, 100);
  
  const colors = {
    cyan: "from-cyan-500 to-blue-500",
    purple: "from-purple-500 to-pink-500",
    green: "from-green-500 to-emerald-500",
    red: "from-red-500 to-orange-500",
    orange: "from-orange-500 to-yellow-500",
  };

  const heights = {
    sm: "h-1",
    md: "h-2",
    lg: "h-3",
  };

  return (
    <div className={`w-full ${className}`}>
      <div className={`bg-black/50 rounded-full overflow-hidden ${heights[size]}`}>
        <motion.div
          className={`h-full bg-gradient-to-r ${colors[color]} ${animated ? "animate-pulse" : ""}`}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>
      {showLabel && (
        <div className="flex justify-between mt-1 text-xs text-white/60">
          <span>{value.toFixed(1)}%</span>
          <span>{max}%</span>
        </div>
      )}
    </div>
  );
};

const Badge: React.FC<{
  children: React.ReactNode;
  variant?: "default" | "success" | "warning" | "error" | "info";
  size?: "sm" | "md";
  pulse?: boolean;
}> = ({ children, variant = "default", size = "md", pulse = false }) => {
  const variants = {
    default: "bg-white/10 text-white/70 border-white/20",
    success: "bg-green-500/20 text-green-400 border-green-500/30",
    warning: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    error: "bg-red-500/20 text-red-400 border-red-500/30",
    info: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
  };

  const sizes = {
    sm: "px-2 py-0.5 text-[10px]",
    md: "px-3 py-1 text-xs",
  };

  return (
    <span className={`${variants[variant]} ${sizes[size]} rounded-full border font-semibold inline-flex items-center gap-1 ${pulse ? "animate-pulse" : ""}`}>
      {children}
    </span>
  );
};

// ============================================================================
// MAIN PAGE COMPONENT
// ============================================================================

export default function JarvisUI() {
  const [activeView, setActiveView] = useState<string>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  const metrics = useSystemMetrics();
  const notificationSystem = useNotifications();
  const { messages, addMessage } = useStore();
  
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<WebSocket | null>(null);
  
  useEffect(() => {
    // Attempt WebSocket connection — gracefully handle failure
    try {
      const wsUrl = (import.meta.env.VITE_WS_URL as string) || `ws://${window.location.host}/ws`;
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;
      
      ws.onopen = () => {
        notificationSystem.addNotification({
          type: "SUCCESS",
          title: "Backend Connected",
          message: "Successfully connected to JARVIS backend server",
          duration: 3000,
        });
      };
      
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === "response") {
            addMessage({
              id: generateId(),
              role: "jarvis",
              content: data.text,
              timestamp: new Date(),
            });
          }
        } catch {}
      };

      ws.onerror = () => {
        // Silent — backend may not be running
      };
      
      return () => ws.close();
    } catch {
      // WebSocket not available
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);
  
  const handleSendMessage = useCallback((text: string) => {
    if (!text.trim()) return;
    
    addMessage({
      id: generateId(),
      role: "user",
      content: text,
      timestamp: new Date(),
    });
    
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: "command", text }));
    }
  }, [addMessage]);

  const [chatInput, setChatInput] = useState("");

  const renderDashboard = () => (
    <div className="grid grid-cols-12 gap-6 h-full overflow-y-auto">
      <div className="col-span-12 lg:col-span-8 space-y-6">
        <Card glow="cyan" size="lg">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-cyan-400" />
              System Overview
            </h3>
            <Badge variant="success" pulse>ONLINE</Badge>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-black/30 rounded-lg p-4">
              <div className="text-xs text-white/60 mb-2">CPU Usage</div>
              <div className="text-2xl font-bold text-cyan-400">{metrics.cpuUsage.toFixed(1)}%</div>
              <ProgressBar value={metrics.cpuUsage} color="cyan" size="sm" showLabel={false} className="mt-2" />
            </div>
            <div className="bg-black/30 rounded-lg p-4">
              <div className="text-xs text-white/60 mb-2">Memory</div>
              <div className="text-2xl font-bold text-purple-400">{metrics.memoryUsage.toFixed(1)}%</div>
              <ProgressBar value={metrics.memoryUsage} color="purple" size="sm" showLabel={false} className="mt-2" />
            </div>
            <div className="bg-black/30 rounded-lg p-4">
              <div className="text-xs text-white/60 mb-2">GPU</div>
              <div className="text-2xl font-bold text-green-400">{metrics.gpuUsage.toFixed(1)}%</div>
              <ProgressBar value={metrics.gpuUsage} color="green" size="sm" showLabel={false} className="mt-2" />
            </div>
            <div className="bg-black/30 rounded-lg p-4">
              <div className="text-xs text-white/60 mb-2">Network</div>
              <div className="text-2xl font-bold text-orange-400">
                {(metrics.networkDownload / 1000).toFixed(1)} MB/s
              </div>
              <div className="text-xs text-white/40 mt-1">↓ Download</div>
            </div>
          </div>
        </Card>
        
        <Card glow="purple" size="lg" className="flex flex-col h-[500px]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-purple-400" />
              Neural Interface
            </h3>
            <div className="flex gap-2">
              <Badge variant="info">JARVIS v5.0</Badge>
              <Badge variant="success">Active</Badge>
            </div>
          </div>
          
          <div ref={chatContainerRef} className="flex-1 overflow-y-auto space-y-4 mb-4">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-white/40">
                <Brain className="w-16 h-16 mb-4 opacity-50" />
                <p className="text-sm">Initialize conversation with JARVIS</p>
              </div>
            ) : (
              messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[80%] p-4 rounded-xl ${
                    msg.role === "user" 
                      ? "bg-purple-600/20 border border-purple-500/30" 
                      : "bg-cyan-600/20 border border-cyan-500/30"
                  }`}>
                    <div className="text-xs text-white/60 mb-1">
                      {msg.role === "user" ? "Architect" : "JARVIS"} • {formatTimestamp(new Date(msg.timestamp))}
                    </div>
                    <div className="text-sm text-white">{msg.content}</div>
                  </div>
                </div>
              ))
            )}
          </div>
          
          <div className="flex gap-2">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Enter command..."
              className="flex-1 bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-white/40 focus:outline-none focus:border-purple-500/50"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSendMessage(chatInput);
                  setChatInput("");
                }
              }}
            />
            <Button onClick={() => { handleSendMessage(chatInput); setChatInput(""); }}>
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </Card>
      </div>
      
      <div className="col-span-12 lg:col-span-4 space-y-6">
        <Card glow="red" size="md">
          <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <Shield className="w-4 h-4 text-red-400" />
            Security Status
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-white/60">Threat Level</span>
              <Badge variant="success">LOW</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-white/60">Firewall</span>
              <Badge variant="success">ACTIVE</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-white/60">Encryption</span>
              <Badge variant="success">AES-256</Badge>
            </div>
          </div>
        </Card>
        
        <Card glow="green" size="md">
          <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <Clock className="w-4 h-4 text-green-400" />
            Active Tasks
          </h3>
          <div className="space-y-2">
            <div className="bg-black/30 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-white">Memory Optimization</span>
                <span className="text-xs text-green-400">78%</span>
              </div>
              <ProgressBar value={78} color="green" size="sm" showLabel={false} />
            </div>
            <div className="bg-black/30 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-white">Network Scan</span>
                <span className="text-xs text-cyan-400">45%</span>
              </div>
              <ProgressBar value={45} color="cyan" size="sm" showLabel={false} />
            </div>
          </div>
        </Card>
        
        <Card glow="orange" size="md">
          <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <Zap className="w-4 h-4 text-orange-400" />
            Quick Actions
          </h3>
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" size="sm" className="w-full">
              <RefreshCw className="w-3 h-3" />
              Restart
            </Button>
            <Button variant="outline" size="sm" className="w-full">
              <Power className="w-3 h-3" />
              Shutdown
            </Button>
            <Button variant="outline" size="sm" className="w-full">
              <Lock className="w-3 h-3" />
              Lock
            </Button>
            <Button variant="outline" size="sm" className="w-full">
              <Settings className="w-3 h-3" />
              Config
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
  
  const renderSettings = () => (
    <div className="max-w-4xl mx-auto">
      <Card glow="purple" size="xl" padding="lg">
        <h2 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
          <Settings className="w-6 h-6 text-purple-400" />
          System Configuration
        </h2>
        
        <div className="space-y-8">
          <section>
            <h3 className="text-lg font-semibold text-white mb-4">Appearance</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-black/30 rounded-lg p-4">
                <label className="text-sm text-white/60 mb-2 block">Theme</label>
                <select className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-white">
                  <option>Dark</option>
                  <option>Light</option>
                  <option>Auto</option>
                </select>
              </div>
              <div className="bg-black/30 rounded-lg p-4">
                <label className="text-sm text-white/60 mb-2 block">Color Scheme</label>
                <select className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-white">
                  <option>Cyan</option>
                  <option>Purple</option>
                  <option>Green</option>
                  <option>Orange</option>
                </select>
              </div>
            </div>
          </section>
          
          <section>
            <h3 className="text-lg font-semibold text-white mb-4">AI Configuration</h3>
            <div className="space-y-4">
              <div className="bg-black/30 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm text-white">Model Temperature</label>
                  <span className="text-sm text-purple-400">0.7</span>
                </div>
                <input type="range" min="0" max="2" step="0.1" defaultValue="0.7" className="w-full" />
              </div>
              <div className="bg-black/30 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm text-white">Max Tokens</label>
                  <span className="text-sm text-purple-400">4096</span>
                </div>
                <input type="range" min="256" max="8192" step="256" defaultValue="4096" className="w-full" />
              </div>
            </div>
          </section>
          
          <section>
            <h3 className="text-lg font-semibold text-white mb-4">Security</h3>
            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-white/20" />
                <span className="text-sm text-white">Enable Biometric Authentication</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-white/20" />
                <span className="text-sm text-white">Encrypt All Communications</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded border-white/20" />
                <span className="text-sm text-white">Enable Panic Room Mode</span>
              </label>
            </div>
          </section>
        </div>
        
        <div className="flex justify-end gap-4 mt-8">
          <Button variant="ghost">Reset to Defaults</Button>
          <Button variant="primary">Save Changes</Button>
        </div>
      </Card>
    </div>
  );

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "chat", label: "Neural Chat", icon: MessageSquare },
    { id: "trading", label: "Trading", icon: BarChart3 },
    { id: "swarm", label: "Swarm Network", icon: Network },
    { id: "blockchain", label: "Blockchain", icon: Shield },
    { id: "settings", label: "Settings", icon: Settings },
    { id: "logs", label: "Log Viewer", icon: FileText },
    { id: "tasks", label: "Tasks", icon: Kanban },
    { id: "security", label: "Security", icon: ShieldAlert },
    { id: "memory", label: "Memory Palace", icon: Brain },
    { id: "council", label: "Council Debate", icon: Scale },
    { id: "voice", label: "Voice Interface", icon: Mic },
    { id: "terminal", label: "Terminal", icon: Terminal },
    { id: "files", label: "File Manager", icon: Folder },
    { id: "network", label: "Network Monitor", icon: Network },
    { id: "quantum", label: "Quantum Core", icon: Atom },
    { id: "iot", label: "IoT Devices", icon: Smartphone },
    { id: "biometric", label: "Biometric Auth", icon: Fingerprint },
    { id: "knowledge", label: "Knowledge Graph", icon: Network },
    { id: "circadian", label: "Circadian Sync", icon: Sun },
    { id: "panic", label: "Panic Room", icon: AlertOctagon },
    { id: "deadman", label: "Dead Man's Switch", icon: Skull },
  ];

  return (
    <div className="min-h-screen bg-black text-white font-mono overflow-hidden relative">
      <Scene3D />
      
      <header className="relative z-10 flex items-center justify-between px-6 py-4 border-b border-white/10 bg-black/40 backdrop-blur-xl">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-white/5 rounded-lg transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            >
              <Brain className="w-8 h-8 text-purple-500" />
            </motion.div>
            <div>
              <h1 className="text-xl font-black tracking-[0.3em] text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">
                J.A.R.V.I.S
              </h1>
              <p className="text-[10px] text-white/40 tracking-[0.2em]">V5.0 GOD PROTOCOL</p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-black/40 rounded-lg border border-white/10">
            <Cpu className="w-4 h-4 text-cyan-400" />
            <span className="text-xs text-white/70">{metrics.cpuUsage.toFixed(0)}%</span>
          </div>
          <button className="relative p-2 hover:bg-white/5 rounded-lg transition-colors">
            <Bell className="w-5 h-5" />
            {notificationSystem.notifications.length > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            )}
          </button>
        </div>
      </header>
      
      <div className="relative z-10 flex h-[calc(100vh-73px)]">
        <AnimatePresence>
          {sidebarOpen && (
            <motion.aside
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 280, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="border-r border-white/10 bg-black/40 backdrop-blur-xl overflow-hidden overflow-y-auto flex-shrink-0"
            >
              <nav className="p-4 space-y-1">
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveView(item.id)}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all ${
                      activeView === item.id
                        ? "bg-purple-600/20 border border-purple-500/30 text-purple-400"
                        : "text-white/60 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <item.icon className="w-4 h-4 flex-shrink-0" />
                    <span className="text-sm font-medium">{item.label}</span>
                  </button>
                ))}
              </nav>
            </motion.aside>
          )}
        </AnimatePresence>
        
        <main className="flex-1 p-6 overflow-auto">
          {activeView === "dashboard" && renderDashboard()}
          {activeView === "chat" && renderDashboard()}
          {activeView === "settings" && renderSettings()}
          {activeView === "trading" && <TradingDashboard />}
          {activeView === "swarm" && <SwarmNetwork />}
          {activeView === "blockchain" && <BlockchainIdentityPanel />}
          {activeView === "logs" && <LogViewer />}
          {activeView === "tasks" && <TaskManager />}
          {activeView === "security" && <SecurityDashboard />}
          {activeView === "memory" && <MemoryPalace />}
          {activeView === "council" && <CouncilOfThree />}
          {activeView === "voice" && <VoiceInterface />}
          {activeView === "terminal" && <TerminalEmulator />}
          {activeView === "files" && <FileManager />}
          {activeView === "network" && <NetworkMonitor />}
          {activeView === "quantum" && <QuantumInterface />}
          {activeView === "iot" && <IoTDeviceControl />}
          {activeView === "biometric" && <BiometricAuth />}
          {activeView === "knowledge" && <KnowledgeGraph />}
          {activeView === "circadian" && <CircadianSync />}
          {activeView === "panic" && <PanicRoom />}
          {activeView === "deadman" && <DeadMansSwitch />}
        </main>
      </div>
      
      <div className="fixed bottom-4 right-4 z-50 space-y-2">
        <AnimatePresence>
          {notificationSystem.notifications.map((notification) => (
            <motion.div
              key={notification.id}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 100 }}
              className={`p-4 rounded-lg border backdrop-blur-xl max-w-sm ${
                notification.type === "SUCCESS" ? "bg-green-600/20 border-green-500/30" :
                notification.type === "ERROR" ? "bg-red-600/20 border-red-500/30" :
                notification.type === "WARNING" ? "bg-yellow-600/20 border-yellow-500/30" :
                "bg-cyan-600/20 border-cyan-500/30"
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-white">{notification.title}</h4>
                  <p className="text-xs text-white/70 mt-1">{notification.message}</p>
                </div>
                <button
                  onClick={() => notificationSystem.removeNotification(notification.id)}
                  className="text-white/60 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
