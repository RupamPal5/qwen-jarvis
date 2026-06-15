"use client";
import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText, Search, Filter, Download, Upload, Trash2,
  RefreshCw, Clock, AlertTriangle, AlertCircle, Info,
  CheckCircle, XCircle, Zap, Database, Server, Network,
  Terminal, Code, Braces, Activity, TrendingUp, TrendingDown,
  BarChart3, PieChart as PieChartIcon, LineChart as LineChartIcon,
  Calendar, Timer, Hash, Tag, Bookmark, Star,
  ChevronDown, ChevronRight, ChevronLeft, ChevronUp,
  Copy, Check, Eye, EyeOff, Maximize2, Minimize2,
  Play, Pause, SkipForward, SkipBack, RotateCcw,
  Layers, Box, Package, GitBranch, GitCommit,
  Cpu, MemoryStick, HardDrive, Wifi, WifiOff,
  Shield, Lock, Unlock, Key, Fingerprint,
  Bell, BellOff, Settings, MoreVertical, MoreHorizontal,
  ArrowUp, ArrowDown, ArrowLeft, ArrowRight,
  ZoomIn, ZoomOut, Focus, Target, Crosshair,
  Locate, MapPin, Globe, Satellite,
  Monitor,
  MessageSquare, Send, SendHorizontal,
  Users, User, UserCheck, UserX,
  Share2, Link as LinkIcon, Unlink,
  Save, FolderOpen, File, FileCode,
  Grid, Grid3X3, Columns, Rows,
  List, ListOrdered, CheckSquare,
  Square, Circle, Triangle,
  Sun, Moon, CloudRain, CloudSnow,
  Flame, Snowflake, Umbrella,
  Timer as TimerIcon, TimerOff, TimerReset, Stopwatch,
  Navigation, Navigation2, Compass,
  Map, MapPinned, Globe2, Earth,
  Rocket, Plane, Train, Bus, Car, Bike,
  Footprints, PersonStanding, Walking, Running,
  Swimming, Cycling, Dumbbell, Weight,
  Scale, Ruler, Hammer, Wrench, Screwdriver,
  Nut, Bolt, Tool, Tools, Settings2,
  Sliders, SlidersHorizontal, SlidersVertical,
  ToggleLeft, ToggleRight, Select, SelectAll,
  Deselect, ClearAll, Delete, Archive,
  ArchiveRestore, Inbox, Drafts,
  View, ViewOff, Show, Hide,
  SearchIcon, FilterIcon, Sort, SortAsc, SortDesc,
  RotateCw, Rotate3d,
  FlipHorizontal, FlipVertical,
  Expand, ExpandIcon, Collapse, CollapseIcon,
  Fullscreen, FullscreenOff, ExitFullscreen, EnterFullscreen,
  Brain, Shield as ShieldIcon, Lock as LockIcon,
  Terminal as TerminalIcon, Code as CodeIcon,
  BarChart3 as BarChartIcon,
} from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, AreaChart, Area, BarChart, Bar,
  PieChart, Pie, Cell, ComposedChart,
  ReferenceLine, Legend, RadialBarChart, RadialBar,
  ScatterChart, Scatter, ZAxis,
} from "recharts";

// ============================================================================
// TYPE DEFINITIONS — LOG DATA STRUCTURES
// ============================================================================

type LogLevel = "DEBUG" | "INFO" | "WARN" | "ERROR" | "CRITICAL";
type LogSource = "JARVIS_CORE" | "NEURAL_NET" | "MEMORY_DB" | "NETWORK" | "SECURITY" | "HARDWARE" | "BLOCKCHAIN" | "SWARM" | "UI_RENDERER" | "WEBSOCKET";
type LogStatus = "NEW" | "ACKNOWLEDGED" | "RESOLVED" | "IGNORED";

interface LogEntry {
  id: string;
  timestamp: Date;
  level: LogLevel;
  source: LogSource;
  message: string;
  metadata: Record<string, any>;
  stackTrace?: string;
  traceId?: string;
  spanId?: string;
  parentId?: string;
  duration?: number;
  tags: string[];
  bookmarked: boolean;
  status: LogStatus;
  correlationId?: string;
  userId?: string;
  sessionId?: string;
  requestId?: string;
  environment: "production" | "staging" | "development" | "test";
  region?: string;
  nodeId?: string;
  threadId?: string;
  processId?: number;
  hostname?: string;
  ipAddress?: string;
  userAgent?: string;
  geoLocation?: {
    country: string;
    city: string;
    latitude: number;
    longitude: number;
  };
}

interface LogFilter {
  levels: LogLevel[];
  sources: LogSource[];
  timeRange: {
    start: Date;
    end: Date;
  };
  searchQuery: string;
  regexMode: boolean;
  caseSensitive: boolean;
  tags: string[];
  status: LogStatus[];
  environments: string[];
  regions: string[];
  minDuration?: number;
  maxDuration?: number;
  correlationId?: string;
  traceId?: string;
  userId?: string;
  hasStackTrace?: boolean;
  bookmarkedOnly?: boolean;
}

interface LogStatistics {
  totalLogs: number;
  logsPerSecond: number;
  errorRate: number;
  warnRate: number;
  avgDuration: number;
  p50Duration: number;
  p95Duration: number;
  p99Duration: number;
  topSources: { source: string; count: number }[];
  topErrors: { message: string; count: number }[];
  levelDistribution: { level: string; count: number }[];
  hourlyDistribution: { hour: string; count: number }[];
  anomalies: number;
  uniqueUsers: number;
  uniqueSessions: number;
  uniqueCorrelations: number;
}

interface FilterPreset {
  id: string;
  name: string;
  filter: LogFilter;
  createdAt: Date;
  usageCount: number;
}

interface LogPattern {
  id: string;
  pattern: string;
  frequency: number;
  firstSeen: Date;
  lastSeen: Date;
  severity: LogLevel;
  sources: LogSource[];
}

interface LogCluster {
  id: string;
  representativeMessage: string;
  count: number;
  logs: LogEntry[];
  pattern: string;
  severity: LogLevel;
}

// ============================================================================
// UTILITY FUNCTIONS — LOG PROCESSING
// ============================================================================

const generateLogId = (): string => {
  return `log_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
};

const formatLogTimestamp = (date: Date): string => {
  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    fractionalSecondDigits: 3,
    hour12: false,
  });
};

const formatDuration = (ms: number): string => {
  if (ms < 1) return `${(ms * 1000).toFixed(0)}μs`;
  if (ms < 1000) return `${ms.toFixed(2)}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(2)}s`;
  return `${(ms / 60000).toFixed(2)}m`;
};

const getLevelColor = (level: LogLevel): string => {
  const colors: Record<LogLevel, string> = {
    DEBUG: "text-slate-400",
    INFO: "text-cyan-400",
    WARN: "text-yellow-400",
    ERROR: "text-orange-400",
    CRITICAL: "text-red-400",
  };
  return colors[level];
};

const getLevelBg = (level: LogLevel): string => {
  const colors: Record<LogLevel, string> = {
    DEBUG: "bg-slate-500/20 border-slate-500/50",
    INFO: "bg-cyan-500/20 border-cyan-500/50",
    WARN: "bg-yellow-500/20 border-yellow-500/50",
    ERROR: "bg-orange-500/20 border-orange-500/50",
    CRITICAL: "bg-red-500/20 border-red-500/50",
  };
  return colors[level];
};

const getSourceIcon = (source: LogSource): React.ReactNode => {
  const icons: Record<LogSource, React.ReactNode> = {
    JARVIS_CORE: <Brain size={12} />,
    NEURAL_NET: <Network size={12} />,
    MEMORY_DB: <Database size={12} />,
    NETWORK: <Wifi size={12} />,
    SECURITY: <Shield size={12} />,
    HARDWARE: <Cpu size={12} />,
    BLOCKCHAIN: <Key size={12} />,
    SWARM: <Satellite size={12} />,
    UI_RENDERER: <Monitor size={12} />,
    WEBSOCKET: <Zap size={12} />,
  };
  return icons[source];
};

const highlightText = (text: string, query: string, regex: boolean, caseSensitive: boolean): React.ReactNode => {
  if (!query) return text;
  
  try {
    const flags = caseSensitive ? "g" : "gi";
    const pattern = regex ? new RegExp(query, flags) : new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), flags);
    const parts = text.split(pattern);
    const matches = text.match(pattern) || [];
    
    return parts.reduce((acc: React.ReactNode[], part, i) => {
      acc.push(<span key={`part-${i}`}>{part}</span>);
      if (matches[i]) {
        acc.push(
          <mark key={`match-${i}`} className="bg-yellow-500/30 text-yellow-300 px-1 rounded">
            {matches[i]}
          </mark>
        );
      }
      return acc;
    }, []);
  } catch {
    return text;
  }
};

const calculatePercentile = (values: number[], percentile: number): number => {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.ceil((percentile / 100) * sorted.length) - 1;
  return sorted[Math.max(0, index)];
};

const detectAnomalies = (logs: LogEntry[]): number => {
  const errorLogs = logs.filter(l => l.level === "ERROR" || l.level === "CRITICAL");
  const recentErrors = errorLogs.filter(l => Date.now() - l.timestamp.getTime() < 300000);
  return recentErrors.length > 10 ? recentErrors.length : 0;
};

// ============================================================================
// DATA SIMULATION — LOG GENERATOR
// ============================================================================

const LOG_MESSAGES: Record<LogLevel, string[]> = {
  DEBUG: [
    "Cache hit for key: user_session_abc123",
    "Database query executed in 12ms",
    "WebSocket connection established",
    "Memory allocation: 256MB",
    "Thread pool size: 8",
    "Request headers parsed successfully",
    "Configuration loaded from /etc/jarvis/config.yml",
    "Garbage collection completed in 45ms",
    "Index rebuild started for collection: memories",
    "Background task scheduled: cleanup_old_sessions",
  ],
  INFO: [
    "User authentication successful: architect@stark.ind",
    "Model inference completed: qwen2.5:7b",
    "Memory vector stored: 1536 dimensions",
    "Network packet processed: 1.2KB",
    "Blockchain transaction confirmed: 0x742d...0bEb",
    "Swarm node joined cluster: node-07",
    "UI component rendered: TradingDashboard",
    "API request processed: GET /api/v1/metrics",
    "Scheduled task executed: backup_memory_db",
    "Health check passed: all systems operational",
  ],
  WARN: [
    "High memory usage detected: 87%",
    "Slow query detected: 2.3s execution time",
    "Rate limit approaching: 450/500 requests",
    "Deprecated API endpoint called: /v0/legacy",
    "Certificate expiring in 7 days",
    "Disk space low: 15% remaining",
    "Connection pool exhausted, queuing requests",
    "Model loading took longer than expected: 4.5s",
    "Unusual traffic pattern detected from IP 192.168.1.105",
    "Cache miss rate increased to 35%",
  ],
  ERROR: [
    "Failed to connect to database: Connection refused",
    "Model inference failed: Out of memory",
    "Authentication failed: Invalid token",
    "File not found: /data/memories/2026-06-08.json",
    "Network timeout after 30s",
    "Blockchain transaction failed: Insufficient funds",
    "Swarm node disconnected: node-03",
    "UI render error: Component not found",
    "API rate limit exceeded: 500/500",
    "Memory corruption detected in sector 7G",
  ],
  CRITICAL: [
    "System overload: CPU at 98%",
    "Security breach detected: Unauthorized access attempt",
    "Data corruption in primary database",
    "Complete network failure: All connections lost",
    "Panic room activated: Emergency shutdown initiated",
    "Hardware failure: GPU temperature at 105°C",
    "Blockchain fork detected: Chain reorganization required",
    "Swarm cluster split-brain: Consensus lost",
    "Critical memory leak: 12GB allocated",
    "Catastrophic failure: System unrecoverable",
  ],
};

const LOG_SOURCES: LogSource[] = ["JARVIS_CORE", "NEURAL_NET", "MEMORY_DB", "NETWORK", "SECURITY", "HARDWARE", "BLOCKCHAIN", "SWARM", "UI_RENDERER", "WEBSOCKET"];
const LOG_TAGS = ["performance", "security", "ai", "blockchain", "network", "database", "ui", "swarm", "hardware", "critical-path"];
const REGIONS = ["us-east-1", "eu-west-1", "ap-southeast-1", "us-west-2"];
const HOSTNAMES = ["jarvis-primary", "jarvis-secondary", "jarvis-edge-01", "jarvis-quantum-01"];

const generateMockLogs = (count: number): LogEntry[] => {
  const logs: LogEntry[] = [];
  const now = Date.now();
  
  for (let i = 0; i < count; i++) {
    const levelRoll = Math.random();
    let level: LogLevel;
    if (levelRoll < 0.4) level = "DEBUG";
    else if (levelRoll < 0.7) level = "INFO";
    else if (levelRoll < 0.85) level = "WARN";
    else if (levelRoll < 0.97) level = "ERROR";
    else level = "CRITICAL";
    
    const source = LOG_SOURCES[Math.floor(Math.random() * LOG_SOURCES.length)];
    const messages = LOG_MESSAGES[level];
    const message = messages[Math.floor(Math.random() * messages.length)];
    const timestamp = new Date(now - Math.random() * 86400000);
    const duration = level === "ERROR" || level === "CRITICAL" ? Math.random() * 5000 + 1000 : Math.random() * 500;
    const hasStackTrace = level === "ERROR" || level === "CRITICAL";
    
    logs.push({
      id: generateLogId(),
      timestamp,
      level,
      source,
      message,
      metadata: {
        cpu: Math.random() * 100,
        memory: Math.random() * 100,
        disk: Math.random() * 100,
        network: Math.random() * 1000,
      },
      stackTrace: hasStackTrace ? `Error: ${message}\n    at processRequest (/app/core/handler.ts:142:15)\n    at async handleConnection (/app/network/ws.ts:89:7)\n    at async Server.<anonymous> (/app/server.ts:45:11)` : undefined,
      traceId: `trace_${Math.random().toString(36).substring(2, 15)}`,
      spanId: `span_${Math.random().toString(36).substring(2, 11)}`,
      duration,
      tags: LOG_TAGS.sort(() => Math.random() - 0.5).slice(0, Math.floor(Math.random() * 3) + 1),
      bookmarked: Math.random() > 0.95,
      status: Math.random() > 0.7 ? "ACKNOWLEDGED" : Math.random() > 0.9 ? "RESOLVED" : "NEW",
      correlationId: `corr_${Math.random().toString(36).substring(2, 15)}`,
      userId: Math.random() > 0.5 ? "architect@stark.ind" : undefined,
      sessionId: `sess_${Math.random().toString(36).substring(2, 15)}`,
      requestId: `req_${Math.random().toString(36).substring(2, 15)}`,
      environment: Math.random() > 0.8 ? "staging" : "production",
      region: REGIONS[Math.floor(Math.random() * REGIONS.length)],
      nodeId: `node-${String(Math.floor(Math.random() * 12) + 1).padStart(2, "0")}`,
      threadId: `thread-${Math.floor(Math.random() * 8) + 1}`,
      processId: Math.floor(Math.random() * 10000) + 1000,
      hostname: HOSTNAMES[Math.floor(Math.random() * HOSTNAMES.length)],
      ipAddress: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
      userAgent: "JARVIS-Client/5.0",
    });
  }
  
  return logs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
};

const generateFilterPresets = (): FilterPreset[] => [
  {
    id: "preset-1",
    name: "Critical Errors Only",
    filter: {
      levels: ["CRITICAL", "ERROR"],
      sources: [],
      timeRange: { start: new Date(Date.now() - 3600000), end: new Date() },
      searchQuery: "",
      regexMode: false,
      caseSensitive: false,
      tags: [],
      status: [],
      environments: [],
      regions: [],
    },
    createdAt: new Date(Date.now() - 86400000),
    usageCount: 47,
  },
  {
    id: "preset-2",
    name: "Security Events",
    filter: {
      levels: ["WARN", "ERROR", "CRITICAL"],
      sources: ["SECURITY"],
      timeRange: { start: new Date(Date.now() - 86400000 * 7), end: new Date() },
      searchQuery: "",
      regexMode: false,
      caseSensitive: false,
      tags: ["security"],
      status: [],
      environments: [],
      regions: [],
    },
    createdAt: new Date(Date.now() - 172800000),
    usageCount: 23,
  },
  {
    id: "preset-3",
    name: "Performance Issues",
    filter: {
      levels: ["WARN", "ERROR"],
      sources: [],
      timeRange: { start: new Date(Date.now() - 3600000), end: new Date() },
      searchQuery: "",
      regexMode: false,
      caseSensitive: false,
      tags: ["performance"],
      status: [],
      environments: [],
      regions: [],
      minDuration: 1000,
    },
    createdAt: new Date(Date.now() - 259200000),
    usageCount: 15,
  },
];

// ============================================================================
// SUB-COMPONENTS — MODULAR LOG VIEWER
// ============================================================================

// --- Log Level Badge Component ---
const LevelBadge: React.FC<{ level: LogLevel }> = ({ level }) => (
  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold border ${getLevelBg(level)} ${getLevelColor(level)}`}>
    {level === "DEBUG" && <Code size={10} />}
    {level === "INFO" && <Info size={10} />}
    {level === "WARN" && <AlertTriangle size={10} />}
    {level === "ERROR" && <XCircle size={10} />}
    {level === "CRITICAL" && <AlertCircle size={10} />}
    {level}
  </span>
);

// --- Single Log Entry Component ---
const LogEntryRow: React.FC<{
  log: LogEntry;
  searchQuery: string;
  regexMode: boolean;
  caseSensitive: boolean;
  onBookmark: (id: string) => void;
  onExpand: (id: string) => void;
  isExpanded: boolean;
}> = ({ log, searchQuery, regexMode, caseSensitive, onBookmark, onExpand, isExpanded }) => {
  const [copied, setCopied] = useState(false);

  const copyLog = () => {
    navigator.clipboard.writeText(JSON.stringify(log, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`border-b border-white/5 hover:bg-white/5 transition-all ${
        log.level === "CRITICAL" ? "bg-red-500/5" : log.level === "ERROR" ? "bg-orange-500/5" : ""
      }`}
    >
      <div className="flex items-start gap-3 p-3 cursor-pointer" onClick={() => onExpand(log.id)}>
        <div className="flex-shrink-0 mt-1">
          <LevelBadge level={log.level} />
        </div>
        
        <div className="flex-shrink-0 text-[10px] text-white/40 font-mono w-32">
          {formatLogTimestamp(log.timestamp)}
        </div>
        
        <div className="flex-shrink-0">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-purple-500/20 text-purple-400 text-[10px] font-bold border border-purple-500/50">
            {getSourceIcon(log.source)}
            {log.source}
          </span>
        </div>
        
        <div className="flex-1 text-xs text-white/80 font-mono">
          {highlightText(log.message, searchQuery, regexMode, caseSensitive)}
        </div>
        
        {log.duration && (
          <div className="flex-shrink-0 text-[10px] text-cyan-400 font-mono">
            {formatDuration(log.duration)}
          </div>
        )}
        
        <div className="flex-shrink-0 flex gap-1">
          <button
            onClick={(e) => { e.stopPropagation(); onBookmark(log.id); }}
            className={`p-1 rounded hover:bg-white/10 transition-colors ${log.bookmarked ? "text-yellow-400" : "text-white/40"}`}
          >
            <Bookmark size={12} fill={log.bookmarked ? "currentColor" : "none"} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); copyLog(); }}
            className="p-1 rounded hover:bg-white/10 text-white/40 transition-colors"
          >
            {copied ? <Check size={12} className="text-green-400" /> : <Copy size={12} />}
          </button>
        </div>
      </div>
      
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-white/5 bg-black/40"
          >
            <div className="p-4 space-y-3">
              {log.stackTrace && (
                <div>
                  <div className="text-[10px] text-white/40 mb-1">STACK TRACE</div>
                  <pre className="text-xs text-red-400 font-mono bg-black/60 p-3 rounded-lg overflow-x-auto">
                    {log.stackTrace}
                  </pre>
                </div>
              )}
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <div className="text-[10px] text-white/40">Trace ID</div>
                  <div className="text-xs text-cyan-400 font-mono">{log.traceId}</div>
                </div>
                <div>
                  <div className="text-[10px] text-white/40">Span ID</div>
                  <div className="text-xs text-cyan-400 font-mono">{log.spanId}</div>
                </div>
                <div>
                  <div className="text-[10px] text-white/40">Correlation ID</div>
                  <div className="text-xs text-purple-400 font-mono">{log.correlationId}</div>
                </div>
                <div>
                  <div className="text-[10px] text-white/40">Request ID</div>
                  <div className="text-xs text-purple-400 font-mono">{log.requestId}</div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <div className="text-[10px] text-white/40">Host</div>
                  <div className="text-xs text-white font-mono">{log.hostname}</div>
                </div>
                <div>
                  <div className="text-[10px] text-white/40">Region</div>
                  <div className="text-xs text-white font-mono">{log.region}</div>
                </div>
                <div>
                  <div className="text-[10px] text-white/40">Node</div>
                  <div className="text-xs text-white font-mono">{log.nodeId}</div>
                </div>
                <div>
                  <div className="text-[10px] text-white/40">Thread</div>
                  <div className="text-xs text-white font-mono">{log.threadId}</div>
                </div>
              </div>
              
              {log.tags.length > 0 && (
                <div>
                  <div className="text-[10px] text-white/40 mb-1">TAGS</div>
                  <div className="flex gap-1 flex-wrap">
                    {log.tags.map((tag) => (
                      <span key={tag} className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 text-[10px] border border-blue-500/50">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// --- Filter Bar Component ---
const FilterBar: React.FC<{
  filter: LogFilter;
  onChange: (filter: LogFilter) => void;
  presets: FilterPreset[];
  onLoadPreset: (preset: FilterPreset) => void;
  onSavePreset: () => void;
}> = ({ filter, onChange, presets, onLoadPreset, onSavePreset }) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  return (
    <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl p-4 space-y-3">
      <div className="flex gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <input
            type="text"
            value={filter.searchQuery}
            onChange={(e) => onChange({ ...filter, searchQuery: e.target.value })}
            placeholder="Search logs... (use /regex/ for regex)"
            className="w-full bg-black/50 border border-white/10 rounded-lg pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500/50"
          />
        </div>
        <button
          onClick={() => onChange({ ...filter, regexMode: !filter.regexMode })}
          className={`px-3 py-2 rounded-lg text-xs font-bold transition-all ${
            filter.regexMode ? "bg-purple-600 text-white" : "bg-white/5 text-white/60 hover:bg-white/10"
          }`}
        >
          REGEX
        </button>
        <button
          onClick={() => onChange({ ...filter, caseSensitive: !filter.caseSensitive })}
          className={`px-3 py-2 rounded-lg text-xs font-bold transition-all ${
            filter.caseSensitive ? "bg-purple-600 text-white" : "bg-white/5 text-white/60 hover:bg-white/10"
          }`}
        >
          Aa
        </button>
      </div>
      
      <div className="flex gap-2 flex-wrap">
        {(["DEBUG", "INFO", "WARN", "ERROR", "CRITICAL"] as LogLevel[]).map((level) => (
          <button
            key={level}
            onClick={() => {
              const levels = filter.levels.includes(level)
                ? filter.levels.filter(l => l !== level)
                : [...filter.levels, level];
              onChange({ ...filter, levels });
            }}
            className={`px-3 py-1 rounded-lg text-[10px] font-bold transition-all ${
              filter.levels.includes(level) ? getLevelBg(level) + " " + getLevelColor(level) : "bg-white/5 text-white/40"
            }`}
          >
            {level}
          </button>
        ))}
      </div>
      
      <button
        onClick={() => setShowAdvanced(!showAdvanced)}
        className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1"
      >
        <Sliders size={12} />
        Advanced Filters
        <ChevronDown size={12} className={`transition-transform ${showAdvanced ? "rotate-180" : ""}`} />
      </button>
      
      <AnimatePresence>
        {showAdvanced && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="space-y-3 overflow-hidden"
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <label className="text-[10px] text-white/40 mb-1 block">Min Duration (ms)</label>
                <input
                  type="number"
                  value={filter.minDuration || ""}
                  onChange={(e) => onChange({ ...filter, minDuration: e.target.value ? parseFloat(e.target.value) : undefined })}
                  className="w-full bg-black/50 border border-white/10 rounded px-2 py-1 text-xs text-white"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="text-[10px] text-white/40 mb-1 block">Max Duration (ms)</label>
                <input
                  type="number"
                  value={filter.maxDuration || ""}
                  onChange={(e) => onChange({ ...filter, maxDuration: e.target.value ? parseFloat(e.target.value) : undefined })}
                  className="w-full bg-black/50 border border-white/10 rounded px-2 py-1 text-xs text-white"
                  placeholder="∞"
                />
              </div>
              <div>
                <label className="text-[10px] text-white/40 mb-1 block">Trace ID</label>
                <input
                  type="text"
                  value={filter.traceId || ""}
                  onChange={(e) => onChange({ ...filter, traceId: e.target.value })}
                  className="w-full bg-black/50 border border-white/10 rounded px-2 py-1 text-xs text-white font-mono"
                  placeholder="trace_..."
                />
              </div>
              <div>
                <label className="text-[10px] text-white/40 mb-1 block">Correlation ID</label>
                <input
                  type="text"
                  value={filter.correlationId || ""}
                  onChange={(e) => onChange({ ...filter, correlationId: e.target.value })}
                  className="w-full bg-black/50 border border-white/10 rounded px-2 py-1 text-xs text-white font-mono"
                  placeholder="corr_..."
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => onChange({ ...filter, bookmarkedOnly: !filter.bookmarkedOnly })}
                className={`px-3 py-1 rounded text-[10px] font-bold transition-all ${
                  filter.bookmarkedOnly ? "bg-yellow-600 text-white" : "bg-white/5 text-white/60"
                }`}
              >
                <Bookmark size={10} className="inline mr-1" />
                Bookmarked Only
              </button>
              <button
                onClick={() => onChange({ ...filter, hasStackTrace: !filter.hasStackTrace })}
                className={`px-3 py-1 rounded text-[10px] font-bold transition-all ${
                  filter.hasStackTrace ? "bg-red-600 text-white" : "bg-white/5 text-white/60"
                }`}
              >
                Has Stack Trace
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {presets.length > 0 && (
        <div className="flex gap-2 flex-wrap pt-2 border-t border-white/10">
          <span className="text-[10px] text-white/40 self-center">Presets:</span>
          {presets.map((preset) => (
            <button
              key={preset.id}
              onClick={() => onLoadPreset(preset)}
              className="px-3 py-1 rounded bg-purple-500/20 text-purple-400 text-[10px] border border-purple-500/50 hover:bg-purple-500/30 transition-all"
            >
              {preset.name}
            </button>
          ))}
          <button
            onClick={onSavePreset}
            className="px-3 py-1 rounded bg-white/5 text-white/60 text-[10px] border border-white/20 hover:bg-white/10 transition-all"
          >
            <Save size={10} className="inline mr-1" />
            Save Current
          </button>
        </div>
      )}
    </div>
  );
};

// --- Statistics Panel Component ---
const StatisticsPanel: React.FC<{ stats: LogStatistics }> = ({ stats }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
      <div className="bg-black/40 border border-white/10 rounded-lg p-3">
        <div className="text-[10px] text-white/40 mb-1">TOTAL LOGS</div>
        <div className="text-lg font-bold text-white">{stats.totalLogs.toLocaleString()}</div>
      </div>
      <div className="bg-black/40 border border-white/10 rounded-lg p-3">
        <div className="text-[10px] text-white/40 mb-1">LOGS/SEC</div>
        <div className="text-lg font-bold text-cyan-400">{stats.logsPerSecond.toFixed(1)}</div>
      </div>
      <div className="bg-black/40 border border-white/10 rounded-lg p-3">
        <div className="text-[10px] text-white/40 mb-1">ERROR RATE</div>
        <div className="text-lg font-bold text-orange-400">{stats.errorRate.toFixed(2)}%</div>
      </div>
      <div className="bg-black/40 border border-white/10 rounded-lg p-3">
        <div className="text-[10px] text-white/40 mb-1">AVG DURATION</div>
        <div className="text-lg font-bold text-purple-400">{formatDuration(stats.avgDuration)}</div>
      </div>
      <div className="bg-black/40 border border-white/10 rounded-lg p-3">
        <div className="text-[10px] text-white/40 mb-1">P95 DURATION</div>
        <div className="text-lg font-bold text-yellow-400">{formatDuration(stats.p95Duration)}</div>
      </div>
      <div className="bg-black/40 border border-white/10 rounded-lg p-3">
        <div className="text-[10px] text-white/40 mb-1">ANOMALIES</div>
        <div className={`text-lg font-bold ${stats.anomalies > 0 ? "text-red-400" : "text-green-400"}`}>
          {stats.anomalies}
        </div>
      </div>
      <div className="bg-black/40 border border-white/10 rounded-lg p-3">
        <div className="text-[10px] text-white/40 mb-1">UNIQUE USERS</div>
        <div className="text-lg font-bold text-blue-400">{stats.uniqueUsers}</div>
      </div>
      <div className="bg-black/40 border border-white/10 rounded-lg p-3">
        <div className="text-[10px] text-white/40 mb-1">SESSIONS</div>
        <div className="text-lg font-bold text-green-400">{stats.uniqueSessions}</div>
      </div>
    </div>
  );
};

// --- Timeline Chart Component ---
const TimelineChart: React.FC<{ logs: LogEntry[] }> = ({ logs }) => {
  const chartData = useMemo(() => {
    const hourlyCounts: Record<string, number> = {};
    logs.forEach((log) => {
      const hour = log.timestamp.getHours();
      const key = `${hour}:00`;
      hourlyCounts[key] = (hourlyCounts[key] || 0) + 1;
    });
    return Object.entries(hourlyCounts)
      .sort(([a], [b]) => parseInt(a) - parseInt(b))
      .map(([hour, count]) => ({ hour, count }));
  }, [logs]);

  return (
    <div className="bg-black/40 border border-white/10 rounded-xl p-4">
      <div className="text-sm font-bold text-white mb-3">LOG VOLUME TIMELINE</div>
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis dataKey="hour" stroke="rgba(255,255,255,0.3)" tick={{ fontSize: 10 }} />
          <YAxis stroke="rgba(255,255,255,0.3)" tick={{ fontSize: 10 }} />
          <Tooltip
            contentStyle={{
              backgroundColor: "rgba(0,0,0,0.9)",
              border: "1px solid rgba(168,85,247,0.3)",
              borderRadius: "8px",
              color: "white",
            }}
          />
          <Area type="monotone" dataKey="count" stroke="#a855f7" fill="rgba(168,85,247,0.3)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

// --- Level Distribution Chart ---
const LevelDistributionChart: React.FC<{ logs: LogEntry[] }> = ({ logs }) => {
  const data = useMemo(() => {
    const counts: Record<LogLevel, number> = { DEBUG: 0, INFO: 0, WARN: 0, ERROR: 0, CRITICAL: 0 };
    logs.forEach((log) => {
      counts[log.level]++;
    });
    return Object.entries(counts).map(([level, count]) => ({ level, count }));
  }, [logs]);

  const COLORS = ["#64748b", "#06b6d4", "#eab308", "#f97316", "#ef4444"];

  return (
    <div className="bg-black/40 border border-white/10 rounded-xl p-4">
      <div className="text-sm font-bold text-white mb-3">LEVEL DISTRIBUTION</div>
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={2} dataKey="count">
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: "rgba(0,0,0,0.9)",
              border: "1px solid rgba(168,85,247,0.3)",
              borderRadius: "8px",
              color: "white",
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

// ============================================================================
// MAIN LOG VIEWER COMPONENT
// ============================================================================

export default function LogViewer() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<LogEntry[]>([]);
  const [filter, setFilter] = useState<LogFilter>({
    levels: ["DEBUG", "INFO", "WARN", "ERROR", "CRITICAL"],
    sources: [],
    timeRange: { start: new Date(Date.now() - 86400000), end: new Date() },
    searchQuery: "",
    regexMode: false,
    caseSensitive: false,
    tags: [],
    status: [],
    environments: [],
    regions: [],
  });
  const [presets, setPresets] = useState<FilterPreset[]>(generateFilterPresets());
  const [expandedLogs, setExpandedLogs] = useState<Set<string>>(new Set());
  const [isLive, setIsLive] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(5000);
  const [viewMode, setViewMode] = useState<"list" | "compact" | "detailed">("list");
  const [sortBy, setSortBy] = useState<"timestamp" | "level" | "duration">("timestamp");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [logsPerPage, setLogsPerPage] = useState(50);
  const [statistics, setStatistics] = useState<LogStatistics | null>(null);
  const [patterns, setPatterns] = useState<LogPattern[]>([]);
  const [clusters, setClusters] = useState<LogCluster[]>([]);
  const [showStats, setShowStats] = useState(true);
  const [showCharts, setShowCharts] = useState(true);
  const [selectedLog, setSelectedLog] = useState<LogEntry | null>(null);
  const [exportFormat, setExportFormat] = useState<"json" | "csv" | "txt">("json");
  const [isExporting, setIsExporting] = useState(false);

  // Initialize logs
  useEffect(() => {
    const mockLogs = generateMockLogs(500);
    setLogs(mockLogs);
  }, []);

  // Apply filters
  useEffect(() => {
    let filtered = logs.filter((log) => {
      if (filter.levels.length > 0 && !filter.levels.includes(log.level)) return false;
      if (filter.sources.length > 0 && !filter.sources.includes(log.source)) return false;
      if (filter.tags.length > 0 && !filter.tags.some(tag => log.tags.includes(tag))) return false;
      if (filter.status.length > 0 && !filter.status.includes(log.status)) return false;
      if (filter.environments.length > 0 && !filter.environments.includes(log.environment)) return false;
      if (filter.regions.length > 0 && !filter.regions.includes(log.region || "")) return false;
      if (filter.minDuration !== undefined && (log.duration || 0) < filter.minDuration) return false;
      if (filter.maxDuration !== undefined && (log.duration || 0) > filter.maxDuration) return false;
      if (filter.traceId && log.traceId !== filter.traceId) return false;
      if (filter.correlationId && log.correlationId !== filter.correlationId) return false;
      if (filter.bookmarkedOnly && !log.bookmarked) return false;
      if (filter.hasStackTrace && !log.stackTrace) return false;
      if (log.timestamp < filter.timeRange.start || log.timestamp > filter.timeRange.end) return false;
      
      if (filter.searchQuery) {
        try {
          const flags = filter.caseSensitive ? "g" : "gi";
          const pattern = filter.regexMode
            ? new RegExp(filter.searchQuery, flags)
            : new RegExp(filter.searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), flags);
          if (!pattern.test(log.message)) return false;
        } catch {
          return false;
        }
      }
      
      return true;
    });

    // Sort
    filtered.sort((a, b) => {
      let comparison = 0;
      if (sortBy === "timestamp") comparison = a.timestamp.getTime() - b.timestamp.getTime();
      else if (sortBy === "level") comparison = a.level.localeCompare(b.level);
      else if (sortBy === "duration") comparison = (a.duration || 0) - (b.duration || 0);
      return sortOrder === "asc" ? comparison : -comparison;
    });

    setFilteredLogs(filtered);
    setCurrentPage(1);

    // Calculate statistics
    const durations = filtered.map(l => l.duration || 0);
    const errorLogs = filtered.filter(l => l.level === "ERROR" || l.level === "CRITICAL");
    const warnLogs = filtered.filter(l => l.level === "WARN");
    
    const levelCounts: Record<LogLevel, number> = { DEBUG: 0, INFO: 0, WARN: 0, ERROR: 0, CRITICAL: 0 };
    filtered.forEach(l => levelCounts[l.level]++);
    
    const sourceCounts: Record<string, number> = {};
    filtered.forEach(l => { sourceCounts[l.source] = (sourceCounts[l.source] || 0) + 1; });
    
    const errorCounts: Record<string, number> = {};
    errorLogs.forEach(l => { errorCounts[l.message] = (errorCounts[l.message] || 0) + 1; });
    
    const hourlyCounts: Record<string, number> = {};
    filtered.forEach(l => {
      const hour = `${l.timestamp.getHours()}:00`;
      hourlyCounts[hour] = (hourlyCounts[hour] || 0) + 1;
    });

    setStatistics({
      totalLogs: filtered.length,
      logsPerSecond: filtered.length / 86400,
      errorRate: (errorLogs.length / filtered.length) * 100,
      warnRate: (warnLogs.length / filtered.length) * 100,
      avgDuration: durations.reduce((a, b) => a + b, 0) / durations.length,
      p50Duration: calculatePercentile(durations, 50),
      p95Duration: calculatePercentile(durations, 95),
      p99Duration: calculatePercentile(durations, 99),
      topSources: Object.entries(sourceCounts).sort(([,a], [,b]) => b - a).slice(0, 5).map(([source, count]) => ({ source, count })),
      topErrors: Object.entries(errorCounts).sort(([,a], [,b]) => b - a).slice(0, 5).map(([message, count]) => ({ message, count })),
      levelDistribution: Object.entries(levelCounts).map(([level, count]) => ({ level, count })),
      hourlyDistribution: Object.entries(hourlyCounts).sort(([a], [b]) => parseInt(a) - parseInt(b)).map(([hour, count]) => ({ hour, count })),
      anomalies: detectAnomalies(filtered),
      uniqueUsers: new Set(filtered.map(l => l.userId).filter(Boolean)).size,
      uniqueSessions: new Set(filtered.map(l => l.sessionId).filter(Boolean)).size,
      uniqueCorrelations: new Set(filtered.map(l => l.correlationId).filter(Boolean)).size,
    });
  }, [logs, filter, sortBy, sortOrder]);

  // Live log simulation
  useEffect(() => {
    if (!isLive) return;
    const interval = setInterval(() => {
      const newLog = generateMockLogs(1)[0];
      newLog.timestamp = new Date();
      setLogs(prev => [newLog, ...prev].slice(0, 1000));
    }, autoRefresh);
    return () => clearInterval(interval);
  }, [isLive, autoRefresh]);

  const handleBookmark = useCallback((id: string) => {
    setLogs(prev => prev.map(log => log.id === id ? { ...log, bookmarked: !log.bookmarked } : log));
  }, []);

  const handleExpand = useCallback((id: string) => {
    setExpandedLogs(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const handleLoadPreset = useCallback((preset: FilterPreset) => {
    setFilter(preset.filter);
    setPresets(prev => prev.map(p => p.id === preset.id ? { ...p, usageCount: p.usageCount + 1 } : p));
  }, []);

  const handleSavePreset = useCallback(() => {
    const name = prompt("Enter preset name:");
    if (name) {
      const newPreset: FilterPreset = {
        id: `preset-${Date.now()}`,
        name,
        filter,
        createdAt: new Date(),
        usageCount: 0,
      };
      setPresets(prev => [...prev, newPreset]);
    }
  }, [filter]);

  const handleExport = useCallback(() => {
    setIsExporting(true);
    setTimeout(() => {
      let content = "";
      if (exportFormat === "json") {
        content = JSON.stringify(filteredLogs, null, 2);
      } else if (exportFormat === "csv") {
        const headers = ["timestamp", "level", "source", "message", "duration", "traceId"];
        const rows = filteredLogs.map(l => [
          l.timestamp.toISOString(),
          l.level,
          l.source,
          `"${l.message.replace(/"/g, '""')}"`,
          l.duration || "",
          l.traceId || "",
        ]);
        content = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
      } else {
        content = filteredLogs.map(l => `[${formatLogTimestamp(l.timestamp)}] [${l.level}] [${l.source}] ${l.message}`).join("\n");
      }
      
      const blob = new Blob([content], { type: exportFormat === "json" ? "application/json" : "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `jarvis-logs-${Date.now()}.${exportFormat}`;
      a.click();
      URL.revokeObjectURL(url);
      setIsExporting(false);
    }, 1000);
  }, [filteredLogs, exportFormat]);

  const paginatedLogs = filteredLogs.slice((currentPage - 1) * logsPerPage, currentPage * logsPerPage);
  const totalPages = Math.ceil(filteredLogs.length / logsPerPage);

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-slate-900/80 to-black/80 border border-white/10 rounded-2xl p-6 backdrop-blur-xl"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <FileText className="w-8 h-8 text-cyan-400" />
            <div>
              <h2 className="text-2xl font-black text-white tracking-wider">LOG VIEWER</h2>
              <p className="text-xs text-white/60">Advanced Observability • Real-time Streaming • Pattern Detection</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setIsLive(!isLive)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                isLive ? "bg-green-500/20 text-green-400 border border-green-500/50" : "bg-red-500/20 text-red-400 border border-red-500/50"
              }`}
            >
              <div className={`w-2 h-2 rounded-full ${isLive ? "bg-green-400 animate-pulse" : "bg-red-400"}`} />
              {isLive ? "LIVE" : "PAUSED"}
            </button>
            <button
              onClick={handleExport}
              disabled={isExporting}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600/20 border border-purple-500/50 text-purple-400 rounded-lg text-xs font-bold hover:bg-purple-600/30 transition-all disabled:opacity-50"
            >
              {isExporting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              EXPORT
            </button>
          </div>
        </div>

        {statistics && <StatisticsPanel stats={statistics} />}
      </motion.div>

      {/* Filter Bar */}
      <FilterBar
        filter={filter}
        onChange={setFilter}
        presets={presets}
        onLoadPreset={handleLoadPreset}
        onSavePreset={handleSavePreset}
      />

      {/* Charts */}
      {showCharts && statistics && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <TimelineChart logs={filteredLogs} />
          <LevelDistributionChart logs={filteredLogs} />
        </div>
      )}

      {/* Log List */}
      <div className="bg-black/40 border border-white/10 rounded-2xl backdrop-blur-xl overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <span className="text-sm font-bold text-white">{filteredLogs.length} logs</span>
            <select
              value={logsPerPage}
              onChange={(e) => setLogsPerPage(parseInt(e.target.value))}
              className="bg-black/50 border border-white/10 rounded px-2 py-1 text-xs text-white"
            >
              <option value={25}>25/page</option>
              <option value={50}>50/page</option>
              <option value={100}>100/page</option>
              <option value={500}>500/page</option>
            </select>
          </div>
          <div className="flex gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-black/50 border border-white/10 rounded px-2 py-1 text-xs text-white"
            >
              <option value="timestamp">Sort by Time</option>
              <option value="level">Sort by Level</option>
              <option value="duration">Sort by Duration</option>
            </select>
            <button
              onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
              className="p-1 bg-black/50 border border-white/10 rounded text-white/60 hover:text-white"
            >
              {sortOrder === "asc" ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
            </button>
          </div>
        </div>

        <div className="max-h-[600px] overflow-y-auto">
          {paginatedLogs.length === 0 ? (
            <div className="text-center py-20 text-white/40">
              <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-sm">No logs match your filters</p>
            </div>
          ) : (
            paginatedLogs.map((log) => (
              <LogEntryRow
                key={log.id}
                log={log}
                searchQuery={filter.searchQuery}
                regexMode={filter.regexMode}
                caseSensitive={filter.caseSensitive}
                onBookmark={handleBookmark}
                onExpand={handleExpand}
                isExpanded={expandedLogs.has(log.id)}
              />
            ))
          )}
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between p-4 border-t border-white/10">
            <div className="text-xs text-white/60">
              Page {currentPage} of {totalPages}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 bg-black/50 border border-white/10 rounded text-xs text-white/60 hover:text-white disabled:opacity-50"
              >
                <ChevronLeft size={14} />
              </button>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 bg-black/50 border border-white/10 rounded text-xs text-white/60 hover:text-white disabled:opacity-50"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}