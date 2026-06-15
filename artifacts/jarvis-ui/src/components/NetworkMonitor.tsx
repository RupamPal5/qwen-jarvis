"use client";
import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import {
  motion, AnimatePresence
} from "framer-motion";
import {
  Network, Activity, Globe, Server, Shield, AlertTriangle, ArrowUpRight, ArrowDownRight, Wifi, WifiOff, Search, Filter, Download, Upload, RefreshCw, Maximize2, Minimize2, X, ChevronRight, ChevronDown, MoreVertical, Cpu, MemoryStick, HardDrive, Thermometer, Zap, Radio, Signal, Satellite, Cloud, CloudOff, Database, Terminal, Code, Bug, CheckCircle, XCircle, Info, Clock, Calendar, BarChart3, Eye, EyeOff, Lock, Unlock, Key, Fingerprint, Bell, BellOff, Settings, Sliders, ToggleLeft, ToggleRight, Folder, FileText, FileCode, FileJson, FileArchive, GitBranch, GitCommit, GitPullRequest, Package, Box, Layers, Home, LayoutDashboard, MessageSquare, Users, User, Star, Heart, ThumbsUp, ThumbsDown, Award, Trophy, Target, Flag, MapPin, Navigation, Compass, Sun, Moon, CloudRain, CloudSnow, Flame, Snowflake, Umbrella, Wind, Droplets, Timer, TimerOff, TimerReset, Volume2, VolumeX, Mic, MicOff, Camera, CameraOff, Video, VideoOff, Phone, Mail, AtSign, Hash, Binary, Code2, Braces, Command, Grid, List, Table, Columns, Rows, AlignLeft, AlignCenter, AlignRight, Bold, Italic, Underline, Strikethrough, Type, Heading, Sparkles, Wand2, Crown, Gem, Diamond, Feather, Anchor, Briefcase, Coffee, CupSoda, Pizza, Beer, Wine, Carrot, Apple, Banana, Grape, Cherry, AreaChart, PieChart, Radar
} from "lucide-react";
import {
  PieChart as RechartsPie, Pie as RechartsPieSlice, Cell as RechartsCell, ResponsiveContainer as RechartsResponsiveContainer, Tooltip as RechartsTooltip, Legend as RechartsLegend, Area, CartesianGrid, AreaChart as RechartsAreaChart, LineChart, Line, XAxis, YAxis, RadarChart, Radar as RechartsRadar, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from "recharts";

// ============================================================================
// TYPE DEFINITIONS - NETWORK ARCHITECTURE
// ============================================================================

type Protocol = "TCP" | "UDP" | "HTTP" | "HTTPS" | "DNS" | "SSH" | "FTP" | "ICMP" | "QUIC" | "WebSocket";
type PacketFlag = "SYN" | "ACK" | "FIN" | "RST" | "PSH" | "URG" | "ECE" | "CWR" | "NS";
type ConnectionState = "ESTABLISHED" | "SYN_SENT" | "SYN_RECV" | "FIN_WAIT1" | "FIN_WAIT2" | "TIME_WAIT" | "CLOSE" | "CLOSE_WAIT" | "LAST_ACK" | "LISTEN" | "CLOSING";
type AlertSeverity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
type GeoRegion = "NA" | "EU" | "ASIA" | "SA" | "AF" | "OC";

interface NetworkPacket {
  id: string;
  timestamp: Date;
  sourceIP: string;
  sourcePort: number;
  destIP: string;
  destPort: number;
  protocol: Protocol;
  flags: PacketFlag[];
  size: number; // bytes
  ttl: number;
  windowSize: number;
  sequenceNumber: number;
  ackNumber: number;
  payloadPreview: string; // Hex dump preview
  geoSource: GeoRegion;
  geoDest: GeoRegion;
  isEncrypted: boolean;
  latency: number; // ms
  status: "SUCCESS" | "DROPPED" | "PENDING";
}

interface NetworkNode {
  id: string;
  name: string;
  ip: string;
  type: "server" | "client" | "router" | "firewall" | "database" | "cloud";
  region: GeoRegion;
  status: "ONLINE" | "OFFLINE" | "DEGRADED";
  cpu: number;
  memory: number;
  bandwidth: number; // Mbps
  connections: number;
  x: number; // normalized 0-1
  y: number; // normalized 0-1
}

interface ActiveConnection {
  id: string;
  localIP: string;
  localPort: number;
  remoteIP: string;
  remotePort: number;
  protocol: Protocol;
  state: ConnectionState;
  pid: number;
  processName: string;
  sentBytes: number;
  recvBytes: number;
  duration: number; // seconds
}

interface TrafficMetric {
  timestamp: string;
  upload: number; // Mbps
  download: number; // Mbps
  packetsPerSec: number;
  errors: number;
  dropped: number;
}

interface ProtocolStat {
  name: string;
  value: number;
  color: string;
  packets: number;
  bytes: number;
}

interface NetworkAlert {
  id: string;
  timestamp: Date;
  severity: AlertSeverity;
  type: "PORT_SCAN" | "DDOS_ATTEMPT" | "UNUSUAL_TRAFFIC" | "FIREWALL_BLOCK" | "DNS_HIJACK" | "LATENCY_SPIKE";
  sourceIP: string;
  message: string;
  resolved: boolean;
}

interface TopTalker {
  ip: string;
  region: GeoRegion;
  sentBytes: number;
  recvBytes: number;
  packets: number;
  topProtocol: Protocol;
}

// ============================================================================
// CONSTANTS & MOCK DATA GENERATORS
// ============================================================================

const PROTOCOLS: Protocol[] = ["TCP", "UDP", "HTTP", "HTTPS", "DNS", "SSH", "FTP", "ICMP", "QUIC", "WebSocket"];
const FLAGS: PacketFlag[] = ["SYN", "ACK", "FIN", "RST", "PSH", "URG"];
const REGIONS: GeoRegion[] = ["NA", "EU", "ASIA", "SA", "AF", "OC"];
const CONNECTION_STATES: ConnectionState[] = ["ESTABLISHED", "SYN_SENT", "TIME_WAIT", "CLOSE_WAIT", "LISTEN"];
const ALERT_TYPES: NetworkAlert["type"][] = ["PORT_SCAN", "DDOS_ATTEMPT", "UNUSUAL_TRAFFIC", "FIREWALL_BLOCK", "DNS_HIJACK", "LATENCY_SPIKE"];
const SEVERITIES: AlertSeverity[] = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];

const PROTOCOL_COLORS: Record<Protocol, string> = {
  TCP: "#06b6d4", // Cyan
  UDP: "#8b5cf6", // Violet
  HTTP: "#10b981", // Emerald
  HTTPS: "#3b82f6", // Blue
  DNS: "#f59e0b", // Amber
  SSH: "#ef4444", // Red
  FTP: "#ec4899", // Pink
  ICMP: "#64748b", // Slate
  QUIC: "#14b8a6", // Teal
  WebSocket: "#a855f7", // Purple
};

const REGION_NAMES: Record<GeoRegion, string> = {
  NA: "North America",
  EU: "Europe",
  ASIA: "Asia Pacific",
  SA: "South America",
  AF: "Africa",
  OC: "Oceania",
};

const generateIP = (): string => {
  return `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
};

const generateMAC = (): string => {
  return Array.from({ length: 6 }, () => Math.floor(Math.random() * 256).toString(16).padStart(2, "0")).join(":");
};

const generateHexDump = (length: number = 32): string => {
  return Array.from({ length }, () => Math.floor(Math.random() * 256).toString(16).padStart(2, "0").toUpperCase()).join(" ");
};

const generatePacket = (): NetworkPacket => {
  const protocol = PROTOCOLS[Math.floor(Math.random() * PROTOCOLS.length)];
  const numFlags = Math.floor(Math.random() * 3) + 1;
  const packetFlags: PacketFlag[] = [];
  for (let i = 0; i < numFlags; i++) {
    packetFlags.push(FLAGS[Math.floor(Math.random() * FLAGS.length)]);
  }
  
  return {
    id: `pkt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date(),
    sourceIP: generateIP(),
    sourcePort: Math.floor(Math.random() * 65535),
    destIP: generateIP(),
    destPort: protocol === "HTTP" ? 80 : protocol === "HTTPS" ? 443 : protocol === "SSH" ? 22 : protocol === "DNS" ? 53 : Math.floor(Math.random() * 65535),
    protocol,
    flags: packetFlags,
    size: Math.floor(Math.random() * 1500) + 64,
    ttl: Math.floor(Math.random() * 64) + 64,
    windowSize: Math.floor(Math.random() * 65535),
    sequenceNumber: Math.floor(Math.random() * 4294967295),
    ackNumber: Math.floor(Math.random() * 4294967295),
    payloadPreview: generateHexDump(16),
    geoSource: REGIONS[Math.floor(Math.random() * REGIONS.length)],
    geoDest: REGIONS[Math.floor(Math.random() * REGIONS.length)],
    isEncrypted: protocol === "HTTPS" || protocol === "SSH" || Math.random() > 0.7,
    latency: Math.random() * 200,
    status: Math.random() > 0.95 ? "DROPPED" : Math.random() > 0.9 ? "PENDING" : "SUCCESS",
  };
};

const generateNode = (id: string, name: string, type: NetworkNode["type"], region: GeoRegion, x: number, y: number): NetworkNode => {
  return {
    id,
    name,
    ip: generateIP(),
    type,
    region,
    status: Math.random() > 0.9 ? "DEGRADED" : Math.random() > 0.95 ? "OFFLINE" : "ONLINE",
    cpu: Math.random() * 100,
    memory: Math.random() * 100,
    bandwidth: Math.random() * 1000,
    connections: Math.floor(Math.random() * 500),
    x,
    y,
  };
};

const INITIAL_NODES: NetworkNode[] = [
  generateNode("node-1", "JARVIS-CORE", "server", "NA", 0.2, 0.3),
  generateNode("node-2", "STARK-CDN", "cloud", "EU", 0.5, 0.2),
  generateNode("node-3", "TOKYO-EDGE", "router", "ASIA", 0.8, 0.4),
  generateNode("node-4", "SYDNEY-DB", "database", "OC", 0.85, 0.7),
  generateNode("node-5", "SAO-PAULO", "server", "SA", 0.3, 0.7),
  generateNode("node-6", "LONDON-FW", "firewall", "EU", 0.45, 0.35),
  generateNode("node-7", "MUMBAI-RELAY", "router", "ASIA", 0.7, 0.5),
  generateNode("node-8", "CAPE-TOWN", "client", "AF", 0.55, 0.8),
];

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

const formatBytes = (bytes: number): string => {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

const formatTime = (date: Date): string => {
  return date.toLocaleTimeString("en-US", { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit", fractionalSecondDigits: 3 });
};

const formatDuration = (seconds: number): string => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
};

// ============================================================================
// SUB-COMPONENTS - VISUALIZATION MODULES
// ============================================================================

// --- Animated Packet Stream (Wireshark Style) ---
const PacketStream: React.FC<{ packets: NetworkPacket[] }> = ({ packets }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0; // Auto-scroll to top for live feed
    }
  }, [packets]);

  const getStatusColor = (status: NetworkPacket["status"]) => {
    switch (status) {
      case "SUCCESS": return "text-green-400";
      case "DROPPED": return "text-red-400";
      case "PENDING": return "text-yellow-400";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-black/40 border border-cyan-500/30 rounded-2xl overflow-hidden backdrop-blur-xl shadow-[0_0_30px_rgba(6,182,212,0.2)]"
    >
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <Activity className="w-5 h-5 text-cyan-400" />
          <h3 className="text-sm font-bold text-white tracking-wider">LIVE PACKET STREAM</h3>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <span className="text-[10px] text-red-400 font-bold">CAPTURING</span>
        </div>
      </div>
      
      <div className="overflow-hidden">
        <div className="grid grid-cols-12 gap-2 px-6 py-2 bg-black/60 text-[10px] text-white/40 font-mono border-b border-white/5">
          <div className="col-span-1">TIME</div>
          <div className="col-span-2">SOURCE</div>
          <div className="col-span-2">DESTINATION</div>
          <div className="col-span-1">PROTO</div>
          <div className="col-span-1">LEN</div>
          <div className="col-span-2">INFO</div>
          <div className="col-span-1">FLAGS</div>
          <div className="col-span-1">GEO</div>
          <div className="col-span-1">STATUS</div>
        </div>
        
        <div ref={scrollRef} className="h-96 overflow-y-auto font-mono text-xs custom-scrollbar">
          <AnimatePresence initial={false}>
            {packets.slice(0, 50).map((packet) => (
              <motion.div
                key={packet.id}
                initial={{ opacity: 0, x: -20, backgroundColor: "rgba(6,182,212,0.2)" }}
                animate={{ opacity: 1, x: 0, backgroundColor: "rgba(0,0,0,0)" }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-12 gap-2 px-6 py-1.5 border-b border-white/5 hover:bg-white/5 transition-colors"
              >
                <div className="col-span-1 text-white/60">{formatTime(packet.timestamp).split(" ")[1]}</div>
                <div className="col-span-2 text-cyan-300">{packet.sourceIP}:{packet.sourcePort}</div>
                <div className="col-span-2 text-purple-300">{packet.destIP}:{packet.destPort}</div>
                <div className="col-span-1 font-bold" style={{ color: PROTOCOL_COLORS[packet.protocol] }}>{packet.protocol}</div>
                <div className="col-span-1 text-white/80">{packet.size}</div>
                <div className="col-span-2 text-white/60 truncate">{packet.payloadPreview}</div>
                <div className="col-span-1 text-[10px] text-yellow-400">{packet.flags.join(",")}</div>
                <div className="col-span-1 text-[10px] text-white/40">{packet.geoSource}→{packet.geoDest}</div>
                <div className={`col-span-1 font-bold ${getStatusColor(packet.status)}`}>{packet.status}</div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};

// --- Global Traffic Topology (Animated SVG) ---
const TrafficTopology: React.FC<{ nodes: NetworkNode[]; packets: NetworkPacket[] }> = ({ nodes, packets }) => {
  // Create connections between nodes for visualization
  const connections = useMemo(() => {
    const conns = [];
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        if (Math.random() > 0.4) { // 60% chance of connection
          conns.push({ source: nodes[i], target: nodes[j] });
        }
      }
    }
    return conns;
  }, [nodes]);

  // Simulate moving packets along connections
  const [movingPackets, setMovingPackets] = useState<Array<{ id: string; progress: number; connIndex: number; color: string }>>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      setMovingPackets(prev => {
        // Update existing
        const updated = prev.map(p => ({ ...p, progress: p.progress + 0.02 })).filter(p => p.progress < 1);
        // Add new
        if (Math.random() > 0.7 && connections.length > 0) {
          const connIdx = Math.floor(Math.random() * connections.length);
          const proto = PROTOCOLS[Math.floor(Math.random() * PROTOCOLS.length)];
          updated.push({
            id: `mp_${Date.now()}_${Math.random()}`,
            progress: 0,
            connIndex: connIdx,
            color: PROTOCOL_COLORS[proto],
          });
        }
        return updated;
      });
    }, 50);
    return () => clearInterval(interval);
  }, [connections]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-black/40 border border-purple-500/30 rounded-2xl overflow-hidden backdrop-blur-xl shadow-[0_0_30px_rgba(168,85,247,0.2)] relative"
      style={{ height: "500px" }}
    >
      <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-6 py-4 border-b border-white/10 bg-black/40 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <Globe className="w-5 h-5 text-purple-400" />
          <h3 className="text-sm font-bold text-white tracking-wider">GLOBAL TRAFFIC TOPOLOGY</h3>
        </div>
        <div className="flex gap-4 text-[10px]">
          {Object.entries(PROTOCOL_COLORS).slice(0, 5).map(([proto, color]) => (
            <div key={proto} className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
              <span className="text-white/60">{proto}</span>
            </div>
          ))}
        </div>
      </div>

      <svg className="w-full h-full absolute inset-0" viewBox="0 0 100 100" preserveAspectRatio="none">
        <defs>
          <radialGradient id="nodeGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(168,85,247,0.8)" stopOpacity="1" />
            <stop offset="100%" stopColor="rgba(168,85,247,0)" stopOpacity="0" />
          </radialGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="0.5" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Grid Background */}
        <pattern id="grid" width="5" height="5" patternUnits="userSpaceOnUse">
          <path d="M 5 0 L 0 0 0 5" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="0.1" />
        </pattern>
        <rect width="100" height="100" fill="url(#grid)" />

        {/* Connections */}
        {connections.map((conn, i) => (
          <line
            key={`conn-${i}`}
            x1={conn.source.x * 100}
            y1={conn.source.y * 100}
            x2={conn.target.x * 100}
            y2={conn.target.y * 100}
            stroke="rgba(168,85,247,0.2)"
            strokeWidth="0.2"
            strokeDasharray="1 1"
          />
        ))}

        {/* Moving Packets */}
        {movingPackets.map((mp) => {
          const conn = connections[mp.connIndex];
          if (!conn) return null;
          const x = conn.source.x * 100 + (conn.target.x * 100 - conn.source.x * 100) * mp.progress;
          const y = conn.source.y * 100 + (conn.target.y * 100 - conn.source.y * 100) * mp.progress;
          return (
            <circle
              key={mp.id}
              cx={x}
              cy={y}
              r="0.8"
              fill={mp.color}
              filter="url(#glow)"
            />
          );
        })}

        {/* Nodes */}
        {nodes.map((node) => (
          <g key={node.id}>
            <circle cx={node.x * 100} cy={node.y * 100} r="4" fill="url(#nodeGlow)" opacity="0.5" />
            <circle
              cx={node.x * 100}
              cy={node.y * 100}
              r="1.5"
              fill={node.status === "ONLINE" ? "#06b6d4" : node.status === "DEGRADED" ? "#f59e0b" : "#ef4444"}
              stroke="white"
              strokeWidth="0.2"
            />
            <text x={node.x * 100} y={node.y * 100 - 3} fill="white" fontSize="1.5" textAnchor="middle" fontWeight="bold">
              {node.name}
            </text>
            <text x={node.x * 100} y={node.y * 100 + 4} fill="rgba(255,255,255,0.5)" fontSize="1" textAnchor="middle">
              {node.ip}
            </text>
          </g>
        ))}
      </svg>
    </motion.div>
  );
};

// --- Bandwidth Monitor Chart ---
const BandwidthMonitor: React.FC<{ metrics: TrafficMetric[] }> = ({ metrics }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-black/40 border border-green-500/30 rounded-2xl p-6 backdrop-blur-xl shadow-[0_0_30px_rgba(34,197,94,0.2)]"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Activity className="w-5 h-5 text-green-400" />
          <h3 className="text-sm font-bold text-white tracking-wider">BANDWIDTH THROUGHPUT</h3>
        </div>
        <div className="flex gap-4 text-xs">
          <div className="flex items-center gap-2">
            <ArrowUpRight className="w-3 h-3 text-cyan-400" />
            <span className="text-cyan-400 font-bold">{metrics[metrics.length - 1]?.upload.toFixed(1) || 0} Mbps</span>
          </div>
          <div className="flex items-center gap-2">
            <ArrowDownRight className="w-3 h-3 text-purple-400" />
            <span className="text-purple-400 font-bold">{metrics[metrics.length - 1]?.download.toFixed(1) || 0} Mbps</span>
          </div>
        </div>
      </div>
      
      <RechartsResponsiveContainer width="100%" height={200}>
        <RechartsAreaChart data={metrics}>
          <defs>
            <linearGradient id="colorUpload" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorDownload" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#a855f7" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis dataKey="timestamp" stroke="rgba(255,255,255,0.3)" tick={{ fontSize: 10 }} />
          <YAxis stroke="rgba(255,255,255,0.3)" tick={{ fontSize: 10 }} />
          <RechartsTooltip
            contentStyle={{ backgroundColor: "rgba(0,0,0,0.9)", border: "1px solid rgba(34,197,94,0.3)", borderRadius: "8px", color: "white" }}
          />
          <Area type="monotone" dataKey="upload" stroke="#06b6d4" fillOpacity={1} fill="url(#colorUpload)" name="Upload" />
          <Area type="monotone" dataKey="download" stroke="#a855f7" fillOpacity={1} fill="url(#colorDownload)" name="Download" />
        </RechartsAreaChart>
      </RechartsResponsiveContainer>
    </motion.div>
  );
};

// --- Protocol Distribution Radar ---
const ProtocolRadar: React.FC<{ stats: ProtocolStat[] }> = ({ stats }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-black/40 border border-yellow-500/30 rounded-2xl p-6 backdrop-blur-xl shadow-[0_0_30px_rgba(234,179,8,0.2)]"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <RechartsPie className="w-5 h-5 text-yellow-400" />
          <h3 className="text-sm font-bold text-white tracking-wider">PROTOCOL DISTRIBUTION</h3>
        </div>
      </div>
      
      <RechartsResponsiveContainer width="100%" height={250}>
        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={stats}>
          <PolarGrid stroke="rgba(255,255,255,0.1)" />
          <PolarAngleAxis dataKey="name" tick={{ fill: "rgba(255,255,255,0.6)", fontSize: 10 }} />
          <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
          <RechartsRadar name="Packets" dataKey="value" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.4} />
          <RechartsTooltip
            contentStyle={{ backgroundColor: "rgba(0,0,0,0.9)", border: "1px solid rgba(234,179,8,0.3)", borderRadius: "8px", color: "white" }}
          />
        </RadarChart>
      </RechartsResponsiveContainer>
    </motion.div>
  );
};

// --- Active Connections Table ---
const ActiveConnections: React.FC<{ connections: ActiveConnection[] }> = ({ connections }) => {
  const getStateColor = (state: ConnectionState) => {
    switch (state) {
      case "ESTABLISHED": return "text-green-400";
      case "LISTEN": return "text-blue-400";
      case "TIME_WAIT": return "text-yellow-400";
      case "CLOSE_WAIT": return "text-orange-400";
      default: return "text-white/60";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-black/40 border border-blue-500/30 rounded-2xl overflow-hidden backdrop-blur-xl shadow-[0_0_30px_rgba(59,130,246,0.2)]"
    >
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <Network className="w-5 h-5 text-blue-400" />
          <h3 className="text-sm font-bold text-white tracking-wider">ACTIVE CONNECTIONS</h3>
        </div>
        <Badge variant="info">{connections.length} Active</Badge>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-xs font-mono">
          <thead className="bg-black/60 text-white/40">
            <tr>
              <th className="text-left px-6 py-2">LOCAL ADDRESS</th>
              <th className="text-left px-6 py-2">FOREIGN ADDRESS</th>
              <th className="text-left px-6 py-2">PROTO</th>
              <th className="text-left px-6 py-2">STATE</th>
              <th className="text-left px-6 py-2">PID/PROCESS</th>
              <th className="text-right px-6 py-2">SENT</th>
              <th className="text-right px-6 py-2">RECV</th>
            </tr>
          </thead>
          <tbody>
            {connections.slice(0, 15).map((conn) => (
              <tr key={conn.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                <td className="px-6 py-2 text-cyan-300">{conn.localIP}:{conn.localPort}</td>
                <td className="px-6 py-2 text-purple-300">{conn.remoteIP}:{conn.remotePort}</td>
                <td className="px-6 py-2 font-bold" style={{ color: PROTOCOL_COLORS[conn.protocol] }}>{conn.protocol}</td>
                <td className={`px-6 py-2 font-bold ${getStateColor(conn.state)}`}>{conn.state}</td>
                <td className="px-6 py-2 text-white/80">{conn.pid}/{conn.processName}</td>
                <td className="px-6 py-2 text-right text-green-400">{formatBytes(conn.sentBytes)}</td>
                <td className="px-6 py-2 text-right text-blue-400">{formatBytes(conn.recvBytes)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
};

// --- Network Alerts Feed ---
const AlertFeed: React.FC<{ alerts: NetworkAlert[] }> = ({ alerts }) => {
  const getSeverityColor = (severity: AlertSeverity) => {
    switch (severity) {
      case "CRITICAL": return "text-red-400 bg-red-500/20 border-red-500/50";
      case "HIGH": return "text-orange-400 bg-orange-500/20 border-orange-500/50";
      case "MEDIUM": return "text-yellow-400 bg-yellow-500/20 border-yellow-500/50";
      case "LOW": return "text-blue-400 bg-blue-500/20 border-blue-500/50";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-black/40 border border-red-500/30 rounded-2xl p-6 backdrop-blur-xl shadow-[0_0_30px_rgba(239,68,68,0.2)]"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-red-400" />
          <h3 className="text-sm font-bold text-white tracking-wider">SECURITY ALERTS</h3>
        </div>
        <Badge variant="error" pulse>{alerts.filter(a => !a.resolved).length} Unresolved</Badge>
      </div>
      
      <div className="space-y-3 max-h-80 overflow-y-auto custom-scrollbar">
        {alerts.slice(0, 10).map((alert) => (
          <motion.div
            key={alert.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className={`p-3 rounded-lg border ${getSeverityColor(alert.severity)} ${alert.resolved ? "opacity-50" : ""}`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold">{alert.type.replace(/_/g, " ")}</span>
              <span className="text-[10px] text-white/60">{formatTime(alert.timestamp)}</span>
            </div>
            <div className="text-xs text-white/80 mb-1">{alert.message}</div>
            <div className="flex items-center justify-between text-[10px] text-white/60">
              <span>SRC: {alert.sourceIP}</span>
              {alert.resolved && <span className="text-green-400">RESOLVED</span>}
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

// --- Top Talkers List ---
const TopTalkers: React.FC<{ talkers: TopTalker[] }> = ({ talkers }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-black/40 border border-pink-500/30 rounded-2xl p-6 backdrop-blur-xl shadow-[0_0_30px_rgba(236,72,153,0.2)]"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Users className="w-5 h-5 text-pink-400" />
          <h3 className="text-sm font-bold text-white tracking-wider">TOP TALKERS</h3>
        </div>
      </div>
      
      <div className="space-y-4">
        {talkers.slice(0, 8).map((talker, i) => (
          <div key={talker.ip} className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-[10px] font-bold text-white">
              {i + 1}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-mono text-cyan-300 truncate">{talker.ip}</span>
                <span className="text-[10px] text-white/40">{REGION_NAMES[talker.region]}</span>
              </div>
              <div className="h-1 bg-black/50 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-pink-500 to-purple-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min((talker.sentBytes / 1000000) * 10, 100)}%` }}
                  transition={{ duration: 1 }}
                />
              </div>
              <div className="flex justify-between mt-1 text-[10px] text-white/60">
                <span>{formatBytes(talker.sentBytes)} sent</span>
                <span className="text-pink-400">{talker.topProtocol}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

// Simple Badge component for internal use
const Badge: React.FC<{ children: React.ReactNode; variant?: "default" | "success" | "warning" | "error" | "info"; pulse?: boolean }> = ({ children, variant = "default", pulse = false }) => {
  const variants = {
    default: "bg-white/10 text-white/70 border-white/20",
    success: "bg-green-500/20 text-green-400 border-green-500/30",
    warning: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    error: "bg-red-500/20 text-red-400 border-red-500/30",
    info: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
  };
  return (
    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${variants[variant]} ${pulse ? "animate-pulse" : ""}`}>
      {children}
    </span>
  );
};

// ============================================================================
// MAIN NETWORK MONITOR COMPONENT
// ============================================================================

export default function NetworkMonitor() {
  const [packets, setPackets] = useState<NetworkPacket[]>([]);
  const [nodes] = useState<NetworkNode[]>(INITIAL_NODES);
  const [connections, setConnections] = useState<ActiveConnection[]>([]);
  const [metrics, setMetrics] = useState<TrafficMetric[]>([]);
  const [protocolStats, setProtocolStats] = useState<ProtocolStat[]>([]);
  const [alerts, setAlerts] = useState<NetworkAlert[]>([]);
  const [topTalkers, setTopTalkers] = useState<TopTalker[]>([]);
  const [isLive, setIsLive] = useState(true);
  const [totalPackets, setTotalPackets] = useState(0);
  const [totalBytes, setTotalBytes] = useState(0);
  const [avgLatency, setAvgLatency] = useState(0);

  // Initialize Protocol Stats
  useEffect(() => {
    const stats: ProtocolStat[] = PROTOCOLS.map((proto, i) => ({
      name: proto,
      value: Math.random() * 100,
      color: PROTOCOL_COLORS[proto],
      packets: 0,
      bytes: 0,
    }));
    setProtocolStats(stats);
  }, []);

  // Live Data Simulation
  useEffect(() => {
    if (!isLive) return;

    const packetInterval = setInterval(() => {
      const newPacket = generatePacket();
      setPackets(prev => [newPacket, ...prev].slice(0, 200));
      setTotalPackets(prev => prev + 1);
      setTotalBytes(prev => prev + newPacket.size);
      setAvgLatency(prev => (prev * 0.9) + (newPacket.latency * 0.1));
      
      // Update protocol stats
      setProtocolStats(prev => prev.map(s => 
        s.name === newPacket.protocol 
          ? { ...s, value: s.value + 1, packets: s.packets + 1, bytes: s.bytes + newPacket.size }
          : s
      ));
    }, 200);

    const metricInterval = setInterval(() => {
      const now = new Date();
      const timestamp = now.toLocaleTimeString("en-US", { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" });
      const newMetric: TrafficMetric = {
        timestamp,
        upload: Math.random() * 500 + 100,
        download: Math.random() * 1000 + 200,
        packetsPerSec: Math.floor(Math.random() * 10000) + 5000,
        errors: Math.floor(Math.random() * 10),
        dropped: Math.floor(Math.random() * 5),
      };
      setMetrics(prev => [...prev, newMetric].slice(0, 30));
    }, 1000);

    const connectionInterval = setInterval(() => {
      const newConn: ActiveConnection = {
        id: `conn_${Date.now()}_${Math.random()}`,
        localIP: "192.168.1.100",
        localPort: Math.floor(Math.random() * 65535),
        remoteIP: generateIP(),
        remotePort: [80, 443, 22, 53, 8080][Math.floor(Math.random() * 5)],
        protocol: PROTOCOLS[Math.floor(Math.random() * PROTOCOLS.length)],
        state: CONNECTION_STATES[Math.floor(Math.random() * CONNECTION_STATES.length)],
        pid: Math.floor(Math.random() * 32768),
        processName: ["chrome", "node", "python", "jarvis_core", "ollama"][Math.floor(Math.random() * 5)],
        sentBytes: Math.floor(Math.random() * 10000000),
        recvBytes: Math.floor(Math.random() * 50000000),
        duration: Math.floor(Math.random() * 86400),
      };
      setConnections(prev => [newConn, ...prev].slice(0, 50));
    }, 2000);

    const alertInterval = setInterval(() => {
      if (Math.random() > 0.7) {
        const newAlert: NetworkAlert = {
          id: `alert_${Date.now()}`,
          timestamp: new Date(),
          severity: SEVERITIES[Math.floor(Math.random() * SEVERITIES.length)],
          type: ALERT_TYPES[Math.floor(Math.random() * ALERT_TYPES.length)],
          sourceIP: generateIP(),
          message: `${ALERT_TYPES[Math.floor(Math.random() * ALERT_TYPES.length)]} detected from external source.`,
          resolved: Math.random() > 0.5,
        };
        setAlerts(prev => [newAlert, ...prev].slice(0, 20));
      }
    }, 5000);

    const talkerInterval = setInterval(() => {
      const talkers: TopTalker[] = Array.from({ length: 8 }, () => ({
        ip: generateIP(),
        region: REGIONS[Math.floor(Math.random() * REGIONS.length)],
        sentBytes: Math.floor(Math.random() * 10000000),
        recvBytes: Math.floor(Math.random() * 50000000),
        packets: Math.floor(Math.random() * 100000),
        topProtocol: PROTOCOLS[Math.floor(Math.random() * PROTOCOLS.length)],
      })).sort((a, b) => b.sentBytes - a.sentBytes);
      setTopTalkers(talkers);
    }, 10000);

    return () => {
      clearInterval(packetInterval);
      clearInterval(metricInterval);
      clearInterval(connectionInterval);
      clearInterval(alertInterval);
      clearInterval(talkerInterval);
    };
  }, [isLive]);

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
            <Network className="w-8 h-8 text-cyan-400" />
            <div>
              <h2 className="text-2xl font-black text-white tracking-wider">NETWORK COMMAND CENTER</h2>
              <p className="text-xs text-white/60">Real-time Packet Analysis • Global Topology • Threat Detection</p>
            </div>
          </div>
          <button
            onClick={() => setIsLive(!isLive)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              isLive ? "bg-green-500/20 text-green-400 border border-green-500/50" : "bg-red-500/20 text-red-400 border border-red-500/50"
            }`}
          >
            <div className={`w-2 h-2 rounded-full ${isLive ? "bg-green-400 animate-pulse" : "bg-red-400"}`} />
            {isLive ? "LIVE CAPTURE" : "PAUSED"}
          </button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          <div className="bg-black/30 rounded-lg p-3 border border-white/5">
            <div className="text-[10px] text-white/40 mb-1">TOTAL PACKETS</div>
            <div className="text-lg font-bold text-cyan-400">{totalPackets.toLocaleString()}</div>
          </div>
          <div className="bg-black/30 rounded-lg p-3 border border-white/5">
            <div className="text-[10px] text-white/40 mb-1">TOTAL BYTES</div>
            <div className="text-lg font-bold text-purple-400">{formatBytes(totalBytes)}</div>
          </div>
          <div className="bg-black/30 rounded-lg p-3 border border-white/5">
            <div className="text-[10px] text-white/40 mb-1">AVG LATENCY</div>
            <div className="text-lg font-bold text-green-400">{avgLatency.toFixed(1)} ms</div>
          </div>
          <div className="bg-black/30 rounded-lg p-3 border border-white/5">
            <div className="text-[10px] text-white/40 mb-1">ACTIVE NODES</div>
            <div className="text-lg font-bold text-yellow-400">{nodes.filter(n => n.status === "ONLINE").length}/{nodes.length}</div>
          </div>
          <div className="bg-black/30 rounded-lg p-3 border border-white/5">
            <div className="text-[10px] text-white/40 mb-1">CONNECTIONS</div>
            <div className="text-lg font-bold text-blue-400">{connections.length}</div>
          </div>
          <div className="bg-black/30 rounded-lg p-3 border border-white/5">
            <div className="text-[10px] text-white/40 mb-1">ALERTS</div>
            <div className="text-lg font-bold text-red-400">{alerts.filter(a => !a.resolved).length}</div>
          </div>
        </div>
      </motion.div>

      {/* Main Grid */}
      <div className="grid grid-cols-12 gap-6">
        {/* Left Column */}
        <div className="col-span-12 lg:col-span-8 space-y-6">
          <TrafficTopology nodes={nodes} packets={packets} />
          <PacketStream packets={packets} />
          <BandwidthMonitor metrics={metrics} />
          <ActiveConnections connections={connections} />
        </div>

        {/* Right Column */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
          <ProtocolRadar stats={protocolStats} />
          <TopTalkers talkers={topTalkers} />
          <AlertFeed alerts={alerts} />
        </div>
      </div>
    </div>
  );
}