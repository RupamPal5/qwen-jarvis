"use client";
import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import {
  motion, AnimatePresence
} from "framer-motion";
import {
  Shield, ShieldAlert, ShieldCheck, Lock, Unlock, AlertTriangle, AlertCircle, Eye, EyeOff, Activity, Zap, Cpu, Network, Globe, Server, Database, Terminal, Code, Bug, BugOff, Scan, ScanLine, Search, Filter, Download, Upload, Trash2, RefreshCw, Play, Pause, Square, ChevronDown, ChevronRight, ChevronLeft, MoreVertical, Settings, Bell, BellOff, BellRing, XCircle, CheckCircle, Info, HelpCircle, TrendingUp, TrendingDown, BarChart3, Map, MapPin, Navigation, Compass, Satellite, Radio, Signal, Wifi, WifiOff, Bluetooth, Usb, HardDrive, MemoryStick, Thermometer, Fan, Power, Battery, BatteryCharging, Gauge, Key, Fingerprint, QrCode, Hash, Binary, GitBranch, GitCommit, FileText, FileCode, FileJson, Folder, FolderOpen, Archive, Clock, Timer, TimerOff, Calendar, CalendarDays, User, Users, UserCheck, UserX, UserPlus, UserMinus, MessageSquare, Send, SendHorizontal, Mail, Phone, Video, Camera, CameraOff, Mic, MicOff, Volume2, VolumeX, Sun, Moon, Cloud, CloudOff, CloudRain, CloudSnow, Flame, Snowflake, Umbrella, Wind, Droplets, Rocket, Plane, Train, Bus, Car, Bike, Footprints, PersonStanding, Dumbbell, Weight, Scale, Hammer, Wrench, Nut, Bolt, Sliders, SlidersHorizontal, SlidersVertical, ToggleLeft, ToggleRight, Delete, Inbox, View, ZoomIn, ZoomOut, Focus, Target, Crosshair, Locate, LocateOff, LocateFixed, Maximize, Maximize2, Minimize, Minimize2, Expand, Fullscreen, RotateCw, RotateCcw, Rotate3d, FlipHorizontal, FlipVertical, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, ArrowUpRight, ArrowDownRight, ArrowUpLeft, ArrowDownLeft, ExternalLink, Link as LinkIcon, Unlink, Copy, Clipboard, Scissors, Save, SaveAll, Printer, Share2, Share, Layers, Box, Package, BoxSelect, Grid, Grid3X3, Columns, Rows, Table, List, ListOrdered, CheckSquare, Circle, Triangle, Hexagon, Octagon, Star, StarOff, Heart, ThumbsUp, ThumbsDown, Award, Trophy, Medal, Crown, Gem, Diamond, Gift, PartyPopper, Coffee, Home, Building, Hospital, School, University, Store, ShoppingCart, CreditCard, Wallet, PiggyBank, Coins, ChartLine, ChartBar, ChartPie, CloudUpload, CloudDownload, MessageCircle, AlarmClock, Hourglass, Handshake, Badge
} from "lucide-react";
import {
  LineChart as RechartsLineChart, Line as RechartsLine, XAxis as RechartsXAxis, YAxis as RechartsYAxis, CartesianGrid as RechartsCartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer as RechartsResponsiveContainer, AreaChart as RechartsAreaChart, Area as RechartsArea, BarChart as RechartsBarChart, Bar as RechartsBar, PieChart as RechartsPieChart, Pie as RechartsPie, Cell as RechartsCell, ComposedChart as RechartsComposedChart, ReferenceLine as RechartsReferenceLine, Legend as RechartsLegend, RadialBarChart, RadialBar, ScatterChart as RechartsScatterChart, Scatter as RechartsScatter, ZAxis as RechartsZAxis, RadarChart as RechartsRadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar as RechartsRadar
} from "recharts";

// ============================================================================
// TYPE DEFINITIONS — SECURITY DATA STRUCTURES
// ============================================================================

type ThreatLevel = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
type LayerStatus = "SECURE" | "WARNING" | "COMPROMISED" | "OFFLINE";
type ContainmentLayer = "OS_CAGE" | "NETWORK_MOAT" | "ALIGNMENT_WATCHDOG" | "MERKLE_AUDIT" | "RESOURCE_LEASH" | "HARDWARE_GUILLOTINE";
type EventSeverity = "INFO" | "WARNING" | "ERROR" | "CRITICAL";
type PacketProtocol = "TCP" | "UDP" | "ICMP" | "HTTP" | "HTTPS" | "SSH" | "DNS" | "UNKNOWN";
type AuditStatus = "VERIFIED" | "PENDING" | "TAMPERED";

interface ThreatEvent {
  id: string;
  timestamp: Date;
  sourceIp: string;
  sourceCountry: string;
  sourceLat: number;
  sourceLon: number;
  targetPort: number;
  protocol: PacketProtocol;
  threatType: "BRUTE_FORCE" | "SQL_INJECTION" | "XSS" | "DDOS" | "MALWARE" | "PORT_SCAN" | "ANOMALY";
  severity: ThreatLevel;
  status: "BLOCKED" | "MITIGATED" | "PENDING" | "ESCALATED";
  payload?: string;
  geolocation?: {
    city: string;
    region: string;
    country: string;
    lat: number;
    lon: number;
  };
}

interface ContainmentLayerStatus {
  id: ContainmentLayer;
  name: string;
  description: string;
  status: LayerStatus;
  integrity: number; // 0-100
  lastChecked: Date;
  eventsBlocked: number;
  icon: React.ReactNode;
  color: string;
}

interface eBPFEvent {
  id: string;
  timestamp: Date;
  pid: number;
  process: string;
  syscall: string;
  returnValue: number;
  duration: number; // microseconds
  severity: EventSeverity;
  blocked: boolean;
  details: string;
}

interface NetworkPacket {
  id: string;
  timestamp: Date;
  srcIp: string;
  dstIp: string;
  srcPort: number;
  dstPort: number;
  protocol: PacketProtocol;
  size: number;
  flags: string[];
  latency: number;
  encrypted: boolean;
}

interface MerkleAuditEntry {
  id: string;
  timestamp: Date;
  blockHeight: number;
  currentHash: string;
  previousHash: string;
  dataHash: string;
  status: AuditStatus;
  node: string;
}

interface Vulnerability {
  id: string;
  cve?: string;
  title: string;
  description: string;
  severity: ThreatLevel;
  cvssScore: number;
  affectedComponent: string;
  status: "OPEN" | "MITIGATED" | "RESOLVED" | "ACCEPTED";
  discoveredAt: Date;
  remediation?: string;
}

interface SecurityMetric {
  timestamp: string;
  threatsBlocked: number;
  networkTraffic: number;
  cpuUsage: number;
  memoryUsage: number;
  activeConnections: number;
  failedLogins: number;
}

// ============================================================================
// UTILITY FUNCTIONS — SECURITY HELPERS
// ============================================================================

const generateId = (): string => Math.random().toString(36).substring(2, 15) + Date.now().toString(36);

const formatTimestamp = (date: Date): string => {
  return date.toLocaleTimeString("en-US", { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" });
};

const formatRelativeTime = (date: Date): string => {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ago`;
};

const generateHash = (length = 64): string => {
  const chars = "0123456789abcdef";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
};

const getThreatColor = (level: ThreatLevel): string => {
  const colors: Record<ThreatLevel, string> = {
    LOW: "text-blue-400 bg-blue-500/20 border-blue-500/50",
    MEDIUM: "text-yellow-400 bg-yellow-500/20 border-yellow-500/50",
    HIGH: "text-orange-400 bg-orange-500/20 border-orange-500/50",
    CRITICAL: "text-red-400 bg-red-500/20 border-red-500/50 animate-pulse",
  };
  return colors[level];
};

const getLayerColor = (status: LayerStatus): string => {
  const colors: Record<LayerStatus, string> = {
    SECURE: "text-green-400 border-green-500/50 bg-green-500/10",
    WARNING: "text-yellow-400 border-yellow-500/50 bg-yellow-500/10",
    COMPROMISED: "text-red-400 border-red-500/50 bg-red-500/10 animate-pulse",
    OFFLINE: "text-slate-400 border-slate-500/50 bg-slate-500/10",
  };
  return colors[status];
};

const getSeverityColor = (severity: EventSeverity): string => {
  const colors: Record<EventSeverity, string> = {
    INFO: "text-cyan-400",
    WARNING: "text-yellow-400",
    ERROR: "text-orange-400",
    CRITICAL: "text-red-400",
  };
  return colors[severity];
};

// ============================================================================
// DATA SIMULATION — SECURITY GENERATORS
// ============================================================================

const COUNTRIES = ["USA", "CHN", "RUS", "BRA", "IND", "GBR", "DEU", "FRA", "JPN", "KOR", "IRN", "PRK"];
const CITIES = ["Moscow", "Beijing", "Tehran", "Pyongyang", "New York", "London", "Berlin", "Tokyo", "Seoul", "Brasilia"];
const THREAT_TYPES: ThreatEvent["threatType"][] = ["BRUTE_FORCE", "SQL_INJECTION", "XSS", "DDOS", "MALWARE", "PORT_SCAN", "ANOMALY"];
const PROTOCOLS: PacketProtocol[] = ["TCP", "UDP", "ICMP", "HTTP", "HTTPS", "SSH", "DNS", "UNKNOWN"];
const SYSCALLS = ["read", "write", "open", "close", "stat", "fstat", "lstat", "poll", "lseek", "mmap", "mprotect", "munmap", "brk", "rt_sigaction", "rt_sigprocmask", "rt_sigreturn", "ioctl", "pread64", "pwrite64", "readv", "writev", "access", "pipe", "select", "sched_yield", "mremap", "msync", "mincore", "madvise", "shmget", "shmat", "shmctl", "dup", "dup2", "pause", "nanosleep", "getitimer", "alarm", "setitimer", "getpid", "sendfile", "socket", "connect", "accept", "sendto", "recvfrom", "sendmsg", "recvmsg", "shutdown", "bind", "listen", "getsockname", "getpeername", "socketpair", "setsockopt", "getsockopt", "clone", "fork", "vfork", "execve", "exit", "wait4", "kill", "uname", "semget", "semop", "semctl", "shmdt", "msgget", "msgsnd", "msgrcv", "msgctl", "fcntl", "flock", "fsync", "fdatasync", "truncate", "ftruncate", "getdents", "getcwd", "chdir", "fchdir", "rename", "mkdir", "rmdir", "creat", "link", "unlink", "symlink", "readlink", "chmod", "fchmod", "chown", "fchown", "lchown", "umask", "gettimeofday", "getrlimit", "getrusage", "sysinfo", "times", "ptrace", "getuid", "syslog", "getgid", "setuid", "setgid", "geteuid", "getegid", "setpgid", "getppid", "getpgrp", "setsid", "setreuid", "setregid", "getgroups", "setgroups", "setresuid", "getresuid", "setresgid", "getresgid", "getpgid", "setfsuid", "setfsgid", "getsid", "capget", "capset", "rt_sigpending", "rt_sigtimedwait", "rt_sigqueueinfo", "rt_sigsuspend", "sigaltstack", "utime", "mknod", "uselib", "personality", "ustat", "statfs", "fstatfs", "sysfs", "getpriority", "setpriority", "sched_setparam", "sched_getparam", "sched_setscheduler", "sched_getscheduler", "sched_get_priority_max", "sched_get_priority_min", "sched_rr_get_interval", "mlock", "munlock", "mlockall", "munlockall", "vhangup", "modify_ldt", "pivot_root", "_sysctl", "prctl", "arch_prctl", "adjtimex", "setrlimit", "chroot", "sync", "acct", "settimeofday", "mount", "umount2", "swapon", "swapoff", "reboot", "sethostname", "setdomainname", "iopl", "ioperm", "create_module", "init_module", "delete_module", "get_kernel_syms", "query_module", "quotactl", "nfsservctl", "getpmsg", "putpmsg", "afs_syscall", "tuxcall", "security", "gettid", "readahead", "setxattr", "lsetxattr", "fsetxattr", "getxattr", "lgetxattr", "fgetxattr", "listxattr", "llistxattr", "flistxattr", "removexattr", "lremovexattr", "fremovexattr", "tkill", "time", "futex", "sched_setaffinity", "sched_getaffinity", "set_thread_area", "io_setup", "io_destroy", "io_getevents", "io_submit", "io_cancel", "get_thread_area", "lookup_dcookie", "epoll_create", "epoll_ctl_old", "epoll_wait_old", "remap_file_pages", "getdents64", "set_tid_address", "restart_syscall", "semtimedop", "fadvise64", "timer_create", "timer_settime", "timer_gettime", "timer_getoverrun", "timer_delete", "clock_settime", "clock_gettime", "clock_getres", "clock_nanosleep", "exit_group", "epoll_wait", "epoll_ctl", "tgkill", "utimes", "vserver", "mbind", "set_mempolicy", "get_mempolicy", "mq_open", "mq_unlink", "mq_timedsend", "mq_timedreceive", "mq_notify", "mq_getsetattr", "kexec_load", "waitid", "add_key", "request_key", "keyctl", "ioprio_set", "ioprio_get", "inotify_init", "inotify_add_watch", "inotify_rm_watch", "migrate_pages", "openat", "mkdirat", "mknodat", "fchownat", "futimesat", "newfstatat", "unlinkat", "renameat", "linkat", "symlinkat", "readlinkat", "fchmodat", "faccessat", "pselect6", "ppoll", "unshare", "set_robust_list", "get_robust_list", "splice", "tee", "sync_file_range", "vmsplice", "move_pages", "utimensat", "epoll_pwait", "signalfd", "timerfd_create", "timerfd_settime", "timerfd_gettime", "signalfd4", "eventfd", "fallocate", "timerfd_settime64", "timerfd_gettime64", "eventfd2", "epoll_create1", "dup3", "pipe2", "inotify_init1", "preadv", "pwritev", "rt_tgsigqueueinfo", "perf_event_open", "recvmmsg", "fanotify_init", "fanotify_mark", "prlimit64", "name_to_handle_at", "open_by_handle_at", "clock_adjtime", "syncfs", "sendmmsg", "setns", "getcpu", "process_vm_readv", "process_vm_writev", "kcmp", "finit_module", "sched_setattr", "sched_getattr", "renameat2", "seccomp", "getrandom", "memfd_create", "kexec_file_load", "bpf", "execveat", "userfaultfd", "membarrier", "mlock2", "copy_file_range", "pkey_mprotect", "pkey_alloc", "pkey_free", "statx", "io_pgetevents", "rseq", "pidfd_send_signal", "io_uring_setup", "io_uring_enter", "io_uring_register", "open_tree", "move_mount", "fsopen", "fspick", "pidfd_open", "clone3", "close_range", "openat2", "pidfd_getfd", "faccessat2", "process_madvise", "epoll_pwait2", "mount_setattr", "quotactl_fd", "landlock_create_ruleset", "landlock_add_rule", "landlock_restrict_self", "memfd_secret", "process_mrelease", "futex_waitv", "set_mempolicy_home_node"];

const generateThreatEvent = (): ThreatEvent => {
  const country = COUNTRIES[Math.floor(Math.random() * COUNTRIES.length)];
  const city = CITIES[Math.floor(Math.random() * CITIES.length)];
  const severityRoll = Math.random();
  let severity: ThreatLevel = "LOW";
  if (severityRoll > 0.95) severity = "CRITICAL";
  else if (severityRoll > 0.8) severity = "HIGH";
  else if (severityRoll > 0.6) severity = "MEDIUM";

  return {
    id: generateId(),
    timestamp: new Date(),
    sourceIp: `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
    sourceCountry: country,
    sourceLat: (Math.random() - 0.5) * 180,
    sourceLon: (Math.random() - 0.5) * 360,
    targetPort: Math.floor(Math.random() * 65535),
    protocol: PROTOCOLS[Math.floor(Math.random() * PROTOCOLS.length)],
    threatType: THREAT_TYPES[Math.floor(Math.random() * THREAT_TYPES.length)],
    severity,
    status: Math.random() > 0.1 ? "BLOCKED" : "PENDING",
    geolocation: { city, region: "Unknown", country, lat: (Math.random() - 0.5) * 180, lon: (Math.random() - 0.5) * 360 },
  };
};

const generateeBPFEvent = (): eBPFEvent => {
  const severityRoll = Math.random();
  let severity: EventSeverity = "INFO";
  if (severityRoll > 0.95) severity = "CRITICAL";
  else if (severityRoll > 0.85) severity = "ERROR";
  else if (severityRoll > 0.7) severity = "WARNING";

  return {
    id: generateId(),
    timestamp: new Date(),
    pid: Math.floor(Math.random() * 32768),
    process: ["python3", "node", "chrome", "ollama", "systemd", "sshd", "nginx", "postgres"][Math.floor(Math.random() * 8)],
    syscall: SYSCALLS[Math.floor(Math.random() * SYSCALLS.length)],
    returnValue: Math.random() > 0.1 ? 0 : -1,
    duration: Math.floor(Math.random() * 10000),
    severity,
    blocked: severity === "CRITICAL" || severity === "ERROR",
    details: `Process attempted ${SYSCALLS[Math.floor(Math.random() * SYSCALLS.length)]} on restricted resource`,
  };
};

const generateNetworkPacket = (): NetworkPacket => {
  return {
    id: generateId(),
    timestamp: new Date(),
    srcIp: `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
    dstIp: "192.168.1.100",
    srcPort: Math.floor(Math.random() * 65535),
    dstPort: [80, 443, 22, 53, 8080, 3000, 8000][Math.floor(Math.random() * 7)],
    protocol: PROTOCOLS[Math.floor(Math.random() * PROTOCOLS.length)],
    size: Math.floor(Math.random() * 1500) + 64,
    flags: ["SYN", "ACK", "FIN", "RST", "PSH", "URG"].filter(() => Math.random() > 0.5),
    latency: Math.random() * 200,
    encrypted: Math.random() > 0.3,
  };
};

const generateMerkleAuditEntry = (height: number): MerkleAuditEntry => {
  return {
    id: generateId(),
    timestamp: new Date(),
    blockHeight: height,
    currentHash: generateHash(),
    previousHash: generateHash(),
    dataHash: generateHash(32),
    status: Math.random() > 0.99 ? "TAMPERED" : "VERIFIED",
    node: `node-${Math.floor(Math.random() * 12) + 1}`,
  };
};

const generateVulnerability = (): Vulnerability => {
  const severities: ThreatLevel[] = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];
  const severity = severities[Math.floor(Math.random() * severities.length)];
  return {
    id: generateId(),
    cve: `CVE-${2024 + Math.floor(Math.random() * 2)}-${Math.floor(Math.random() * 90000) + 10000}`,
    title: ["Buffer Overflow in auth module", "SQL Injection in user search", "XSS in comment field", "Privilege Escalation via API", "Remote Code Execution in parser"][Math.floor(Math.random() * 5)],
    description: "A critical vulnerability was detected that could allow unauthorized access to system resources.",
    severity,
    cvssScore: parseFloat((Math.random() * 4 + 6).toFixed(1)),
    affectedComponent: ["jarvis_core", "neural_net", "api_gateway", "auth_service", "memory_db"][Math.floor(Math.random() * 5)],
    status: ["OPEN", "MITIGATED", "RESOLVED", "ACCEPTED"][Math.floor(Math.random() * 4)] as any,
    discoveredAt: new Date(Date.now() - Math.random() * 86400000 * 30),
    remediation: "Update to latest version and apply security patch.",
  };
};

const generateSecurityMetrics = (hours: number): SecurityMetric[] => {
  const metrics: SecurityMetric[] = [];
  const now = new Date();
  for (let i = hours; i >= 0; i--) {
    const time = new Date(now.getTime() - i * 3600000);
    metrics.push({
      timestamp: time.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
      threatsBlocked: Math.floor(Math.random() * 500) + 100,
      networkTraffic: Math.floor(Math.random() * 1000) + 500,
      cpuUsage: Math.random() * 60 + 20,
      memoryUsage: Math.random() * 40 + 30,
      activeConnections: Math.floor(Math.random() * 1000) + 200,
      failedLogins: Math.floor(Math.random() * 50),
    });
  }
  return metrics;
};

// ============================================================================
// SUB-COMPONENTS — MODULAR SECURITY DASHBOARD
// ============================================================================

// --- Global Threat Map (Simulated Canvas) ---
const ThreatMap: React.FC<{ threats: ThreatEvent[] }> = ({ threats }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw grid
      ctx.strokeStyle = "rgba(6, 182, 212, 0.1)";
      ctx.lineWidth = 1;
      for (let i = 0; i < canvas.width; i += 40) {
        ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, canvas.height); ctx.stroke();
      }
      for (let i = 0; i < canvas.height; i += 40) {
        ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(canvas.width, i); ctx.stroke();
      }

      // Draw center (JARVIS)
      const cx = canvas.width / 2;
      const cy = canvas.height / 2;
      ctx.beginPath();
      ctx.arc(cx, cy, 8, 0, Math.PI * 2);
      ctx.fillStyle = "#06b6d4";
      ctx.fill();
      ctx.shadowColor = "#06b6d4";
      ctx.shadowBlur = 20;
      ctx.fill();
      ctx.shadowBlur = 0;

      // Draw threat lines
      threats.slice(0, 20).forEach((threat) => {
        const x = ((threat.sourceLon + 180) / 360) * canvas.width;
        const y = ((90 - threat.sourceLat) / 180) * canvas.height;
        
        const gradient = ctx.createLinearGradient(cx, cy, x, y);
        const color = threat.severity === "CRITICAL" ? "#ef4444" : threat.severity === "HIGH" ? "#f97316" : "#eab308";
        gradient.addColorStop(0, "rgba(6, 182, 212, 0.8)");
        gradient.addColorStop(1, color);
        
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(x, y);
        ctx.strokeStyle = gradient;
        ctx.lineWidth = threat.severity === "CRITICAL" ? 2 : 1;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
      });
    };

    draw();
  }, [threats]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-black/40 backdrop-blur-xl border border-red-500/30 rounded-2xl p-6 shadow-[0_0_30px_rgba(239,68,68,0.2)]"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Globe className="w-5 h-5 text-red-400" />
          <h3 className="text-sm font-bold text-white tracking-wider">GLOBAL THREAT MAP</h3>
        </div>
        <div className="flex gap-2">
          <span className="px-2 py-1 rounded text-[10px] font-bold bg-red-500/20 text-red-400 border border-red-500/50 animate-pulse">
            {threats.filter(t => t.severity === "CRITICAL").length} CRITICAL
          </span>
        </div>
      </div>
      <canvas ref={canvasRef} className="w-full h-64 bg-black/60 rounded-lg border border-white/5" />
      <div className="grid grid-cols-4 gap-2 mt-4 text-[10px]">
        <div className="bg-black/30 rounded p-2 border border-white/5">
          <div className="text-white/40 mb-1">TOTAL THREATS</div>
          <div className="text-lg font-bold text-white">{threats.length.toLocaleString()}</div>
        </div>
        <div className="bg-black/30 rounded p-2 border border-white/5">
          <div className="text-white/40 mb-1">BLOCKED</div>
          <div className="text-lg font-bold text-green-400">{threats.filter(t => t.status === "BLOCKED").length.toLocaleString()}</div>
        </div>
        <div className="bg-black/30 rounded p-2 border border-white/5">
          <div className="text-white/40 mb-1">PENDING</div>
          <div className="text-lg font-bold text-yellow-400">{threats.filter(t => t.status === "PENDING").length.toLocaleString()}</div>
        </div>
        <div className="bg-black/30 rounded p-2 border border-white/5">
          <div className="text-white/40 mb-1">MITIGATED</div>
          <div className="text-lg font-bold text-blue-400">{threats.filter(t => t.status === "MITIGATED").length.toLocaleString()}</div>
        </div>
      </div>
    </motion.div>
  );
};

// --- 6-Layer Containment Grid ---
const ContainmentGrid: React.FC<{ layers: ContainmentLayerStatus[] }> = ({ layers }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-black/40 backdrop-blur-xl border border-cyan-500/30 rounded-2xl p-6 shadow-[0_0_30px_rgba(6,182,212,0.2)]"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Shield className="w-5 h-5 text-cyan-400" />
          <h3 className="text-sm font-bold text-white tracking-wider">6-LAYER CONTAINMENT</h3>
        </div>
        <Badge variant="success" pulse>ACTIVE</Badge>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {layers.map((layer) => (
          <motion.div
            key={layer.id}
            whileHover={{ scale: 1.02 }}
            className={`p-4 rounded-xl border backdrop-blur-xl transition-all ${getLayerColor(layer.status)}`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 rounded-lg bg-black/40">
                {layer.icon}
              </div>
              <div className={`w-2 h-2 rounded-full ${layer.status === "SECURE" ? "bg-green-400 animate-pulse" : layer.status === "WARNING" ? "bg-yellow-400" : "bg-red-400 animate-pulse"}`} />
            </div>
            <div className="text-xs font-bold text-white mb-1">{layer.name}</div>
            <div className="text-[10px] text-white/60 mb-3 line-clamp-2">{layer.description}</div>
            <div className="space-y-1">
              <div className="flex justify-between text-[10px]">
                <span className="text-white/40">Integrity</span>
                <span className="font-bold">{layer.integrity}%</span>
              </div>
              <div className="h-1 bg-black/50 rounded-full overflow-hidden">
                <motion.div
                  className={`h-full ${layer.status === "SECURE" ? "bg-green-500" : layer.status === "WARNING" ? "bg-yellow-500" : "bg-red-500"}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${layer.integrity}%` }}
                  transition={{ duration: 1 }}
                />
              </div>
              <div className="text-[10px] text-white/40 mt-2">
                Blocked: <span className="text-white font-bold">{layer.eventsBlocked.toLocaleString()}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

// --- eBPF Kernel Monitor (Terminal Style) ---
const EbpfMonitor: React.FC<{ events: eBPFEvent[] }> = ({ events }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [events]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-black/40 backdrop-blur-xl border border-purple-500/30 rounded-2xl p-6 shadow-[0_0_30px_rgba(168,85,247,0.2)]"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Terminal className="w-5 h-5 text-purple-400" />
          <h3 className="text-sm font-bold text-white tracking-wider">eBPF KERNEL MONITOR</h3>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-[10px] text-green-400 font-bold">LIVE</span>
        </div>
      </div>
      <div
        ref={scrollRef}
        className="h-64 overflow-y-auto font-mono text-xs space-y-1 p-3 bg-black/60 rounded-lg border border-white/5 scrollbar-thin scrollbar-thumb-purple-800"
      >
        {events.map((event) => (
          <motion.div
            key={event.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className={`flex items-start gap-2 p-2 rounded ${event.blocked ? "bg-red-500/10 border border-red-500/20" : "bg-white/5"}`}
          >
            <span className="text-white/40 flex-shrink-0">[{formatTimestamp(event.timestamp)}]</span>
            <span className={`flex-shrink-0 font-bold ${getSeverityColor(event.severity)}`}>
              {event.severity}
            </span>
            <span className="text-cyan-400 flex-shrink-0">PID:{event.pid}</span>
            <span className="text-purple-400 flex-shrink-0">{event.process}</span>
            <span className="text-yellow-400 flex-shrink-0">syscall:{event.syscall}</span>
            <span className="text-white/80 flex-1">{event.details}</span>
            {event.blocked && (
              <span className="text-red-400 font-bold flex-shrink-0">[BLOCKED]</span>
            )}
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

// --- Network Traffic Chart ---
const NetworkTrafficChart: React.FC<{ metrics: SecurityMetric[] }> = ({ metrics }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-black/40 backdrop-blur-xl border border-blue-500/30 rounded-2xl p-6 shadow-[0_0_30px_rgba(59,130,246,0.2)]"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Activity className="w-5 h-5 text-blue-400" />
          <h3 className="text-sm font-bold text-white tracking-wider">NETWORK TRAFFIC & THREATS</h3>
        </div>
      </div>
      <RechartsResponsiveContainer width="100%" height={250}>
        <RechartsComposedChart data={metrics}>
          <RechartsCartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <RechartsXAxis dataKey="timestamp" stroke="rgba(255,255,255,0.3)" tick={{ fontSize: 10 }} />
          <RechartsYAxis yAxisId="left" stroke="rgba(255,255,255,0.3)" tick={{ fontSize: 10 }} />
          <RechartsYAxis yAxisId="right" orientation="right" stroke="rgba(239,68,68,0.5)" tick={{ fontSize: 10 }} />
          <RechartsTooltip
            contentStyle={{
              backgroundColor: "rgba(0,0,0,0.9)",
              border: "1px solid rgba(59,130,246,0.3)",
              borderRadius: "8px",
              color: "white",
            }}
          />
          <RechartsLegend wrapperStyle={{ fontSize: 10 }} />
          <RechartsArea yAxisId="left" type="monotone" dataKey="networkTraffic" stroke="#3b82f6" fill="rgba(59,130,246,0.2)" name="Traffic (MB)" />
          <RechartsLine yAxisId="right" type="monotone" dataKey="threatsBlocked" stroke="#ef4444" strokeWidth={2} dot={false} name="Threats Blocked" />
        </RechartsComposedChart>
      </RechartsResponsiveContainer>
    </motion.div>
  );
};

// --- Intrusion Detection Feed ---
const IntrusionFeed: React.FC<{ threats: ThreatEvent[] }> = ({ threats }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-black/40 backdrop-blur-xl border border-orange-500/30 rounded-2xl p-6 shadow-[0_0_30px_rgba(249,115,22,0.2)]"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-orange-400" />
          <h3 className="text-sm font-bold text-white tracking-wider">INTRUSION DETECTION</h3>
        </div>
        <button className="text-[10px] text-white/60 hover:text-white flex items-center gap-1">
          <Filter size={12} /> FILTER
        </button>
      </div>
      <div className="space-y-2 max-h-80 overflow-y-auto">
        {threats.slice(0, 15).map((threat) => (
          <motion.div
            key={threat.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-black/30 border border-white/5 rounded-lg p-3 hover:border-orange-500/30 transition-all"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded text-[9px] font-bold border ${getThreatColor(threat.severity)}`}>
                  {threat.severity}
                </span>
                <span className="text-xs font-bold text-white">{threat.threatType.replace(/_/g, " ")}</span>
              </div>
              <span className={`text-[10px] font-bold ${threat.status === "BLOCKED" ? "text-green-400" : "text-yellow-400"}`}>
                {threat.status}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[10px] text-white/60">
              <div>
                <span className="text-white/40">SRC:</span> {threat.sourceIp} ({threat.sourceCountry})
              </div>
              <div>
                <span className="text-white/40">PORT:</span> {threat.targetPort} ({threat.protocol})
              </div>
            </div>
            <div className="text-[10px] text-white/40 mt-1">
              {formatRelativeTime(threat.timestamp)}
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

// --- Panic Room Controls ---
const PanicRoomControls: React.FC = () => {
  const [isLocked, setIsLocked] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const triggerPanic = () => {
    setIsLocked(true);
    setCountdown(10);
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className={`bg-black/40 backdrop-blur-xl border rounded-2xl p-6 shadow-[0_0_30px_rgba(239,68,68,0.3)] transition-all ${
        isLocked ? "border-red-500/80 bg-red-950/20" : "border-red-500/30"
      }`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Lock className={`w-5 h-5 ${isLocked ? "text-red-400 animate-pulse" : "text-red-400"}`} />
          <h3 className="text-sm font-bold text-white tracking-wider">PANIC ROOM</h3>
        </div>
        {isLocked && (
          <span className="px-2 py-1 rounded text-[10px] font-bold bg-red-500/20 text-red-400 border border-red-500/50 animate-pulse">
            LOCKDOWN ACTIVE
          </span>
        )}
      </div>
      
      <div className="space-y-3">
        <button
          onClick={triggerPanic}
          disabled={isLocked}
          className={`w-full py-4 rounded-xl font-black text-sm tracking-widest transition-all ${
            isLocked
              ? "bg-red-900/50 text-red-400 border border-red-500/50 cursor-not-allowed"
              : "bg-gradient-to-r from-red-600 to-orange-600 text-white hover:from-red-500 hover:to-orange-500 shadow-[0_0_20px_rgba(239,68,68,0.4)]"
          }`}
        >
          {isLocked ? `LOCKDOWN IN ${countdown}s...` : "INITIATE PANIC ROOM"}
        </button>
        
        <div className="grid grid-cols-2 gap-2">
          <button className="py-2 bg-black/40 border border-white/10 rounded-lg text-[10px] text-white/60 hover:bg-white/5 transition-all">
            SEVER NETWORK
          </button>
          <button className="py-2 bg-black/40 border border-white/10 rounded-lg text-[10px] text-white/60 hover:bg-white/5 transition-all">
            ENCRYPT DB
          </button>
          <button className="py-2 bg-black/40 border border-white/10 rounded-lg text-[10px] text-white/60 hover:bg-white/5 transition-all">
            WIPE RAM
          </button>
          <button className="py-2 bg-black/40 border border-white/10 rounded-lg text-[10px] text-white/60 hover:bg-white/5 transition-all">
            ALERT ADMIN
          </button>
        </div>
      </div>
    </motion.div>
  );
};

// --- Merkle Audit Log ---
const MerkleAuditLog: React.FC<{ entries: MerkleAuditEntry[] }> = ({ entries }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-black/40 backdrop-blur-xl border border-green-500/30 rounded-2xl p-6 shadow-[0_0_30px_rgba(34,197,94,0.2)]"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Hash className="w-5 h-5 text-green-400" />
          <h3 className="text-sm font-bold text-white tracking-wider">MERKLE AUDIT CHAIN</h3>
        </div>
        <div className="flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-green-400" />
          <span className="text-[10px] text-green-400 font-bold">CHAIN VALID</span>
        </div>
      </div>
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {entries.slice(0, 10).map((entry) => (
          <motion.div
            key={entry.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-black/30 border border-white/5 rounded-lg p-3 font-mono text-[10px]"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-white/40">Block #{entry.blockHeight}</span>
              <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                entry.status === "VERIFIED" ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
              }`}>
                {entry.status}
              </span>
            </div>
            <div className="text-cyan-400 truncate mb-1">
              <span className="text-white/40">Hash:</span> {entry.currentHash.substring(0, 32)}...
            </div>
            <div className="text-purple-400 truncate">
              <span className="text-white/40">Prev:</span> {entry.previousHash.substring(0, 32)}...
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

// --- Vulnerability Scanner ---
const VulnerabilityScanner: React.FC<{ vulnerabilities: Vulnerability[] }> = ({ vulnerabilities }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-black/40 backdrop-blur-xl border border-yellow-500/30 rounded-2xl p-6 shadow-[0_0_30px_rgba(234,179,8,0.2)]"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Bug className="w-5 h-5 text-yellow-400" />
          <h3 className="text-sm font-bold text-white tracking-wider">VULNERABILITY SCAN</h3>
        </div>
        <button className="px-3 py-1 bg-yellow-500/20 border border-yellow-500/50 text-yellow-400 rounded-lg text-[10px] font-bold hover:bg-yellow-500/30 transition-all flex items-center gap-1">
          <Scan size={12} /> SCAN NOW
        </button>
      </div>
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {vulnerabilities.slice(0, 8).map((vuln) => (
          <motion.div
            key={vuln.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-black/30 border border-white/5 rounded-lg p-3 hover:border-yellow-500/30 transition-all"
          >
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded text-[9px] font-bold border ${getThreatColor(vuln.severity)}`}>
                  CVSS {vuln.cvssScore}
                </span>
                <span className="text-xs font-bold text-white">{vuln.title}</span>
              </div>
              <span className={`text-[10px] font-bold ${
                vuln.status === "RESOLVED" ? "text-green-400" :
                vuln.status === "MITIGATED" ? "text-blue-400" :
                vuln.status === "ACCEPTED" ? "text-purple-400" : "text-red-400"
              }`}>
                {vuln.status}
              </span>
            </div>
            <div className="text-[10px] text-white/60 mb-1">{vuln.description}</div>
            <div className="flex items-center justify-between text-[10px] text-white/40">
              <span>{vuln.cve} • {vuln.affectedComponent}</span>
              <span>{formatRelativeTime(vuln.discoveredAt)}</span>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

// ============================================================================
// MAIN SECURITY DASHBOARD COMPONENT
// ============================================================================

export default function SecurityDashboard() {
  const [threats, setThreats] = useState<ThreatEvent[]>([]);
  const [ebpfEvents, setEbpfEvents] = useState<eBPFEvent[]>([]);
  const [networkPackets, setNetworkPackets] = useState<NetworkPacket[]>([]);
  const [merkleEntries, setMerkleEntries] = useState<MerkleAuditEntry[]>([]);
  const [vulnerabilities, setVulnerabilities] = useState<Vulnerability[]>([]);
  const [metrics, setMetrics] = useState<SecurityMetric[]>([]);
  const [isLive, setIsLive] = useState(true);
  const [blockHeight, setBlockHeight] = useState(145892);

  // Initialize containment layers
  const [layers, setLayers] = useState<ContainmentLayerStatus[]>([
    { id: "OS_CAGE", name: "OS Cage (LXC)", description: "Linux namespaces and cgroups isolation", status: "SECURE", integrity: 100, lastChecked: new Date(), eventsBlocked: 1247, icon: <Box size={16} />, color: "cyan" },
    { id: "NETWORK_MOAT", name: "Network Moat", description: "Squid proxy egress filtering", status: "SECURE", integrity: 100, lastChecked: new Date(), eventsBlocked: 8934, icon: <Wifi size={16} />, color: "blue" },
    { id: "ALIGNMENT_WATCHDOG", name: "Alignment Watchdog", description: "Local LLM monitors AI outputs", status: "SECURE", integrity: 98, lastChecked: new Date(), eventsBlocked: 23, icon: <Eye size={16} />, color: "purple" },
    { id: "MERKLE_AUDIT", name: "Merkle Audit", description: "Cryptographic log integrity chain", status: "SECURE", integrity: 100, lastChecked: new Date(), eventsBlocked: 0, icon: <Hash size={16} />, color: "green" },
    { id: "RESOURCE_LEASH", name: "Resource Leash", description: "CPU/RAM cgroup limits", status: "WARNING", integrity: 85, lastChecked: new Date(), eventsBlocked: 456, icon: <Cpu size={16} />, color: "yellow" },
    { id: "HARDWARE_GUILLOTINE", name: "Hardware Guillotine", description: "YubiKey physical kill switch", status: "SECURE", integrity: 100, lastChecked: new Date(), eventsBlocked: 0, icon: <Key size={16} />, color: "red" },
  ]);

  // Initialize data
  useEffect(() => {
    setMetrics(generateSecurityMetrics(24));
    setVulnerabilities(Array.from({ length: 15 }, generateVulnerability));
    setMerkleEntries(Array.from({ length: 20 }, (_, i) => generateMerkleAuditEntry(blockHeight - i)));
  }, []);

  // Live data simulation
  useEffect(() => {
    if (!isLive) return;

    const threatInterval = setInterval(() => {
      setThreats(prev => [generateThreatEvent(), ...prev].slice(0, 100));
    }, 2000);

    const ebpfInterval = setInterval(() => {
      setEbpfEvents(prev => [generateeBPFEvent(), ...prev].slice(0, 50));
    }, 1000);

    const packetInterval = setInterval(() => {
      setNetworkPackets(prev => [generateNetworkPacket(), ...prev].slice(0, 30));
    }, 500);

    const merkleInterval = setInterval(() => {
      setBlockHeight(prev => prev + 1);
      setMerkleEntries(prev => [generateMerkleAuditEntry(blockHeight + 1), ...prev].slice(0, 20));
    }, 5000);

    return () => {
      clearInterval(threatInterval);
      clearInterval(ebpfInterval);
      clearInterval(packetInterval);
      clearInterval(merkleInterval);
    };
  }, [isLive, blockHeight]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-slate-900/80 to-black/80 border border-red-500/30 rounded-2xl p-6 backdrop-blur-xl shadow-[0_0_30px_rgba(239,68,68,0.2)]"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <ShieldAlert className="w-8 h-8 text-red-400 animate-pulse" />
            <div>
              <h2 className="text-2xl font-black text-white tracking-wider">SECURITY DASHBOARD</h2>
              <p className="text-xs text-white/60">6-Layer Containment • eBPF Kernel • Merkle Audit • Panic Room</p>
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
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
          <div className="bg-black/30 rounded-lg p-3 border border-white/5">
            <div className="text-[10px] text-white/40 mb-1">THREAT LEVEL</div>
            <div className="text-lg font-bold text-red-400 animate-pulse">HIGH</div>
          </div>
          <div className="bg-black/30 rounded-lg p-3 border border-white/5">
            <div className="text-[10px] text-white/40 mb-1">FIREWALL</div>
            <div className="text-lg font-bold text-green-400">ACTIVE</div>
          </div>
          <div className="bg-black/30 rounded-lg p-3 border border-white/5">
            <div className="text-[10px] text-white/40 mb-1">ENCRYPTION</div>
            <div className="text-lg font-bold text-cyan-400">AES-256</div>
          </div>
          <div className="bg-black/30 rounded-lg p-3 border border-white/5">
            <div className="text-[10px] text-white/40 mb-1">WATCHDOG</div>
            <div className="text-lg font-bold text-purple-400">ONLINE</div>
          </div>
          <div className="bg-black/30 rounded-lg p-3 border border-white/5">
            <div className="text-[10px] text-white/40 mb-1">AUDIT CHAIN</div>
            <div className="text-lg font-bold text-green-400">VALID</div>
          </div>
          <div className="bg-black/30 rounded-lg p-3 border border-white/5">
            <div className="text-[10px] text-white/40 mb-1">PANIC ROOM</div>
            <div className="text-lg font-bold text-yellow-400">ARMED</div>
          </div>
          <div className="bg-black/30 rounded-lg p-3 border border-white/5">
            <div className="text-[10px] text-white/40 mb-1">UPTIME</div>
            <div className="text-lg font-bold text-white">14d 7h</div>
          </div>
          <div className="bg-black/30 rounded-lg p-3 border border-white/5">
            <div className="text-[10px] text-white/40 mb-1">BLOCK HEIGHT</div>
            <div className="text-lg font-bold text-cyan-400">{blockHeight.toLocaleString()}</div>
          </div>
        </div>
      </motion.div>

      {/* Main Grid */}
      <div className="grid grid-cols-12 gap-6">
        {/* Left Column */}
        <div className="col-span-12 lg:col-span-8 space-y-6">
          <ThreatMap threats={threats} />
          <NetworkTrafficChart metrics={metrics} />
          <EbpfMonitor events={ebpfEvents} />
        </div>

        {/* Right Column */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
          <ContainmentGrid layers={layers} />
          <PanicRoomControls />
          <MerkleAuditLog entries={merkleEntries} />
        </div>

        {/* Bottom Row */}
        <div className="col-span-12 lg:col-span-6">
          <IntrusionFeed threats={threats} />
        </div>
        <div className="col-span-12 lg:col-span-6">
          <VulnerabilityScanner vulnerabilities={vulnerabilities} />
        </div>
      </div>
    </div>
  );
}