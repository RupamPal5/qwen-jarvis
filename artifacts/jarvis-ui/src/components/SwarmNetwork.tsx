"use client";
import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import {
  motion, AnimatePresence
} from "framer-motion";
import {
  Network, Cpu, Zap, Globe, Server, Database, Activity, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, CheckCircle, XCircle, AlertTriangle, Clock, Timer, RefreshCw, Settings, MoreVertical, ChevronDown, ChevronRight, Plus, Minus, Volume2, VolumeX, Bell, BellOff, Star, StarOff, Bookmark, BookmarkCheck, Info, HelpCircle, Layers, GitBranch, GitCommit, GitPullRequest, HardDrive, MemoryStick, Thermometer, Radio, Signal, Wifi, WifiOff, Lock, Unlock, Key, Fingerprint, Scan, QrCode, MapPin, Navigation, Compass, Calendar, CalendarDays, CalendarCheck, CalendarClock, AlarmClock, BellRing, MessageCircle, Send, Move, Move3d, MoveDiagonal, MoveHorizontal, MoveVertical, ZoomIn, ZoomOut, Focus, Target, Crosshair, Locate, LocateFixed, Building, Hospital, School, University, Church, TreePalm, Leaf, Sprout, Wheat, Dumbbell, Weight, Scale, Ruler, Hammer, Wrench, Nut, Bolt, Settings2, Sliders, SlidersHorizontal, ToggleLeft, ToggleRight, Delete, Trash, Trash2, Archive, ArchiveRestore, Inbox, View, SortAsc, SortDesc, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, RotateCw, RotateCcw, Rotate3d, FlipHorizontal, FlipVertical, Maximize, Minimize, Expand, Fullscreen, Eye, EyeOff, Brain, Shield, Terminal, Code, MessageSquare, BarChart3, Users, User, UserCheck, UserX, UserPlus, UserMinus, Share2, Link as LinkIcon, Unlink, Copy, Clipboard, Scissors, Save, FolderOpen, File, FileCode, Grid, Grid3X3, Columns, Rows, List, ListOrdered, CheckSquare, Square, Circle, Triangle, Sun, Moon, CloudRain, CloudSnow, Flame, Snowflake, Umbrella, TimerOff, TimerReset, MessagesSquare, SendHorizontal, Navigation2, Map, MapPinned, Globe2, Earth, Satellite, SatelliteDish, Rocket, Plane, Train, Bus, Car, Bike, Footprints, PersonStanding
} from "lucide-react";
import {
  LineChart as RechartsLineChart, Line as RechartsLine, XAxis as RechartsXAxis, YAxis as RechartsYAxis, CartesianGrid as RechartsCartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer as RechartsResponsiveContainer, AreaChart as RechartsAreaChart, Area as RechartsArea, BarChart as RechartsBarChart, Bar as RechartsBar, PieChart as RechartsPieChart, Pie as RechartsPie, Cell as RechartsCell, ComposedChart as RechartsComposedChart, ReferenceLine as RechartsReferenceLine, Legend as RechartsLegend, RadialBarChart, RadialBar, ScatterChart as RechartsScatterChart, Scatter as RechartsScatter, ZAxis as RechartsZAxis
} from "recharts";
import {
  useStore
} from "../store";

// ============================================================================
// TYPE DEFINITIONS — SWARM NETWORK DATA STRUCTURES
// ============================================================================

interface SwarmNode {
  id: string;
  name: string;
  location: string;
  country: string;
  continent: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  status: "ONLINE" | "OFFLINE" | "SYNCING" | "PROCESSING" | "ERROR" | "MAINTENANCE";
  type: "PRIMARY" | "SECONDARY" | "RELAY" | "EDGE" | "QUANTUM";
  capabilities: string[];
  specs: {
    cpu: number;
    memory: number;
    storage: number;
    bandwidth: number;
    gpu?: number;
    tpu?: number;
  };
  metrics: {
    cpuUsage: number;
    memoryUsage: number;
    storageUsage: number;
    bandwidthUsage: number;
    temperature: number;
    uptime: number;
    latency: number;
    packetLoss: number;
    jitter: number;
    throughput: number;
  };
  tasks: {
    total: number;
    completed: number;
    failed: number;
    pending: number;
    inProgress: number;
  };
  connections: string[];
  lastSeen: Date;
  joinedAt: Date;
  version: string;
  os: string;
  architecture: string;
  securityLevel: number;
  trustScore: number;
  reputation: number;
  tags: string[];
  metadata: {
    provider?: string;
    region?: string;
    datacenter?: string;
    rack?: string;
    slot?: string;
  };
}

interface NetworkTopology {
  nodes: SwarmNode[];
  connections: NetworkConnection[];
  clusters: NetworkCluster[];
  metrics: NetworkMetrics;
}

interface NetworkConnection {
  id: string;
  source: string;
  target: string;
  latency: number;
  bandwidth: number;
  packetLoss: number;
  status: "ACTIVE" | "DEGRADED" | "INACTIVE";
  protocol: "TCP" | "UDP" | "QUIC" | "CUSTOM";
  encrypted: boolean;
  compression: boolean;
  lastPing: Date;
}

interface NetworkCluster {
  id: string;
  name: string;
  region: string;
  nodes: string[];
  primaryNode: string;
  status: "HEALTHY" | "DEGRADED" | "CRITICAL";
  metrics: {
    avgLatency: number;
    totalThroughput: number;
    activeTasks: number;
  };
}

interface NetworkMetrics {
  totalNodes: number;
  onlineNodes: number;
  offlineNodes: number;
  avgLatency: number;
  totalThroughput: number;
  activeTasks: number;
  completedTasks: number;
  failedTasks: number;
  networkHealth: number;
  securityScore: number;
  efficiency: number;
  redundancy: number;
  scalability: number;
  reliability: number;
  performance: number;
  costEfficiency: number;
  energyEfficiency: number;
  carbonFootprint: number;
  uptime: number;
  mtbf: number;
  mttr: number;
  availability: number;
  consistency: number;
  partitionTolerance: number;
}

interface TaskDistribution {
  id: string;
  name: string;
  description: string;
  priority: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  status: "PENDING" | "ASSIGNED" | "RUNNING" | "COMPLETED" | "FAILED" | "CANCELLED";
  assignedNode?: string;
  progress: number;
  startedAt?: Date;
  completedAt?: Date;
  estimatedDuration: number;
  actualDuration?: number;
  dependencies: string[];
  tags: string[];
  metadata: {
    type: string;
    complexity: number;
    resourceRequirements: {
      cpu: number;
      memory: number;
      gpu?: number;
    };
  };
}

interface SwarmIntelligence {
  collectiveDecision: string;
  consensus: number;
  diversity: number;
  adaptability: number;
  learning: number;
  innovation: number;
  collaboration: number;
  emergence: number;
  selfOrganization: number;
  robustness: number;
  flexibility: number;
  scalability: number;
  efficiency: number;
  resilience: number;
  autonomy: number;
}

interface CommunicationLog {
  id: string;
  timestamp: Date;
  source: string;
  target: string;
  type: "REQUEST" | "RESPONSE" | "BROADCAST" | "SYNC" | "HEARTBEAT" | "ALERT";
  payload: string;
  size: number;
  latency: number;
  status: "SUCCESS" | "FAILED" | "TIMEOUT";
  encrypted: boolean;
  compressed: boolean;
}

interface Alert {
  id: string;
  timestamp: Date;
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "INFO";
  type: "NODE_OFFLINE" | "HIGH_LATENCY" | "TASK_FAILED" | "SECURITY_BREACH" | "RESOURCE_EXHAUSTION" | "NETWORK_PARTITION" | "DATA_CORRUPTION" | "PERFORMANCE_DEGRADATION";
  message: string;
  affectedNodes: string[];
  acknowledged: boolean;
  resolved: boolean;
  resolution?: string;
  resolvedAt?: Date;
}

// ============================================================================
// UTILITY FUNCTIONS — NETWORK CALCULATIONS
// ============================================================================

const calculateHaversineDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const estimateLatency = (distance: number): number => {
  // Speed of light in fiber optic cable: ~200,000 km/s
  // Add processing overhead: ~20ms
  const speedOfLight = 200000;
  const propagationDelay = (distance / speedOfLight) * 1000;
  const processingOverhead = 20;
  const queuingDelay = Math.random() * 10;
  return propagationDelay + processingOverhead + queuingDelay;
};

const calculateNetworkHealth = (nodes: SwarmNode[]): number => {
  if (nodes.length === 0) return 0;
  const onlineNodes = nodes.filter((n) => n.status === "ONLINE").length;
  const avgTrustScore =
    nodes.reduce((sum, n) => sum + n.trustScore, 0) / nodes.length;
  const avgUptime =
    nodes.reduce((sum, n) => sum + n.metrics.uptime, 0) / nodes.length;
  return ((onlineNodes / nodes.length) * 40 + avgTrustScore * 0.3 + avgUptime * 0.3);
};

const calculateEfficiency = (nodes: SwarmNode[]): number => {
  if (nodes.length === 0) return 0;
  const avgCpuUsage =
    nodes.reduce((sum, n) => sum + n.metrics.cpuUsage, 0) / nodes.length;
  const avgMemoryUsage =
    nodes.reduce((sum, n) => sum + n.metrics.memoryUsage, 0) / nodes.length;
  const taskCompletionRate =
    nodes.reduce((sum, n) => sum + (n.tasks.completed / n.tasks.total || 0), 0) /
    nodes.length;
  return (
    (100 - avgCpuUsage) * 0.3 +
    (100 - avgMemoryUsage) * 0.3 +
    taskCompletionRate * 100 * 0.4
  );
};

const calculateRedundancy = (nodes: SwarmNode[], connections: NetworkConnection[]): number => {
  if (nodes.length === 0) return 0;
  const avgConnections =
    connections.length / nodes.length;
  const minConnections = Math.min(...nodes.map((n) => n.connections.length));
  return Math.min(avgConnections * 10, minConnections * 20, 100);
};

const calculateScalability = (nodes: SwarmNode[]): number => {
  const typeDistribution = nodes.reduce(
    (acc, n) => {
      acc[n.type] = (acc[n.type] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );
  const primaryRatio = (typeDistribution.PRIMARY || 0) / nodes.length;
  const edgeRatio = (typeDistribution.EDGE || 0) / nodes.length;
  return (1 - primaryRatio) * 50 + edgeRatio * 50;
};

const formatLatency = (ms: number): string => {
  if (ms < 1) return `${(ms * 1000).toFixed(0)}μs`;
  if (ms < 1000) return `${ms.toFixed(1)}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
};

const formatThroughput = (mbps: number): string => {
  if (mbps < 1000) return `${mbps.toFixed(1)} Mbps`;
  return `${(mbps / 1000).toFixed(2)} Gbps`;
};

const formatUptime = (hours: number): string => {
  const days = Math.floor(hours / 24);
  const hrs = Math.floor(hours % 24);
  if (days > 0) return `${days}d ${hrs}h`;
  return `${hrs}h`;
};

const getStatusColor = (status: string): string => {
  switch (status) {
    case "ONLINE":
    case "HEALTHY":
    case "SUCCESS":
      return "text-green-400";
    case "OFFLINE":
    case "CRITICAL":
    case "FAILED":
      return "text-red-400";
    case "SYNCING":
    case "PROCESSING":
    case "DEGRADED":
      return "text-yellow-400";
    case "ERROR":
    case "MAINTENANCE":
      return "text-orange-400";
    default:
      return "text-white/60";
  }
};

const getStatusBg = (status: string): string => {
  switch (status) {
    case "ONLINE":
    case "HEALTHY":
    case "SUCCESS":
      return "bg-green-500/20 border-green-500/50";
    case "OFFLINE":
    case "CRITICAL":
    case "FAILED":
      return "bg-red-500/20 border-red-500/50";
    case "SYNCING":
    case "PROCESSING":
    case "DEGRADED":
      return "bg-yellow-500/20 border-yellow-500/50";
    case "ERROR":
    case "MAINTENANCE":
      return "bg-orange-500/20 border-orange-500/50";
    default:
      return "bg-white/5 border-white/20";
  }
};

// ============================================================================
// DATA SIMULATION — REALISTIC SWARM NETWORK GENERATOR
// ============================================================================

const LOCATIONS = [
  { city: "Tokyo", country: "Japan", continent: "Asia", lat: 35.6762, lon: 139.6503 },
  { city: "London", country: "UK", continent: "Europe", lat: 51.5074, lon: -0.1278 },
  { city: "New York", country: "USA", continent: "North America", lat: 40.7128, lon: -74.006 },
  { city: "Singapore", country: "Singapore", continent: "Asia", lat: 1.3521, lon: 103.8198 },
  { city: "Berlin", country: "Germany", continent: "Europe", lat: 52.52, lon: 13.405 },
  { city: "Sydney", country: "Australia", continent: "Oceania", lat: -33.8688, lon: 151.2093 },
  { city: "São Paulo", country: "Brazil", continent: "South America", lat: -23.5505, lon: -46.6333 },
  { city: "Mumbai", country: "India", continent: "Asia", lat: 19.076, lon: 72.8777 },
  { city: "Dubai", country: "UAE", continent: "Asia", lat: 25.2048, lon: 55.2708 },
  { city: "Toronto", country: "Canada", continent: "North America", lat: 43.6511, lon: -79.347 },
  { city: "Seoul", country: "South Korea", continent: "Asia", lat: 37.5665, lon: 126.978 },
  { city: "Amsterdam", country: "Netherlands", continent: "Europe", lat: 52.3676, lon: 4.9041 },
];

const NODE_TYPES: SwarmNode["type"][] = ["PRIMARY", "SECONDARY", "RELAY", "EDGE", "QUANTUM"];
const NODE_STATUSES: SwarmNode["status"][] = ["ONLINE", "ONLINE", "ONLINE", "PROCESSING", "SYNCING", "OFFLINE"];
const CAPABILITIES = [
  "AI_INFERENCE",
  "MODEL_TRAINING",
  "DATA_PROCESSING",
  "REAL_TIME_ANALYTICS",
  "BLOCKCHAIN_VALIDATION",
  "QUANTUM_COMPUTING",
  "EDGE_COMPUTING",
  "STREAM_PROCESSING",
  "GRAPH_COMPUTATION",
  "NEURAL_SEARCH",
];

const generateSwarmNodes = (count = 12): SwarmNode[] => {
  return Array.from({ length: count }, (_, i) => {
    const location = LOCATIONS[i % LOCATIONS.length];
    const type = NODE_TYPES[i % NODE_TYPES.length];
    const status = NODE_STATUSES[i % NODE_STATUSES.length];
    const uptime = Math.random() * 8760 + 240; // 10 days to 1 year
    const totalTasks = Math.floor(Math.random() * 10000) + 1000;
    const completedTasks = Math.floor(totalTasks * (0.85 + Math.random() * 0.14));

    return {
      id: `node-${String(i + 1).padStart(2, "0")}`,
      name: `${location.city}-${type.toLowerCase()}`,
      location: location.city,
      country: location.country,
      continent: location.continent,
      coordinates: {
        latitude: location.lat + (Math.random() - 0.5) * 0.1,
        longitude: location.lon + (Math.random() - 0.5) * 0.1,
      },
      status,
      type,
      capabilities: CAPABILITIES.sort(() => Math.random() - 0.5).slice(0, Math.floor(Math.random() * 4) + 3),
      specs: {
        cpu: type === "PRIMARY" ? 128 : type === "QUANTUM" ? 256 : 64,
        memory: type === "PRIMARY" ? 512 : type === "QUANTUM" ? 1024 : 256,
        storage: type === "PRIMARY" ? 10000 : 5000,
        bandwidth: type === "PRIMARY" ? 10000 : 1000,
        gpu: type === "QUANTUM" ? 16 : type === "PRIMARY" ? 8 : 4,
      },
      metrics: {
        cpuUsage: status === "OFFLINE" ? 0 : Math.random() * 80 + 10,
        memoryUsage: status === "OFFLINE" ? 0 : Math.random() * 70 + 20,
        storageUsage: Math.random() * 60 + 20,
        bandwidthUsage: status === "OFFLINE" ? 0 : Math.random() * 80 + 10,
        temperature: status === "OFFLINE" ? 20 : Math.random() * 30 + 40,
        uptime: status === "OFFLINE" ? 0 : uptime,
        latency: status === "OFFLINE" ? 999 : Math.random() * 100 + 10,
        packetLoss: status === "OFFLINE" ? 100 : Math.random() * 2,
        jitter: status === "OFFLINE" ? 50 : Math.random() * 10,
        throughput: status === "OFFLINE" ? 0 : Math.random() * 1000 + 100,
      },
      tasks: {
        total: totalTasks,
        completed: completedTasks,
        failed: Math.floor((totalTasks - completedTasks) * 0.3),
        pending: Math.floor(Math.random() * 100),
        inProgress: Math.floor(Math.random() * 50),
      },
      connections: [],
      lastSeen: status === "OFFLINE" ? new Date(Date.now() - Math.random() * 86400000) : new Date(),
      joinedAt: new Date(Date.now() - Math.random() * 31536000000),
      version: `v${Math.floor(Math.random() * 3) + 1}.${Math.floor(Math.random() * 10)}.${Math.floor(Math.random() * 100)}`,
      os: ["Ubuntu 22.04", "Debian 11", "CentOS 9", "Alpine Linux"][Math.floor(Math.random() * 4)],
      architecture: ["x86_64", "ARM64", "RISC-V"][Math.floor(Math.random() * 3)],
      securityLevel: Math.floor(Math.random() * 20) + 80,
      trustScore: Math.random() * 30 + 70,
      reputation: Math.random() * 20 + 80,
      tags: [type.toLowerCase(), location.continent.toLowerCase(), status.toLowerCase()],
      metadata: {
        provider: ["AWS", "GCP", "Azure", "DigitalOcean", "Bare Metal"][Math.floor(Math.random() * 5)],
        region: `${location.continent}-${location.city}`,
        datacenter: `DC-${Math.floor(Math.random() * 10) + 1}`,
        rack: `R${Math.floor(Math.random() * 20) + 1}`,
        slot: `S${Math.floor(Math.random() * 40) + 1}`,
      },
    };
  });
};

const generateNetworkConnections = (nodes: SwarmNode[]): NetworkConnection[] => {
  const connections: NetworkConnection[] = [];
  const protocols: NetworkConnection["protocol"][] = ["TCP", "UDP", "QUIC", "CUSTOM"];

  nodes.forEach((source, i) => {
    const connectionCount = Math.floor(Math.random() * 4) + 2;
    const targets = nodes
      .filter((_, j) => j !== i)
      .sort(() => Math.random() - 0.5)
      .slice(0, connectionCount);

    targets.forEach((target) => {
      const distance = calculateHaversineDistance(
        source.coordinates.latitude,
        source.coordinates.longitude,
        target.coordinates.latitude,
        target.coordinates.longitude
      );
      const baseLatency = estimateLatency(distance);

      connections.push({
        id: `conn-${source.id}-${target.id}`,
        source: source.id,
        target: target.id,
        latency: baseLatency + Math.random() * 20,
        bandwidth: Math.random() * 1000 + 100,
        packetLoss: Math.random() * 2,
        status: source.status === "OFFLINE" || target.status === "OFFLINE" ? "INACTIVE" : Math.random() > 0.9 ? "DEGRADED" : "ACTIVE",
        protocol: protocols[Math.floor(Math.random() * protocols.length)],
        encrypted: Math.random() > 0.1,
        compression: Math.random() > 0.3,
        lastPing: new Date(),
      });
    });
  });

  return connections;
};

const generateNetworkClusters = (nodes: SwarmNode[]): NetworkCluster[] => {
  const continents = [...new Set(nodes.map((n) => n.continent))];
  return continents.map((continent) => {
    const clusterNodes = nodes.filter((n) => n.continent === continent);
    const primaryNode = clusterNodes.find((n) => n.type === "PRIMARY") || clusterNodes[0];
    const avgLatency = clusterNodes.reduce((sum, n) => sum + n.metrics.latency, 0) / clusterNodes.length;
    const totalThroughput = clusterNodes.reduce((sum, n) => sum + n.metrics.throughput, 0);
    const activeTasks = clusterNodes.reduce((sum, n) => sum + n.tasks.inProgress, 0);

    return {
      id: `cluster-${continent.toLowerCase()}`,
      name: `${continent} Cluster`,
      region: continent,
      nodes: clusterNodes.map((n) => n.id),
      primaryNode: primaryNode.id,
      status: clusterNodes.every((n) => n.status === "ONLINE") ? "HEALTHY" : clusterNodes.some((n) => n.status === "OFFLINE") ? "CRITICAL" : "DEGRADED",
      metrics: {
        avgLatency,
        totalThroughput,
        activeTasks,
      },
    };
  });
};

const generateNetworkMetrics = (nodes: SwarmNode[], connections: NetworkConnection[]): NetworkMetrics => {
  const onlineNodes = nodes.filter((n) => n.status === "ONLINE").length;
  const offlineNodes = nodes.filter((n) => n.status === "OFFLINE").length;
  const avgLatency = nodes.reduce((sum, n) => sum + n.metrics.latency, 0) / nodes.length;
  const totalThroughput = nodes.reduce((sum, n) => sum + n.metrics.throughput, 0);
  const activeTasks = nodes.reduce((sum, n) => sum + n.tasks.inProgress, 0);
  const completedTasks = nodes.reduce((sum, n) => sum + n.tasks.completed, 0);
  const failedTasks = nodes.reduce((sum, n) => sum + n.tasks.failed, 0);

  return {
    totalNodes: nodes.length,
    onlineNodes,
    offlineNodes,
    avgLatency,
    totalThroughput,
    activeTasks,
    completedTasks,
    failedTasks,
    networkHealth: calculateNetworkHealth(nodes),
    securityScore: nodes.reduce((sum, n) => sum + n.securityLevel, 0) / nodes.length,
    efficiency: calculateEfficiency(nodes),
    redundancy: calculateRedundancy(nodes, connections),
    scalability: calculateScalability(nodes),
    reliability: 95 + Math.random() * 5,
    performance: 85 + Math.random() * 15,
    costEfficiency: 70 + Math.random() * 30,
    energyEfficiency: 60 + Math.random() * 40,
    carbonFootprint: Math.random() * 100,
    uptime: nodes.reduce((sum, n) => sum + n.metrics.uptime, 0) / nodes.length,
    mtbf: 2000 + Math.random() * 3000,
    mttr: Math.random() * 2 + 0.5,
    availability: 99.5 + Math.random() * 0.5,
    consistency: 90 + Math.random() * 10,
    partitionTolerance: 85 + Math.random() * 15,
  };
};

const generateTaskDistribution = (nodes: SwarmNode[]): TaskDistribution[] => {
  const taskTypes = [
    "Model Training",
    "Data Ingestion",
    "Inference Request",
    "Blockchain Validation",
    "Real-time Analytics",
    "Graph Computation",
    "Neural Search",
    "Stream Processing",
  ];

  return Array.from({ length: 20 }, (_, i) => {
    const assignedNode = nodes[Math.floor(Math.random() * nodes.length)];
    const status: TaskDistribution["status"] = ["PENDING", "ASSIGNED", "RUNNING", "COMPLETED", "FAILED"][Math.floor(Math.random() * 5)] as any;
    const progress = status === "COMPLETED" ? 100 : status === "FAILED" ? Math.random() * 50 : status === "RUNNING" ? Math.random() * 80 + 10 : 0;

    return {
      id: `task-${String(i + 1).padStart(3, "0")}`,
      name: `${taskTypes[i % taskTypes.length]} #${i + 1}`,
      description: `Distributed task for ${assignedNode.name}`,
      priority: ["CRITICAL", "HIGH", "MEDIUM", "LOW"][Math.floor(Math.random() * 4)] as any,
      status,
      assignedNode: status !== "PENDING" ? assignedNode.id : undefined,
      progress,
      startedAt: status !== "PENDING" ? new Date(Date.now() - Math.random() * 3600000) : undefined,
      completedAt: status === "COMPLETED" ? new Date() : undefined,
      estimatedDuration: Math.random() * 3600 + 300,
      actualDuration: status === "COMPLETED" ? Math.random() * 3600 + 300 : undefined,
      dependencies: [],
      tags: [assignedNode.continent.toLowerCase(), assignedNode.type.toLowerCase()],
      metadata: {
        type: taskTypes[i % taskTypes.length],
        complexity: Math.random() * 10,
        resourceRequirements: {
          cpu: Math.random() * 8 + 1,
          memory: Math.random() * 16 + 2,
          gpu: Math.random() > 0.7 ? Math.random() * 4 + 1 : 0,
        },
      },
    };
  });
};

const generateSwarmIntelligence = (): SwarmIntelligence => ({
  collectiveDecision: "Optimize resource allocation across Asia-Pacific cluster",
  consensus: 87 + Math.random() * 13,
  diversity: 75 + Math.random() * 25,
  adaptability: 80 + Math.random() * 20,
  learning: 85 + Math.random() * 15,
  innovation: 70 + Math.random() * 30,
  collaboration: 90 + Math.random() * 10,
  emergence: 65 + Math.random() * 35,
  selfOrganization: 88 + Math.random() * 12,
  robustness: 92 + Math.random() * 8,
  flexibility: 78 + Math.random() * 22,
  scalability: 85 + Math.random() * 15,
  efficiency: 82 + Math.random() * 18,
  resilience: 90 + Math.random() * 10,
  autonomy: 75 + Math.random() * 25,
});

const generateCommunicationLogs = (nodes: SwarmNode[]): CommunicationLog[] => {
  const logTypes: CommunicationLog["type"][] = ["REQUEST", "RESPONSE", "BROADCAST", "SYNC", "HEARTBEAT", "ALERT"];
  return Array.from({ length: 50 }, (_, i) => {
    const source = nodes[Math.floor(Math.random() * nodes.length)];
    const target = nodes[Math.floor(Math.random() * nodes.length)];
    return {
      id: `log-${i}`,
      timestamp: new Date(Date.now() - Math.random() * 3600000),
      source: source.id,
      target: target.id,
      type: logTypes[Math.floor(Math.random() * logTypes.length)],
      payload: `Task distribution update from ${source.name} to ${target.name}`,
      size: Math.floor(Math.random() * 10000) + 100,
      latency: Math.random() * 100 + 10,
      status: Math.random() > 0.95 ? "FAILED" : Math.random() > 0.9 ? "TIMEOUT" : "SUCCESS",
      encrypted: Math.random() > 0.1,
      compressed: Math.random() > 0.3,
    };
  });
};

const generateAlerts = (nodes: SwarmNode[]): Alert[] => {
  const alertTypes: Alert["type"][] = [
    "NODE_OFFLINE",
    "HIGH_LATENCY",
    "TASK_FAILED",
    "SECURITY_BREACH",
    "RESOURCE_EXHAUSTION",
    "NETWORK_PARTITION",
    "DATA_CORRUPTION",
    "PERFORMANCE_DEGRADATION",
  ];
  const severities: Alert["severity"][] = ["CRITICAL", "HIGH", "MEDIUM", "LOW", "INFO"];

  return Array.from({ length: 15 }, (_, i) => {
    const affectedNodes = nodes
      .sort(() => Math.random() - 0.5)
      .slice(0, Math.floor(Math.random() * 3) + 1)
      .map((n) => n.id);
    const severity = severities[Math.floor(Math.random() * severities.length)];
    const resolved = Math.random() > 0.4;

    return {
      id: `alert-${i}`,
      timestamp: new Date(Date.now() - Math.random() * 86400000),
      severity,
      type: alertTypes[Math.floor(Math.random() * alertTypes.length)],
      message: `${severity} alert: ${alertTypes[Math.floor(Math.random() * alertTypes.length)]} detected in cluster`,
      affectedNodes,
      acknowledged: Math.random() > 0.3,
      resolved,
      resolution: resolved ? "Auto-resolved by swarm intelligence" : undefined,
      resolvedAt: resolved ? new Date(Date.now() - Math.random() * 3600000) : undefined,
    };
  });
};

// ============================================================================
// SUB-COMPONENTS — MODULAR SWARM INTERFACE
// ============================================================================

// --- 3D Network Visualization Component ---
const NetworkVisualization3D: React.FC<{ nodes: SwarmNode[]; connections: NetworkConnection[] }> = ({ nodes, connections }) => {
  const [selectedNode, setSelectedNode] = useState<SwarmNode | null>(null);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.scale(zoom, zoom);
      ctx.rotate((rotation.y * Math.PI) / 180);

      // Draw connections
      connections.forEach((conn) => {
        const source = nodes.find((n) => n.id === conn.source);
        const target = nodes.find((n) => n.id === conn.target);
        if (!source || !target) return;

        const x1 = source.coordinates.longitude * 2;
        const y1 = source.coordinates.latitude * 2;
        const x2 = target.coordinates.longitude * 2;
        const y2 = target.coordinates.latitude * 2;

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.strokeStyle = conn.status === "ACTIVE" ? "rgba(6,182,212,0.3)" : conn.status === "DEGRADED" ? "rgba(234,179,8,0.3)" : "rgba(239,68,68,0.1)";
        ctx.lineWidth = conn.status === "ACTIVE" ? 1 : 0.5;
        ctx.stroke();
      });

      // Draw nodes
      nodes.forEach((node) => {
        const x = node.coordinates.longitude * 2;
        const y = node.coordinates.latitude * 2;
        const radius = node.type === "PRIMARY" ? 8 : node.type === "QUANTUM" ? 10 : 5;

        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fillStyle = node.status === "ONLINE" ? "#06b6d4" : node.status === "OFFLINE" ? "#ef4444" : "#eab308";
        ctx.fill();

        if (selectedNode?.id === node.id) {
          ctx.beginPath();
          ctx.arc(x, y, radius + 4, 0, Math.PI * 2);
          ctx.strokeStyle = "#a855f7";
          ctx.lineWidth = 2;
          ctx.stroke();
        }
      });

      ctx.restore();
      requestAnimationFrame(animate);
    };

    animate();
  }, [nodes, connections, zoom, rotation, selectedNode]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-slate-900/80 to-black/80 border border-cyan-500/30 rounded-2xl p-6 backdrop-blur-xl shadow-[0_0_30px_rgba(6,182,212,0.2)]"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-white tracking-wider flex items-center gap-2">
          <Globe className="w-4 h-4 text-cyan-400" />
          GLOBAL NETWORK TOPOLOGY
        </h3>
        <div className="flex gap-2">
          <button onClick={() => setZoom((z) => Math.min(z + 0.2, 3))} className="p-2 bg-white/5 rounded-lg hover:bg-white/10">
            <ZoomIn className="w-4 h-4" />
          </button>
          <button onClick={() => setZoom((z) => Math.max(z - 0.2, 0.5))} className="p-2 bg-white/5 rounded-lg hover:bg-white/10">
            <ZoomOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      <canvas
        ref={canvasRef}
        width={800}
        height={400}
        className="w-full h-64 bg-black/40 rounded-lg border border-white/10"
        onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const x = (e.clientX - rect.left - rect.width / 2) / zoom;
          const y = (e.clientY - rect.top - rect.height / 2) / zoom;
          const clickedNode = nodes.find((n) => {
            const nx = n.coordinates.longitude * 2;
            const ny = n.coordinates.latitude * 2;
            return Math.sqrt((x - nx) ** 2 + (y - ny) ** 2) < 10;
          });
          setSelectedNode(clickedNode || null);
        }}
      />

      {selectedNode && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 p-4 bg-black/40 border border-cyan-500/30 rounded-lg"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-bold text-white">{selectedNode.name}</span>
            <span className={`text-xs px-2 py-1 rounded ${getStatusBg(selectedNode.status)} ${getStatusColor(selectedNode.status)}`}>
              {selectedNode.status}
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div>
              <div className="text-white/40">Location</div>
              <div className="text-white">{selectedNode.location}, {selectedNode.country}</div>
            </div>
            <div>
              <div className="text-white/40">Latency</div>
              <div className="text-cyan-400">{formatLatency(selectedNode.metrics.latency)}</div>
            </div>
            <div>
              <div className="text-white/40">Uptime</div>
              <div className="text-green-400">{formatUptime(selectedNode.metrics.uptime)}</div>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

// --- Node Status Grid Component ---
const NodeStatusGrid: React.FC<{ nodes: SwarmNode[] }> = ({ nodes }) => {
  const [filter, setFilter] = useState<"ALL" | "ONLINE" | "OFFLINE" | "PROCESSING">("ALL");
  const [sortBy, setSortBy] = useState<"name" | "latency" | "uptime" | "tasks">("name");

  const filteredNodes = useMemo(() => {
    let result = filter === "ALL" ? nodes : nodes.filter((n) => n.status === filter);
    result.sort((a, b) => {
      switch (sortBy) {
        case "latency":
          return a.metrics.latency - b.metrics.latency;
        case "uptime":
          return b.metrics.uptime - a.metrics.uptime;
        case "tasks":
          return b.tasks.completed - a.tasks.completed;
        default:
          return a.name.localeCompare(b.name);
      }
    });
    return result;
  }, [nodes, filter, sortBy]);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-gradient-to-br from-slate-900/80 to-black/80 border border-purple-500/30 rounded-2xl p-6 backdrop-blur-xl shadow-[0_0_30px_rgba(168,85,247,0.2)]"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-white tracking-wider flex items-center gap-2">
          <Server className="w-4 h-4 text-purple-400" />
          NODE STATUS GRID
        </h3>
        <div className="flex gap-2">
          {(["ALL", "ONLINE", "OFFLINE", "PROCESSING"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1 rounded text-xs font-bold transition-all ${
                filter === f ? "bg-purple-600 text-white" : "bg-white/5 text-white/60 hover:bg-white/10"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-4">
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as any)}
          className="bg-black/40 border border-white/10 rounded px-3 py-1 text-xs text-white"
        >
          <option value="name">Sort by Name</option>
          <option value="latency">Sort by Latency</option>
          <option value="uptime">Sort by Uptime</option>
          <option value="tasks">Sort by Tasks</option>
        </select>
      </div>

      <div className="space-y-2 max-h-96 overflow-y-auto">
        {filteredNodes.map((node, i) => (
          <motion.div
            key={node.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-black/30 border border-white/10 rounded-lg p-3 hover:border-purple-500/30 transition-all cursor-pointer"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${node.status === "ONLINE" ? "bg-green-400 animate-pulse" : node.status === "OFFLINE" ? "bg-red-400" : "bg-yellow-400"}`} />
                <span className="text-xs font-bold text-white">{node.name}</span>
                <span className="text-[10px] text-white/40">{node.type}</span>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded ${getStatusBg(node.status)} ${getStatusColor(node.status)}`}>
                {node.status}
              </span>
            </div>
            <div className="grid grid-cols-4 gap-2 text-[10px]">
              <div>
                <div className="text-white/40">Latency</div>
                <div className="text-cyan-400">{formatLatency(node.metrics.latency)}</div>
              </div>
              <div>
                <div className="text-white/40">CPU</div>
                <div className="text-purple-400">{node.metrics.cpuUsage.toFixed(1)}%</div>
              </div>
              <div>
                <div className="text-white/40">Tasks</div>
                <div className="text-green-400">{node.tasks.completed}/{node.tasks.total}</div>
              </div>
              <div>
                <div className="text-white/40">Uptime</div>
                <div className="text-white">{formatUptime(node.metrics.uptime)}</div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

// --- Task Distribution Chart ---
const TaskDistributionChart: React.FC<{ tasks: TaskDistribution[] }> = ({ tasks }) => {
  const statusData = useMemo(() => {
    const statusCount = tasks.reduce(
      (acc, task) => {
        acc[task.status] = (acc[task.status] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );
    return Object.entries(statusCount).map(([name, value]) => ({ name, value }));
  }, [tasks]);

  const priorityData = useMemo(() => {
    const priorityCount = tasks.reduce(
      (acc, task) => {
        acc[task.priority] = (acc[task.priority] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );
    return Object.entries(priorityCount).map(([name, value]) => ({ name, value }));
  }, [tasks]);

  const COLORS = ["#06b6d4", "#a855f7", "#22c55e", "#eab308", "#ef4444"];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-gradient-to-br from-slate-900/80 to-black/80 border border-green-500/30 rounded-2xl p-6 backdrop-blur-xl"
    >
      <h3 className="text-sm font-bold text-white tracking-wider mb-4 flex items-center gap-2">
        <BarChart3 className="w-4 h-4 text-green-400" />
        TASK DISTRIBUTION
      </h3>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <div className="text-xs text-white/60 mb-2">By Status</div>
          <RechartsResponsiveContainer width="100%" height={150}>
            <RechartsPieChart>
              <RechartsPie data={statusData} cx="50%" cy="50%" innerRadius={30} outerRadius={60} paddingAngle={2} dataKey="value">
                {statusData.map((_, index) => (
                  <RechartsCell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                ))}
              </RechartsPie>
              <RechartsTooltip contentStyle={{ backgroundColor: "rgba(0,0,0,0.9)", border: "1px solid rgba(34,197,94,0.3)", borderRadius: "8px", color: "white" }} />
            </RechartsPieChart>
          </RechartsResponsiveContainer>
        </div>

        <div>
          <div className="text-xs text-white/60 mb-2">By Priority</div>
          <RechartsResponsiveContainer width="100%" height={150}>
            <RechartsBarChart data={priorityData}>
              <RechartsCartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <RechartsXAxis dataKey="name" stroke="rgba(255,255,255,0.3)" tick={{ fontSize: 10 }} />
              <RechartsYAxis stroke="rgba(255,255,255,0.3)" tick={{ fontSize: 10 }} />
              <RechartsTooltip contentStyle={{ backgroundColor: "rgba(0,0,0,0.9)", border: "1px solid rgba(34,197,94,0.3)", borderRadius: "8px", color: "white" }} />
              <RechartsBar dataKey="value" fill="#22c55e" />
            </RechartsBarChart>
          </RechartsResponsiveContainer>
        </div>
      </div>

      <div className="mt-4 space-y-2">
        {tasks.slice(0, 5).map((task, i) => (
          <motion.div
            key={task.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-black/30 rounded-lg p-3"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-white">{task.name}</span>
              <span className={`text-[10px] px-2 py-0.5 rounded ${getStatusBg(task.status)} ${getStatusColor(task.status)}`}>
                {task.status}
              </span>
            </div>
            <div className="h-1.5 bg-black/50 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-cyan-500 to-purple-500"
                initial={{ width: 0 }}
                animate={{ width: `${task.progress}%` }}
                transition={{ duration: 1 }}
              />
            </div>
            <div className="flex justify-between mt-1 text-[10px] text-white/40">
              <span>Progress</span>
              <span>{task.progress.toFixed(1)}%</span>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

// --- Swarm Intelligence Metrics ---
const SwarmIntelligenceMetrics: React.FC<{ intelligence: SwarmIntelligence }> = ({ intelligence }) => {
  const metrics = Object.entries(intelligence).filter(([key]) => key !== "collectiveDecision");

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-slate-900/80 to-black/80 border border-red-500/30 rounded-2xl p-6 backdrop-blur-xl"
    >
      <h3 className="text-sm font-bold text-white tracking-wider mb-4 flex items-center gap-2">
        <Brain className="w-4 h-4 text-red-400" />
        SWARM INTELLIGENCE
      </h3>

      <div className="mb-4 p-3 bg-black/30 rounded-lg border border-white/10">
        <div className="text-[10px] text-white/40 mb-1">COLLECTIVE DECISION</div>
        <div className="text-xs text-white">{intelligence.collectiveDecision}</div>
      </div>

      <div className="space-y-3">
        {metrics.map(([key, value], i) => (
          <motion.div
            key={key}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <div className="flex justify-between text-xs mb-1">
              <span className="text-white/60 capitalize">{key.replace(/([A-Z])/g, " $1").trim()}</span>
              <span className="text-cyan-400 font-bold">{value.toFixed(1)}%</span>
            </div>
            <div className="h-1.5 bg-black/50 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-cyan-500 to-purple-500"
                initial={{ width: 0 }}
                animate={{ width: `${value}%` }}
                transition={{ duration: 1 }}
              />
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

// --- Communication Log Component ---
const CommunicationLog: React.FC<{ logs: CommunicationLog[] }> = ({ logs }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-slate-900/80 to-black/80 border border-cyan-500/30 rounded-2xl p-6 backdrop-blur-xl"
    >
      <h3 className="text-sm font-bold text-white tracking-wider mb-4 flex items-center gap-2">
        <MessageSquare className="w-4 h-4 text-cyan-400" />
        COMMUNICATION LOG
      </h3>

      <div className="space-y-2 max-h-96 overflow-y-auto">
        {logs.slice(0, 20).map((log, i) => (
          <motion.div
            key={log.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.02 }}
            className="bg-black/30 border border-white/10 rounded-lg p-3 text-xs"
          >
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${getStatusBg(log.status)} ${getStatusColor(log.status)}`}>
                  {log.status}
                </span>
                <span className="text-white/60">{log.type}</span>
              </div>
              <span className="text-white/40">{log.timestamp.toLocaleTimeString()}</span>
            </div>
            <div className="text-white/80 mb-1">{log.payload}</div>
            <div className="flex gap-4 text-[10px] text-white/40">
              <span>{log.source} → {log.target}</span>
              <span>{formatLatency(log.latency)}</span>
              <span>{(log.size / 1024).toFixed(1)} KB</span>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

// --- Alert Center Component ---
const AlertCenter: React.FC<{ alerts: Alert[] }> = ({ alerts }) => {
  const [filter, setFilter] = useState<"ALL" | "CRITICAL" | "HIGH" | "MEDIUM" | "LOW">("ALL");

  const filteredAlerts = filter === "ALL" ? alerts : alerts.filter((a) => a.severity === filter);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-slate-900/80 to-black/80 border border-orange-500/30 rounded-2xl p-6 backdrop-blur-xl"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-white tracking-wider flex items-center gap-2">
          <Bell className="w-4 h-4 text-orange-400" />
          ALERT CENTER
        </h3>
        <div className="flex gap-2">
          {(["ALL", "CRITICAL", "HIGH", "MEDIUM", "LOW"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-2 py-1 rounded text-[10px] font-bold transition-all ${
                filter === f ? "bg-orange-600 text-white" : "bg-white/5 text-white/60 hover:bg-white/10"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2 max-h-96 overflow-y-auto">
        {filteredAlerts.map((alert, i) => (
          <motion.div
            key={alert.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className={`bg-black/30 border rounded-lg p-3 ${alert.resolved ? "border-green-500/30" : "border-red-500/30"}`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${getStatusBg(alert.severity)} ${getStatusColor(alert.severity)}`}>
                  {alert.severity}
                </span>
                <span className="text-xs font-bold text-white">{alert.type.replace(/_/g, " ")}</span>
              </div>
              {alert.resolved && <CheckCircle className="w-4 h-4 text-green-400" />}
            </div>
            <div className="text-xs text-white/80 mb-2">{alert.message}</div>
            <div className="flex gap-4 text-[10px] text-white/40">
              <span>{alert.affectedNodes.length} nodes affected</span>
              <span>{alert.timestamp.toLocaleTimeString()}</span>
              {alert.resolved && <span className="text-green-400">Resolved</span>}
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

// ============================================================================
// MAIN SWARM NETWORK COMPONENT
// ============================================================================

export default function SwarmNetwork() {
  const [nodes, setNodes] = useState<SwarmNode[]>([]);
  const [connections, setConnections] = useState<NetworkConnection[]>([]);
  const [clusters, setClusters] = useState<NetworkCluster[]>([]);
  const [metrics, setMetrics] = useState<NetworkMetrics | null>(null);
  const [tasks, setTasks] = useState<TaskDistribution[]>([]);
  const [intelligence, setIntelligence] = useState<SwarmIntelligence | null>(null);
  const [logs, setLogs] = useState<CommunicationLog[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [activeTab, setActiveTab] = useState<"overview" | "nodes" | "tasks" | "intelligence" | "logs" | "alerts">("overview");
  const [isLive, setIsLive] = useState(true);

  // Initialize data
  useEffect(() => {
    const swarmNodes = generateSwarmNodes(12);
    const swarmConnections = generateNetworkConnections(swarmNodes);
    const swarmClusters = generateNetworkClusters(swarmNodes);
    const swarmMetrics = generateNetworkMetrics(swarmNodes, swarmConnections);
    const swarmTasks = generateTaskDistribution(swarmNodes);
    const swarmIntelligence = generateSwarmIntelligence();
    const swarmLogs = generateCommunicationLogs(swarmNodes);
    const swarmAlerts = generateAlerts(swarmNodes);

    setNodes(swarmNodes);
    setConnections(swarmConnections);
    setClusters(swarmClusters);
    setMetrics(swarmMetrics);
    setTasks(swarmTasks);
    setIntelligence(swarmIntelligence);
    setLogs(swarmLogs);
    setAlerts(swarmAlerts);
  }, []);

  // Simulate live updates
  useEffect(() => {
    if (!isLive) return;

    const interval = setInterval(() => {
      setNodes((prev) =>
        prev.map((node) => ({
          ...node,
          metrics: {
            ...node.metrics,
            cpuUsage: Math.max(0, Math.min(100, node.metrics.cpuUsage + (Math.random() - 0.5) * 10)),
            memoryUsage: Math.max(0, Math.min(100, node.metrics.memoryUsage + (Math.random() - 0.5) * 5)),
            latency: Math.max(1, node.metrics.latency + (Math.random() - 0.5) * 5),
            throughput: Math.max(0, node.metrics.throughput + (Math.random() - 0.5) * 50),
          },
        }))
      );
    }, 2000);

    return () => clearInterval(interval);
  }, [isLive]);

  return (
    <div className="space-y-6">
      {/* Network Overview Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-slate-900/80 to-black/80 border border-white/10 rounded-2xl p-6 backdrop-blur-xl"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <Network className="w-8 h-8 text-cyan-400" />
            <div>
              <h2 className="text-2xl font-black text-white tracking-wider">SWARM INTELLIGENCE NETWORK</h2>
              <p className="text-xs text-white/60">Phase 15 • Global Neural Network • {nodes.length} Nodes Active</p>
            </div>
          </div>
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

        {metrics && (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
            <div className="bg-black/30 rounded-lg p-3">
              <div className="text-[10px] text-white/40 mb-1">TOTAL NODES</div>
              <div className="text-lg font-bold text-white">{metrics.totalNodes}</div>
            </div>
            <div className="bg-black/30 rounded-lg p-3">
              <div className="text-[10px] text-white/40 mb-1">ONLINE</div>
              <div className="text-lg font-bold text-green-400">{metrics.onlineNodes}</div>
            </div>
            <div className="bg-black/30 rounded-lg p-3">
              <div className="text-[10px] text-white/40 mb-1">AVG LATENCY</div>
              <div className="text-lg font-bold text-cyan-400">{formatLatency(metrics.avgLatency)}</div>
            </div>
            <div className="bg-black/30 rounded-lg p-3">
              <div className="text-[10px] text-white/40 mb-1">THROUGHPUT</div>
              <div className="text-lg font-bold text-purple-400">{formatThroughput(metrics.totalThroughput)}</div>
            </div>
            <div className="bg-black/30 rounded-lg p-3">
              <div className="text-[10px] text-white/40 mb-1">ACTIVE TASKS</div>
              <div className="text-lg font-bold text-yellow-400">{metrics.activeTasks}</div>
            </div>
            <div className="bg-black/30 rounded-lg p-3">
              <div className="text-[10px] text-white/40 mb-1">NETWORK HEALTH</div>
              <div className="text-lg font-bold text-green-400">{metrics.networkHealth.toFixed(1)}%</div>
            </div>
            <div className="bg-black/30 rounded-lg p-3">
              <div className="text-[10px] text-white/40 mb-1">SECURITY</div>
              <div className="text-lg font-bold text-cyan-400">{metrics.securityScore.toFixed(1)}%</div>
            </div>
            <div className="bg-black/30 rounded-lg p-3">
              <div className="text-[10px] text-white/40 mb-1">EFFICIENCY</div>
              <div className="text-lg font-bold text-purple-400">{metrics.efficiency.toFixed(1)}%</div>
            </div>
          </div>
        )}
      </motion.div>

      {/* Tab Navigation */}
      <div className="flex gap-2 border-b border-white/10 pb-2">
        {(["overview", "nodes", "tasks", "intelligence", "logs", "alerts"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-xs font-bold tracking-wider transition-all ${
              activeTab === tab ? "bg-cyan-600/20 text-cyan-400 border border-cyan-500/50" : "text-white/60 hover:text-white hover:bg-white/5"
            }`}
          >
            {tab.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {activeTab === "overview" && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-12 gap-6"
          >
            <div className="col-span-12 lg:col-span-8">
              <NetworkVisualization3D nodes={nodes} connections={connections} />
            </div>
            <div className="col-span-12 lg:col-span-4">
              {intelligence && <SwarmIntelligenceMetrics intelligence={intelligence} />}
            </div>
          </motion.div>
        )}

        {activeTab === "nodes" && (
          <motion.div
            key="nodes"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <NodeStatusGrid nodes={nodes} />
          </motion.div>
        )}

        {activeTab === "tasks" && (
          <motion.div
            key="tasks"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <TaskDistributionChart tasks={tasks} />
          </motion.div>
        )}

        {activeTab === "intelligence" && intelligence && (
          <motion.div
            key="intelligence"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <SwarmIntelligenceMetrics intelligence={intelligence} />
          </motion.div>
        )}

        {activeTab === "logs" && (
          <motion.div
            key="logs"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <CommunicationLog logs={logs} />
          </motion.div>
        )}

        {activeTab === "alerts" && (
          <motion.div
            key="alerts"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <AlertCenter alerts={alerts} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}