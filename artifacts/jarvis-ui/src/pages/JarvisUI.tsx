// JARVIS V5.0 GOD PROTOCOL - ULTIMATE EDITION
import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useStore, type Message } from "../store";
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
  Sparkles,
} from "lucide-react";
import { THEMES, applyTheme, type ThemeId } from "../theme";
import InitializeSystem from "../components/InitializeSystem";
import XTerminal from "../components/XTerminal";
import AudioSync from "../components/AudioSync";
import OllamaChat from "../components/OllamaChat";
import VoiceAudioPage from "../components/VoiceAudioPage";
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
import { EVOLUTION_NAV, EVOLUTION_COMPONENTS } from "../evolution/registry";

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
  type: "INFO" | "SUCCESS" | "WARNING" | "ERROR" | "MODEL_UPDATE";
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
    setNotifications((prev) => prev.filter((n) => n.id!== id));
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
  glow?: "accent" | "cyan" | "purple" | "green" | "red" | "orange" | "none";
  size?: "sm" | "md" | "lg" | "xl";
  padding?: "none" | "sm" | "md" | "lg";
  hover?: boolean;
  onClick?: () => void;
}> = ({ children, className = "", glow = "none", size = "md", padding = "md", hover = false, onClick }) => {
  const sizes = {
    sm: "rounded-xl",
    md: "rounded-2xl",
    lg: "rounded-2xl",
    xl: "rounded-3xl",
  };

  const paddings = {
    none: "",
    sm: "p-3",
    md: "p-6",
    lg: "p-8",
  };

  // All glow variants use theme CSS vars — no hardcoded purple/cyan
  const glowStyle: React.CSSProperties = glow === "none"? {} : {
    borderColor: glow === "red"   ? "rgba(239,68,68,0.35)"
               : glow === "green"? "rgba(34,197,94,0.35)"
               : glow === "orange"? "rgba(249,115,22,0.35)"
               : "color-mix(in srgb, var(--accent-primary) 38%, transparent)",
    boxShadow: glow === "red"   ? "0 0 28px rgba(239,68,68,0.25)"
             : glow === "green"? "0 0 28px rgba(34,197,94,0.25)"
             : glow === "orange"? "0 0 28px rgba(249,115,22,0.25)"
             : "var(--glow-primary)",
  };

  return (
    <motion.div
      className={`glass-card border ${sizes[size]} ${paddings[padding]} ${hover? "cursor-pointer transition-all duration-300" : ""} ${className}`}
      style={glowStyle}
      onClick={onClick}
      whileHover={hover? { scale: 1.02 } : {}}
      whileTap={onClick? { scale: 0.98 } : {}}
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
      whileHover={!disabled? { scale: 1.05 } : {}}
      whileTap={!disabled? { scale: 0.95 } : {}}
    >
      {loading && <RefreshCw className="w-4 h-4 animate-spin" />}
      {icon &&!loading && icon}
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
    red: "from-destructive to-orange-500",
    orange: "from-orange-500 to-yellow-500",
  };

  const heights = {
    sm: "h-1",
    md: "h-2",
    lg: "h-3",
  };

  return (
    <div className={`w-full ${className}`}>
      <div className="bg-black/50 rounded-full overflow-hidden ${heights[size]}">
        <motion.div
          className={`h-full bg-gradient-to-r ${colors[color]} ${animated? "animate-pulse" : ""}`}
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
    <span className={`${variants[variant]} ${sizes[size]} rounded-full border font-semibold inline-flex items-center gap-1 ${pulse? "animate-pulse" : ""}`}>
      {children}
    </span>
  );
};

// ============================================================================
// MAIN PAGE COMPONENT
// ============================================================================

export default function JarvisUI() {
  const {
    initializePersistence,
    persistenceInitialized,
    activePanel,
    setActivePanel,
    activeWorkspaceId,
    workspaces,
    folders,
    createProjectFolder,
    renameProjectFolder,
    archiveProjectFolder,
    setTheme
  } = useStore();

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [themePanelOpen, setThemePanelOpen] = useState(false);
  const [folderEditMode, setFolderEditMode] = useState<{ id: string; name: string } | null>(null);
  const themePanelRef = useRef<HTMLDivElement>(null);

  const metrics = useSystemMetrics();
  const notificationSystem = useNotifications();
  
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 5;
  const folderNameInputRef = useRef<HTMLInputElement>(null);

  // Initialize persistence layer
  useEffect(() => {
    initializePersistence();

    // Listen for configuration updates
    const handleConfigUpdate = () => {
      notificationSystem.addNotification({
        type: "MODEL_UPDATE",
        title: "Model Configuration Updated",
        message: "Model assignments have been updated",
        duration: 3000,
      });
      // Optionally refresh data or reconnect WebSocket
      reconnectWebSocket();
    };

    window.addEventListener('configUpdated', handleConfigUpdate);

    return () => {
      window.removeEventListener('configUpdated', handleConfigUpdate);
    };
  }, [initializePersistence, notificationSystem, reconnectWebSocket]);

  
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
          } else if (data.type === "config_updated") {
            // Configuration was updated, refresh model assignments
            notificationSystem.addNotification({
              type: "INFO",
              title: "Configuration Updated",
              message: "Model assignments have been updated",
              duration: 3000,
            });
            // Optionally refresh the UI or reconnect to get updated state
            // For now, we'll just notify the user
          }
        } catch {}
      };

      ws.onerror = () => {
        // Silent — backend may not be running
      };

      ws.onclose = () => {
        // Handle WebSocket close and attempt to reconnect
        notificationSystem.addNotification({
          type: "WARNING",
          title: "Connection Lost",
          message: "Disconnected from backend, attempting to reconnect...",
          duration: 3000,
        });

        // Attempt to reconnect
        const attemptReconnect = () => {
          if (reconnectAttemptsRef.current < maxReconnectAttempts) {
            reconnectAttemptsRef.current++;
            setTimeout(() => {
              // Try to reconnect
              try {
                const wsUrl = (import.meta.env.VITE_WS_URL as string) || `ws://${window.location.host}/ws`;
                const newWs = new WebSocket(wsUrl);
                wsRef.current = newWs;

                newWs.onopen = () => {
                  reconnectAttemptsRef.current = 0;
                  notificationSystem.addNotification({
                    type: "SUCCESS",
                    title: "Reconnected",
                    message: "Successfully reconnected to JARVIS backend",
                    duration: 3000,
                  });
                };

                newWs.onmessage = (event) => {
                  try {
                    const data = JSON.parse(event.data);
                    if (data.type === "response") {
                      addMessage({
                        id: generateId(),
                        role: "jarvis",
                        content: data.text,
                        timestamp: new Date(),
                      });
                    } else if (data.type === "config_updated") {
                      // Configuration was updated, refresh model assignments
                      notificationSystem.addNotification({
                        type: "INFO",
                        title: "Configuration Updated",
                        message: "Model assignments have been updated",
                        duration: 3000,
                      });
                    }
                  } catch {}
                };

                newWs.onerror = () => {
                  attemptReconnect();
                };

                newWs.onclose = () => {
                  attemptReconnect();
                };
              } catch {
                attemptReconnect();
              }
            }, 2000 * reconnectAttemptsRef.current); // Exponential backoff
          } else {
            notificationSystem.addNotification({
              type: "ERROR",
              title: "Connection Failed",
              message: "Could not reconnect to backend after multiple attempts",
              duration: 5000,
            });
          }
        };

        attemptReconnect();
      };

      return () => {
        if (wsRef.current) {
          wsRef.current.close();
          wsRef.current = null;
        }
      };
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
    } else {
      // Try to reconnect if WebSocket is not open
      notificationSystem.addNotification({
        type: "WARNING",
        title: "Connection Issue",
        message: "WebSocket not connected, attempting to reconnect...",
        duration: 3000,
      });
      reconnectWebSocket();
    }
  }, [addMessage]);

  const reconnectWebSocket = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    try {
      const wsUrl = (import.meta.env.VITE_WS_URL as string) || `ws://${window.location.host}/ws`;
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;
      reconnectAttemptsRef.current = 0;

      ws.onopen = () => {
        notificationSystem.addNotification({
          type: "SUCCESS",
          title: "Reconnected",
          message: "Successfully reconnected to JARVIS backend",
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
          } else if (data.type === "config_updated") {
            // Configuration was updated, refresh model assignments
            notificationSystem.addNotification({
              type: "INFO",
              title: "Configuration Updated",
              message: "Model assignments have been updated",
              duration: 3000,
            });
          }
        } catch {}
      };

      ws.onerror = () => {
        notificationSystem.addNotification({
          type: "ERROR",
          title: "Connection Error",
          message: "WebSocket connection error",
          duration: 3000,
        });
      };

      ws.onclose = () => {
        notificationSystem.addNotification({
          type: "WARNING",
          title: "Connection Closed",
          message: "WebSocket connection closed",
          duration: 3000,
        });
      };

    } catch {
      notificationSystem.addNotification({
        type: "ERROR",
        title: "Connection Failed",
        message: "Could not establish WebSocket connection",
        duration: 3000,
      });
    }
  }, [addMessage, notificationSystem]);

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
            <div className="bg-card/30 rounded-lg p-4">
              <div className="text-xs text-white/60 mb-2">CPU Usage</div>
              <div className="text-2xl font-bold text-cyan-400">{metrics.cpuUsage.toFixed(1)}%</div>
              <ProgressBar value={metrics.cpuUsage} color="cyan" size="sm" showLabel={false} className="mt-2" />
            </div>
            <div className="bg-card/30 rounded-lg p-4">
              <div className="text-xs text-white/60 mb-2">Memory</div>
              <div className="text-2xl font-bold text-purple-400">{metrics.memoryUsage.toFixed(1)}%</div>
              <ProgressBar value={metrics.memoryUsage} color="purple" size="sm" showLabel={false} className="mt-2" />
            </div>
            <div className="bg-card/30 rounded-lg p-4">
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
            <div className="flex items-center gap-2">
              <Badge variant="info">JARVIS v5.0</Badge>
              <Badge variant="success">Active</Badge>
            </div>
          </div>
          
          <div ref={chatContainerRef} className="flex-1 overflow-y-auto space-y-4 mb-4">
            {messages.length === 0? (
              <div className="h-full flex flex-col items-center justify-center text-white/40">
                <Brain className="w-16 h-16 mb-4 opacity-50" />
                <p className="text-sm">Initialize conversation with JARVIS</p>
              </div>
            ) : (
              messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.role === "user"? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[80%] p-4 rounded-xl ${
                    msg.role === "user" 
                     ? "bg-purple-600/20 border border-purple-500/30" 
                      : "bg-cyan-600/20 border border-cyan-500/30"
                  }`}>
                    <div className="text-xs text-white/60 mb-1">
                      {msg.role === "user"? "Architect" : "JARVIS"} • {formatTimestamp(new Date(msg.timestamp))}
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
              className="flex-1 bg-card/40 border border-border rounded-lg px-4 py-2 text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary/50"
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
            <div className="bg-card/30 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-white">Memory Optimization</span>
                <span className="text-xs text-green-400">78%</span>
              </div>
              <ProgressBar value={78} color="green" size="sm" showLabel={false} />
            </div>
            <div className="bg-card/30 rounded-lg p-3">
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
  
  const [ollamaUrlVal, setOllamaUrlVal] = useState(
    () => localStorage.getItem("jarvis_ollama_url")?? "http://localhost:11434"
  );
  const saveOllamaUrl = useCallback(() => {
    localStorage.setItem("jarvis_ollama_url", ollamaUrlVal.replace(/\/+$/, ""));
    notificationSystem.addNotification({ type: "SUCCESS", title: "Saved", message: "Ollama URL saved — switch to JARVIS AI to connect", duration: 3000 });
  }, [ollamaUrlVal, notificationSystem]);

  const renderSettings = () => {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <Card glow="purple" size="xl" padding="lg">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
            <Brain className="w-5 h-5 text-purple-400" />
            AI — Ollama Connection
          </h2>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-white/70 font-mono mb-2 block">Ollama URL (your laptop&apos;s IP)</label>
              <div className="flex gap-2">
                <input
                  value={ollamaUrlVal}
                  onChange={e => setOllamaUrlVal(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && saveOllamaUrl()}
                  placeholder="http://192.168.1.x:11434"
                  className="flex-1 bg-black/50 border border-white/10 focus:border-purple-500/50 rounded-lg px-3 py-2 text-white font-mono text-sm outline-none transition-colors"
                />
                <Button variant="secondary" onClick={saveOllamaUrl}>Save</Button>
              </div>
              <div className="mt-3 space-y-2 text-[11px] font-mono">
                <p className="text-white/50 mb-1">PowerShell (Windows):</p>
                <code className="block bg-black/60 border border-white/10 rounded-lg px-3 py-2 text-green-400 select-all">$env:OLLAMA_HOST="0.0.0.0"; ollama serve</code>
                <p className="text-white/50 mb-1 mt-2">Then find your LAN IP:</p>
                <code className="block bg-black/60 border border-white/10 rounded-lg px-3 py-2 text-cyan-400 select-all">ipconfig</code>
                <p className="text-white/30 mt-1">Look for <span className="text-white/50">IPv4 Address</span> under your Wi-Fi adapter. Enter it above as <span className="text-cyan-400">http://192.168.x.x:11434</span></p>
              </div>
            </div>
          </div>
        </Card>

        <Card glow="cyan" size="xl" padding="lg">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
            <Sliders className="w-5 h-5 text-cyan-400" />
            Theme
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
            {(Object.values(THEMES) as typeof THEMES[keyof typeof THEMES][]).map(t => {
              const palettes: Record<string, { bg: string; bar: string; dots: string[] }> = {
                cyberpunk: {
                  bg: "#040607",
                  bar: "linear-gradient(90deg,#BF40FA,#4928C2)",
                  dots: ["#BF40FA","#4928C2","#E3D9FC","#5B2A62","#040607"],
                },
                night: {
                  bg: "#071018",
                  bar: "linear-gradient(90deg,#38506A,#7991A8)",
                  dots: ["#071018","#1C2B38","#38506A","#446983","#7991A8"],
                },
                morning: {
                  bg: "#0b1e33",
                  bar: "linear-gradient(90deg,#024683,#338FBA,#A0C8CE)",
                  dots: ["#024683","#338FBA","#A0C8CE","#436677","#D2E5DB"],
                },
                winter: {
                  bg: "#0e1e30",
                  bar: "linear-gradient(90deg,#152f57,#cadbe5)",
                  dots: ["#152f57","#2a4876","#9aaab7","#cadbe5","#ecf1f7"],
                },
                desert: {
                  bg: "#130a04",
                  bar: "linear-gradient(90deg,#8C3B1A,#C07850,#F0DEB4)",
                  dots: ["#8C3B1A","#C07850","#A87848","#F0DEB4","#F5EDD0"],
                },
              };
              const p = palettes[t.id];
              const isActive = theme === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setTheme(t.id as ThemeId)}
                  className="p-3 rounded-2xl border backdrop-blur-xl transition-all w-48"
                  style={{
                    background: p.bg,
                    borderColor: isActive? t.vars["--accent-primary"] : "rgba(255,255,255,0.10)",
                    boxShadow: isActive? `0 0 20px ${t.vars["--accent-primary"]}55, inset 0 0 20px ${t.vars["--accent-primary"]}08` : "none",
                    transform: isActive? "scale(1.03)" : "scale(1)",
                  }}
                >
                  {/* Colour bar */}
                  <div className="w-full h-1.5 rounded-full mb-3" style={{ background: p.bar }} />
                  {/* Palette dots */}
                  <div className="flex gap-1 mb-2.5">
                    {p.dots.map(c => (
                      <div key={c} className="w-3 h-3 rounded-full border border-white/10" style={{ background: c }} />
                    ))}
                  </div>
                  <div className="text-[11px] font-mono font-bold text-white/90">{t.name}</div>
                  <div className="text-[9px] text-white/30 mt-0.5 leading-tight">{t.description}</div>
                  {isActive && (
                    <div className="absolute top-2 right-2 w-4 h-4 rounded-full flex items-center justify-center" style={{ background: t.vars["--accent-primary"] }}>
                      <CheckCircle className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </Card>
      </div>
    );
  };

  // Group folders by type for sidebar organization
  const folderGroups = useMemo(() => {
    const groups: Record<string, ProjectFolder[]> = {
      ai: [],
      data: [],
      sys: [],
      workspace: []
    };

    Object.values(folders).forEach(folder => {
      if (!folder.archived) {
        if (folder.type === 'chat' || folder.type === 'quantum') {
          groups.ai.push(folder);
        } else if (folder.type === 'trading' || folder.type === 'swarm' || folder.type === 'blockchain') {
          groups.data.push(folder);
        } else if (folder.type === 'security' || folder.type === 'workspace') {
          groups.sys.push(folder);
        }
      }
    });

    // Sort folders by order
    Object.keys(groups).forEach(group => {
      groups[group].sort((a, b) => a.order - b.order);
    });

    return groups;
  }, [folders]);

  const navItems = [
    { id: "dashboard",   label: "Dashboard",       icon: LayoutDashboard, group: "core" },
    { id: "initialize",  label: "Boot Sequence",    icon: Power,           group: "core" },

    // AI Section
    ...folderGroups.ai.map(folder => ({
      id: folder.id,
      label: folder.name,
      icon: getFolderIcon(folder.type),
      group: "ai",
      isFolder: true,
      type: folder.type
    })),
    { id: "chat",        label: "JARVIS AI",        icon: Brain,           group: "ai"   },
    { id: "terminal",    label: "Terminal",         icon: SquareCode,      group: "ai"   },
    { id: "voice",       label: "Voice & Audio",    icon: Mic,             group: "ai"   },

    // Data Section
    ...folderGroups.data.map(folder => ({
      id: folder.id,
      label: folder.name,
      icon: getFolderIcon(folder.type),
      group: "data",
      isFolder: true,
      type: folder.type
    })),
    { id: "trading",     label: "Trading",          icon: BarChart3,       group: "data" },
    { id: "swarm",       label: "Swarm Network",    icon: Network,         group: "data" },
    { id: "blockchain",  label: "Blockchain",       icon: Shield,          group: "data" },
    { id: "knowledge",   label: "Knowledge Graph",  icon: Database,        group: "data" },

    // System Section
    ...folderGroups.sys.map(folder => ({
      id: folder.id,
      label: folder.name,
      icon: getFolderIcon(folder.type),
      group: "sys",
      isFolder: true,
      type: folder.type
    })),
    { id: "security",    label: "Security",         icon: ShieldAlert,     group: "sys"  },
    { id: "files",       label: "File Manager",     icon: Folder,          group: "sys"  },
    { id: "iot",         label: "IoT Devices",      icon: Smartphone,      group: "sys"  },
    { id: "settings",    label: "Settings",         icon: Settings,        group: "sys"  },

    ...EVOLUTION_NAV.map((e) => ({
      id: e.id,
      label: e.label,
      icon: Sparkles,
      group: e.group,
    })),
  ];

  function getFolderIcon(type: ProjectType): React.ComponentType<{className?: string}> {
    const icons = {
      chat: MessageSquare,
      trading: BarChart3,
      swarm: Network,
      blockchain: Shield,
      quantum: Atom,
      security: ShieldAlert,
      workspace: Folder
    };
    return icons[type] || Folder;
  }

  const notifyConfigUpdated = () => {
    // Notify via WebSocket if available
    if (window.WebSocket) {
      try {
        const wsUrl = (import.meta.env.VITE_WS_URL as string) || `ws://${window.location.host}/ws`;
        const ws = new WebSocket(wsUrl);

        ws.onopen = () => {
          ws.send(JSON.stringify({
            type: "config_updated",
            timestamp: new Date().toISOString()
          }));
          ws.close();
        };

        ws.onerror = () => {
          // Fallback: dispatch custom event
          window.dispatchEvent(new CustomEvent('configUpdated'));
        };
      } catch {
        // Fallback: dispatch custom event
        window.dispatchEvent(new CustomEvent('configUpdated'));
      }
    } else {
      // Fallback: dispatch custom event
      window.dispatchEvent(new CustomEvent('configUpdated'));
    }
  };

  return (
    <div className="jarvis-root min-h-screen font-mono overflow-hidden relative">
      {!persistenceInitialized ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xl">
          <div className="text-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="mb-4"
            >
              <Brain className="w-12 h-12 text-purple-500 mx-auto" />
            </motion.div>
            <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">
              INITIALIZING MEMORY LAYER...
            </h2>
            <p className="text-xs text-white/40 mt-2">Loading client-side persistence engine</p>
          </div>
        </div>
      ) : (
        <>
          <Scene3D />

          <header className="jarvis-header relative z-50 flex items-center justify-between px-6 py-4">
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
          {/* System Status Badge */}
          <motion.div
            className={`hidden sm:flex items-center gap-2 px-3 py-1.5 bg-black/40 rounded-full border text-[10px] font-mono font-bold tracking-widest cursor-pointer transition-all ${
              systemStatus === "ONLINE"
               ? "border-emerald-500/50 text-emerald-400 bg-emerald-950/40"
                : systemStatus === "BOOTING"
               ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/50"
                : "bg-white/15 text-white/30 bg-black/30"
            }`}
            style={systemStatus === "OFFLINE"? { borderColor: "rgba(255,255,255,0.12)" } : {}}
            onClick={() => setActiveView("initialize")}
            animate={systemStatus === "ONLINE"? { boxShadow: ["0 0 0px rgba(52,211,153,0)", "0 0 12px rgba(52,211,153,0.4)", "0 0 0px rgba(52,211,153,0)"] } : {}}
            transition={{ repeat: Infinity, duration: 3 }}
          >
            <div className={`w-1.5 h-1.5 rounded-full ${
              systemStatus === "ONLINE"? "bg-emerald-400" : systemStatus === "BOOTING"? "bg-yellow-400 animate-pulse" : "bg-white/20"
            }`} />
            {systemStatus === "OFFLINE"? "BOOT REQUIRED" : systemStatus === "BOOTING"? "BOOTING..." : "GOD PROTOCOL ONLINE"}
          </motion.div>

          {/* Ollama Status Badge */}
          <motion.div
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-mono font-bold tracking-widest cursor-pointer transition-all"
            style={ollamaOnline === true
             ? { borderColor: "color-mix(in srgb, var(--accent-primary) 45%, transparent)", color: "var(--accent-primary)", background: "color-mix(in srgb, var(--accent-primary) 12%, transparent)" }
              : { borderColor: "rgba(239,68,68,0.35)", color: "rgba(239,68,68,0.8)", background: "rgba(239,68,68,0.08)" }
            }
            onClick={() => setActiveView("chat")}
            animate={ollamaOnline === true? { boxShadow: ["0 0 0px transparent", `0 0 10px color-mix(in srgb, var(--accent-primary) 40%, transparent)`, "0 0 0px transparent"] } : {}}
            transition={{ repeat: Infinity, duration: 4 }}
            title={ollamaOnline === true? `Ollama online · ${ollamaModelCount} model${ollamaModelCount!== 1? "s" : ""}` : "Ollama offline — click to set up"}
          >
            <div className={`w-1.5 h-1.5 rounded-full ${ollamaOnline === true? "animate-pulse" : ""}`}
              style={{ background: ollamaOnline === true? "var(--accent-primary)" : "rgba(239,68,68,0.8)" }}
            />
            {ollamaOnline === true? `AI · ${ollamaModelCount}M` : "AI OFFLINE"}
          </motion.div>

          {/* Reconnect Button */}
          <button
            onClick={reconnectWebSocket}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-mono font-bold tracking-widest cursor-pointer transition-all border-cyan-500/30 text-cyan-100 bg-cyan-500/10 hover:bg-cyan-500/20"
            title="Reconnect WebSocket"
          >
            <RefreshCw className="w-3 h-3" />
            RECONNECT
          </button>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-black/40 rounded-lg border border-white/10">
            <Cpu className="w-4 h-4 text-cyan-400" />
            <span className="text-xs text-white/70">{metrics.cpuUsage.toFixed(0)}%</span>
          </div>

          {/* Theme Switcher */}
          <div className="relative" ref={themePanelRef}>
            <button
              onClick={() => setThemePanelOpen(p =>!p)}
              className="flex items-center gap-2 px-3 py-1.5 bg-black/40 rounded-lg border border-white/10 hover:border-purple-500/30 transition-all text-xs text-white/70 hover:text-purple-400"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span className="hidden md:inline font-mono text-[10px] tracking-wider">{THEMES[theme].name.toUpperCase()}</span>
            </button>
            <AnimatePresence>
              {themePanelOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.95 }}
                  className="absolute right-0 top-full mt-2 w-48 rounded-xl border border-white/15 bg-black/90 backdrop-blur-xl shadow-2xl z-50 overflow-hidden"
                >
                  <div className="px-3 py-2 border-b border-white/10">
                    <span className="text-[9px] font-mono text-white/40 tracking-widest">THEME MATRIX</span>
                  </div>
                  {(Object.values(THEMES) as typeof THEMES[keyof typeof THEMES][]).map(t => (
                    <button
                      key={t.id}
                      onClick={() => { setTheme(t.id as ThemeId); setThemePanelOpen(false); }}
                      className={`w-full flex items-center justify-between px-3 py-2.5 text-xs transition-all hover:bg-white/5 ${
                        theme === t.id? "text-purple-300 bg-purple-950/40" : "text-white/60"
                      }`}
                    >
                      <div>
                        <div className="font-mono font-semibold">{t.name}</div>
                        <div className="text-[9px] text-white/30 mt-0.5">{t.description}</div>
                      </div>
                      {theme === t.id && <CheckCircle className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" />}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
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
              animate={{ width: 260, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="jarvis-sidebar overflow-hidden overflow-y-auto flex-shrink-0"
            >
              <nav className="p-3 space-y-0.5">
                {navItems.map((item) => {
                  const isActive = activePanel === item.id;
                  return (
                    <div key={item.id} className="group">
                      <button
                        onClick={async () => {
                          if (item.isFolder) {
                            // For folders, set as active panel and load project data
                            setActivePanel(item.id);
                          } else {
                            setActivePanel(item.id);
                          }
                        }}
                        onDoubleClick={() => {
                          if (item.isFolder) {
                            setFolderEditMode({ id: item.id, name: item.label });
                          }
                        }}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-left ${
                          isActive
                           ? "nav-active"
                            : "text-white/50 hover:bg-white/5 hover:text-white/90"
                        }`}
                      >
                        <item.icon className="w-4 h-4 flex-shrink-0" />
                        {folderEditMode?.id === item.id ? (
                          <input
                            ref={folderNameInputRef}
                            value={folderEditMode.name}
                            onChange={(e) => setFolderEditMode({ ...folderEditMode, name: e.target.value })}
                            onBlur={async () => {
                              if (folderEditMode.name.trim() && folderEditMode.name !== item.label) {
                                await renameProjectFolder(folderEditMode.id, folderEditMode.name);
                              }
                              setFolderEditMode(null);
                            }}
                            onKeyDown={async (e) => {
                              if (e.key === 'Enter') {
                                if (folderEditMode.name.trim() && folderEditMode.name !== item.label) {
                                  await renameProjectFolder(folderEditMode.id, folderEditMode.name);
                                }
                                setFolderEditMode(null);
                              } else if (e.key === 'Escape') {
                                setFolderEditMode(null);
                              }
                            }}
                            className="text-sm font-medium bg-black/50 border border-white/20 rounded px-2 py-0.5 text-white flex-1 outline-none"
                          />
                        ) : (
                          <span className="text-sm font-medium flex-1">{item.label}</span>
                        )}
                        {item.isFolder && (
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setFolderEditMode({ id: item.id, name: item.label });
                              }}
                              className="p-0.5 hover:bg-white/10 rounded"
                              title="Rename folder"
                            >
                              <Edit2 className="w-3 h-3" />
                            </button>
                            <button
                              onClick={async (e) => {
                                e.stopPropagation();
                                await archiveProjectFolder(item.id);
                              }}
                              className="p-0.5 hover:bg-white/10 rounded"
                              title="Archive folder"
                            >
                              <Archive className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                      </button>
                    </div>
                  );
                })}

                {/* Add Folder Button */}
                <div className="px-3 py-2">
                  <button
                    onClick={async () => {
                      const newFolder = await createProjectFolder({
                        name: 'New Project',
                        type: 'workspace',
                        parentId: undefined
                      });
                      setActivePanel(newFolder.id);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-white/50 hover:bg-white/5 hover:text-white/90 transition-all text-sm"
                  >
                    <Plus className="w-4 h-4" />
                    <span>New Project</span>
                  </button>
                </div>

                {/* Workspace Switcher */}
                <div className="px-3 py-2 border-t border-white/10 mt-2">
                  <div className="text-xs text-white/30 mb-2 px-2">Workspaces</div>
                  {Object.values(workspaces).map(workspace => (
                    <button
                      key={workspace.id}
                      onClick={() => {
                        // switchWorkspace(workspace.id); // Uncomment when workspace switching is implemented
                      }}
                      className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-all ${
                        activeWorkspaceId === workspace.id
                          ? "bg-purple-600/20 text-purple-300 border border-purple-500/30"
                          : "text-white/50 hover:bg-white/5 hover:text-white/90"
                      }`}
                    >
                      <Monitor className="w-3.5 h-3.5" />
                      <span className="flex-1">{workspace.name}</span>
                      {activeWorkspaceId === workspace.id && (
                        <CheckCircle className="w-3.5 h-3.5 text-purple-400" />
                      )}
                    </button>
                  ))}
                  <button
                    onClick={async () => {
                      // const newWorkspace = await createWorkspace('New Workspace'); // Uncomment when workspace creation is implemented
                    }}
                    className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-white/50 hover:bg-white/5 hover:text-white/90 transition-all text-sm mt-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>New Workspace</span>
                  </button>
                </div>
              </nav>
            </motion.aside>
          )}
        </AnimatePresence>
        
        <main className="flex-1 overflow-auto" style={{ padding: activeView === "terminal"? 0 : "1.5rem" }}>
          {activeView === "dashboard" && renderDashboard()}
          {activeView === "settings" && renderSettings()}

          {activeView === "initialize" && (
            <div className="max-w-2xl mx-auto space-y-6 py-8">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-black tracking-[0.25em] text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400 mb-2">
                  SYSTEM BOOT SEQUENCE
                </h2>
                <p className="text-xs font-mono text-white/40 tracking-widest">GOD PROTOCOL v5.0 — ONE-CLICK INITIALIZE</p>
              </div>
              <Card glow="purple" size="xl" padding="lg">
                <InitializeSystem
                  onInitialized={() => setSystemStatus("ONLINE")}
                  onBootLog={() => { if (systemStatus === "OFFLINE") setSystemStatus("BOOTING"); }}
                />
              </Card>
            </div>
          )}

          {activeView === "chat" && (
            <div className="h-full flex flex-col" style={{ height: "calc(100vh - 73px - 3rem)" }}>
              <OllamaChat />
            </div>
          )}

          {activeView === "terminal" && (
            <div className="h-full flex flex-col" style={{ height: "calc(100vh - 73px)" }}>
              <TerminalEmulator />
            </div>
          )}

          {activeView === "voice" && (
            <VoiceAudioPage onAmplitudeChange={(amp) => setAudioAmplitude(amp)} />
          )}

          {activeView === "trading" && <TradingDashboard />}
          {activeView === "swarm" && <SwarmNetwork />}
          {activeView === "blockchain" && <BlockchainIdentityPanel />}
          {activeView === "security" && <SecurityDashboard />}
          {activeView === "files" && <FileManager />}
          {activeView === "iot" && <IoTDeviceControl />}
          {activeView === "knowledge" && <KnowledgeGraph />}
          {EVOLUTION_NAV.map((entry) => {
            if (activeView!== entry.id) return null;
            const Evolved = EVOLUTION_COMPONENTS[entry.componentExport];
            return Evolved? <Evolved key={entry.id} /> : null;
          })}
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
                notification.type === "SUCCESS"? "bg-green-600/20 border-green-500/30" :
                notification.type === "ERROR"? "bg-destructive/20 border-destructive/30" :
                notification.type === "WARNING"? "bg-yellow-600/20 border-yellow-500/30" :
                "bg-primary/20 border-primary/30"
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
        </>
      )}
    </div>
  );
}
