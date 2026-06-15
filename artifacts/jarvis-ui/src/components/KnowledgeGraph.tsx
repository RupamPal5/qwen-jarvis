"use client";
import React, { useState, useEffect, useRef, useCallback, useMemo, memo } from "react";
import {
  motion, AnimatePresence, useAnimation
} from "framer-motion";
import {
  Brain, Network, Search, Filter, ZoomIn, ZoomOut, Maximize2, Minimize2, RotateCcw, Play, Pause, Settings, MoreVertical, Download, Upload, Share2, ExternalLink, Copy, Check, X, ChevronRight, ChevronDown, ChevronLeft, ChevronUp, ArrowRight, ArrowLeft, Plus, Minus, Eye, EyeOff, Lock, Unlock, Shield, ShieldAlert, ShieldCheck, Activity, Zap, Cpu, MemoryStick, HardDrive, Database, Server, Cloud, CloudOff, CloudUpload, CloudDownload, Wifi, WifiOff, Signal, Radio, Bluetooth, Usb, Thermometer, Fan, Power, Battery, Gauge, BarChart3, GitBranch, GitCommit, GitPullRequest, Package, Box, Layers, Grid, List, Table, Columns, Rows, LayoutDashboard, LayoutGrid, LayoutList, LayoutTemplate, Layout, Folder, FolderOpen, File, FileText, FileCode, FileJson, FileImage, FileVideo, FileAudio, FileArchive, FileSpreadsheet, Trash, Trash2, Delete, Edit, Edit2, Edit3, Pencil, Pen, PenTool, Save, SaveAll, RefreshCw, RotateCw, Undo, Redo, Sliders, SlidersHorizontal, SlidersVertical, ToggleLeft, ToggleRight, CheckCircle, CheckSquare, AlertCircle, AlertTriangle, AlertOctagon, Info, HelpCircle, Clock, Calendar, CalendarDays, CalendarCheck, CalendarClock, CalendarHeart, CalendarPlus, CalendarRange, CalendarSearch, CalendarX, Timer, TimerOff, TimerReset, Hourglass, Bell, BellRing, BellOff, BellDot, BellMinus, BellPlus, MessageSquare, MessageCircle, MessageCircleMore, MessageCircleHeart, MessageCircleOff, MessageCirclePlus, MessageCircleQuestion, MessageCircleX, MessagesSquare, Send, SendHorizontal, SendToBack, BringToFront, User, Users, UserCheck, UserX, UserPlus, UserMinus, UserCircle, UserSquare, UserCog, UserLock, UserSearch, Award, Trophy, Medal, Crown, Gem, Diamond, Target, Flag, Bookmark, Tag, Hash, AtSign, Phone, Mail, Binary, Code, Code2, Braces, Terminal, Command, Github, Gitlab, BarChart2, BarChart4, BarChartHorizontal, Sun, Moon, CloudRain, CloudSnow, CloudLightning, Wind, Droplets, Flame, Snowflake, Umbrella, CloudDrizzle, CloudFog, CloudHail, ThermometerSun, ThermometerSnowflake, Clock1, Clock2, Clock3, Clock4, Clock5, Clock6, Clock7, Clock8, AlarmClock, AlarmClockCheck, AlarmClockMinus, AlarmClockOff, AlarmClockPlus, Home, Building, Factory, Warehouse, Store, Hospital, School, University, Church, Castle, Tent, TreePalm, TreeDeciduous, Flower, Flower2, Leaf, Sprout, Wheat, Carrot, Apple, Banana, Grape, Cherry
} from "lucide-react";
import {
  PieChart as RechartsPie, Pie as RechartsPieSlice, Cell as RechartsCell, ResponsiveContainer as RechartsResponsiveContainer, Tooltip as RechartsTooltip, Legend as RechartsLegend, BarChart as RechartsBarChart, Bar as RechartsBar, XAxis as RechartsXAxis, YAxis as RechartsYAxis, CartesianGrid as RechartsCartesianGrid, AreaChart as RechartsAreaChart, Area as RechartsArea, LineChart as RechartsLineChart, Line as RechartsLine
} from "recharts";

// ============================================================================
// TYPE DEFINITIONS - KNOWLEDGE GRAPH ARCHITECTURE
// ============================================================================

type NodeType = "CONCEPT" | "ENTITY" | "EVENT" | "MEMORY" | "PROTOCOL" | "HARDWARE" | "SOFTWARE" | "PERSON" | "LOCATION" | "DOCUMENT";
type EdgeType = "ASSOCIATIVE" | "TEMPORAL" | "CAUSAL" | "HIERARCHICAL" | "SEMANTIC" | "DEPENDENCY";
type ClusterType = "AI_CORE" | "STARK_TECH" | "QUANTUM" | "SECURITY" | "MEMORY_PALACE" | "NETWORK" | "BLOCKCHAIN" | "IOT";
type LayoutMode = "FORCE" | "RADIAL" | "HIERARCHICAL" | "GRID";

interface GraphNode {
  id: string;
  label: string;
  type: NodeType;
  cluster: ClusterType;
  importance: number; // 0-100
  x: number;
  y: number;
  vx: number;
  vy: number;
  fx: number | null; // fixed x for dragging
  fy: number | null; // fixed y for dragging
  metadata: {
    description: string;
    createdAt: Date;
    lastAccessed: Date;
    accessCount: number;
    tags: string[];
    relatedNodes: string[];
    color: string;
    icon: string;
  };
}

interface GraphEdge {
  id: string;
  source: string;
  target: string;
  type: EdgeType;
  strength: number; // 0-100
  weight: number;
  metadata: {
    label: string;
    createdAt: Date;
    color: string;
  };
}

interface GraphCluster {
  id: ClusterType;
  name: string;
  color: string;
  nodeCount: number;
  center: { x: number; y: number };
}

interface SearchMatch {
  nodeId: string;
  score: number;
  matchedFields: string[];
}

interface GraphMetrics {
  totalNodes: number;
  totalEdges: number;
  density: number;
  avgDegree: number;
  maxDegree: number;
  clusteringCoefficient: number;
  diameter: number;
  activeClusters: number;
}

// ============================================================================
// CONSTANTS & MOCK DATA GENERATORS
// ============================================================================

const CLUSTER_CONFIG: Record<ClusterType, { name: string; color: string; icon: string }> = {
  AI_CORE: { name: "AI Core", color: "#a855f7", icon: "Brain" },
  STARK_TECH: { name: "Stark Tech", color: "#ef4444", icon: "Zap" },
  QUANTUM: { name: "Quantum", color: "#06b6d4", icon: "Atom" },
  SECURITY: { name: "Security", color: "#10b981", icon: "Shield" },
  MEMORY_PALACE: { name: "Memory Palace", color: "#f59e0b", icon: "Database" },
  NETWORK: { name: "Network", color: "#3b82f6", icon: "Network" },
  BLOCKCHAIN: { name: "Blockchain", color: "#ec4899", icon: "Link" },
  IOT: { name: "IoT Devices", color: "#8b5cf6", icon: "Smartphone" },
};

const NODE_TEMPLATES: { label: string; type: NodeType; cluster: ClusterType; description: string }[] = [
  { label: "Neural Core", type: "SOFTWARE", cluster: "AI_CORE", description: "Central processing unit for JARVIS cognitive functions." },
  { label: "Council of Three", type: "PROTOCOL", cluster: "AI_CORE", description: "Adversarial debate system for decision making." },
  { label: "God Protocol", type: "PROTOCOL", cluster: "AI_CORE", description: "Ultimate sovereign AI architecture." },
  { label: "Arc Reactor", type: "HARDWARE", cluster: "STARK_TECH", description: "Clean energy source powering Stark systems." },
  { label: "Mark 85 Suit", type: "HARDWARE", cluster: "STARK_TECH", description: "Nanotech armor with integrated AI." },
  { label: "Qubit Array", type: "HARDWARE", cluster: "QUANTUM", description: "1000-qubit superconducting processor." },
  { label: "Entanglement Bridge", type: "PROTOCOL", cluster: "QUANTUM", description: "Secure quantum communication channel." },
  { label: "6-Layer Containment", type: "PROTOCOL", cluster: "SECURITY", description: "Zero-trust isolation architecture." },
  { label: "Panic Room", type: "PROTOCOL", cluster: "SECURITY", description: "Emergency lockdown and data wipe system." },
  { label: "Episodic Memory", type: "MEMORY", cluster: "MEMORY_PALACE", description: "Time-stamped personal experiences." },
  { label: "Semantic Web", type: "MEMORY", cluster: "MEMORY_PALACE", description: "Conceptual knowledge and facts." },
  { label: "Mesh Network", type: "SOFTWARE", cluster: "NETWORK", description: "Decentralized node communication." },
  { label: "Smart Home Hub", type: "HARDWARE", cluster: "IOT", description: "Central controller for IoT devices." },
  { label: "Sovereign Wallet", type: "SOFTWARE", cluster: "BLOCKCHAIN", description: "Decentralized identity and asset management." },
];

const generateMockGraph = (nodeCount: number = 150): { nodes: GraphNode[]; edges: GraphEdge[]; clusters: GraphCluster[] } => {
  const nodes: GraphNode[] = [];
  const edges: GraphEdge[] = [];
  const clusterIds = Object.keys(CLUSTER_CONFIG) as ClusterType[];
  
  // Generate Nodes
  for (let i = 0; i < nodeCount; i++) {
    const template = NODE_TEMPLATES[i % NODE_TEMPLATES.length];
    const cluster = clusterIds[Math.floor(Math.random() * clusterIds.length)];
    const clusterConf = CLUSTER_CONFIG[cluster];
    
    nodes.push({
      id: `node_${i}`,
      label: i < NODE_TEMPLATES.length ? template.label : `${template.label} ${Math.floor(i / NODE_TEMPLATES.length)}`,
      type: template.type,
      cluster: cluster,
      importance: Math.random() * 100,
      x: Math.random() * 1000,
      y: Math.random() * 1000,
      vx: 0,
      vy: 0,
      fx: null,
      fy: null,
      metadata: {
        description: template.description,
        createdAt: new Date(Date.now() - Math.random() * 31536000000),
        lastAccessed: new Date(Date.now() - Math.random() * 86400000),
        accessCount: Math.floor(Math.random() * 10000),
        tags: [cluster.toLowerCase(), template.type.toLowerCase()],
        relatedNodes: [],
        color: clusterConf.color,
        icon: clusterConf.icon,
      },
    });
  }

  // Generate Edges (Preferential Attachment)
  for (let i = 1; i < nodes.length; i++) {
    const numEdges = Math.floor(Math.random() * 3) + 1;
    for (let j = 0; j < numEdges; j++) {
      const targetIdx = Math.floor(Math.random() * i);
      const edgeType: EdgeType = ["ASSOCIATIVE", "TEMPORAL", "CAUSAL", "HIERARCHICAL", "SEMANTIC", "DEPENDENCY"][Math.floor(Math.random() * 6)] as EdgeType;
      
      edges.push({
        id: `edge_${i}_${targetIdx}_${j}`,
        source: nodes[i].id,
        target: nodes[targetIdx].id,
        type: edgeType,
        strength: Math.random() * 100,
        weight: Math.random() * 5 + 1,
        metadata: {
          label: edgeType.replace(/_/g, " "),
          createdAt: new Date(),
          color: CLUSTER_CONFIG[nodes[i].cluster].color,
        },
      });
      
      nodes[i].metadata.relatedNodes.push(nodes[targetIdx].id);
      nodes[targetIdx].metadata.relatedNodes.push(nodes[i].id);
    }
  }

  // Calculate Clusters
  const clusters: GraphCluster[] = clusterIds.map(id => ({
    id,
    name: CLUSTER_CONFIG[id].name,
    color: CLUSTER_CONFIG[id].color,
    nodeCount: nodes.filter(n => n.cluster === id).length,
    center: { x: 500, y: 500 }, // Will be updated by layout
  }));

  return { nodes, edges, clusters };
};

// ============================================================================
// CUSTOM HOOKS - GRAPH PHYSICS & INTERACTION
// ============================================================================

const useForceSimulation = (initialNodes: GraphNode[], initialEdges: GraphEdge[], isPlaying: boolean) => {
  const [nodes, setNodes] = useState<GraphNode[]>(initialNodes);
  const [edges, setEdges] = useState<GraphEdge[]>(initialEdges);
  const animationRef = useRef<number>();

  useEffect(() => {
    if (!isPlaying) return;

    const simulate = () => {
      setNodes(prevNodes => {
        const newNodes = prevNodes.map(node => ({ ...node }));
        const alpha = 0.1; // Cooling factor

        // Repulsion (Coulomb's Law)
        for (let i = 0; i < newNodes.length; i++) {
          for (let j = i + 1; j < newNodes.length; j++) {
            const dx = newNodes[j].x - newNodes[i].x;
            const dy = newNodes[j].y - newNodes[i].y;
            const dist = Math.sqrt(dx * dx + dy * dy) || 1;
            const force = 5000 / (dist * dist);
            
            const fx = (dx / dist) * force;
            const fy = (dy / dist) * force;

            if (newNodes[i].fx === null) { newNodes[i].vx -= fx * alpha; newNodes[i].vy -= fy * alpha; }
            if (newNodes[j].fx === null) { newNodes[j].vx += fx * alpha; newNodes[j].vy += fy * alpha; }
          }
        }

        // Attraction (Hooke's Law)
        initialEdges.forEach(edge => {
          const source = newNodes.find(n => n.id === edge.source);
          const target = newNodes.find(n => n.id === edge.target);
          if (source && target) {
            const dx = target.x - source.x;
            const dy = target.y - source.y;
            const dist = Math.sqrt(dx * dx + dy * dy) || 1;
            const force = (dist - 100) * 0.01; // Ideal distance = 100

            const fx = (dx / dist) * force;
            const fy = (dy / dist) * force;

            if (source.fx === null) { source.vx += fx * alpha; source.vy += fy * alpha; }
            if (target.fx === null) { target.vx -= fx * alpha; target.vy -= fy * alpha; }
          }
        });

        // Center Gravity
        newNodes.forEach(node => {
          if (node.fx === null) {
            node.vx += (500 - node.x) * 0.001;
            node.vy += (500 - node.y) * 0.001;
            
            // Apply velocity with damping
            node.x += node.vx * 0.8;
            node.y += node.vy * 0.8;
            
            // Boundary constraints
            node.x = Math.max(50, Math.min(950, node.x));
            node.y = Math.max(50, Math.min(950, node.y));
          }
        });

        return newNodes;
      });

      animationRef.current = requestAnimationFrame(simulate);
    };

    animationRef.current = requestAnimationFrame(simulate);
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isPlaying, initialEdges]);

  const updateNodePosition = useCallback((id: string, x: number, y: number) => {
    setNodes(prev => prev.map(n => n.id === id ? { ...n, x, y, fx: x, fy: y } : n));
  }, []);

  const releaseNode = useCallback((id: string) => {
    setNodes(prev => prev.map(n => n.id === id ? { ...n, fx: null, fy: null } : n));
  }, []);

  return { nodes, edges, updateNodePosition, releaseNode };
};

// ============================================================================
// SUB-COMPONENTS - GRAPH VISUALIZATION
// ============================================================================

// --- Graph Node Component ---
const GraphNodeComponent = memo(({ 
  node, 
  isSelected, 
  isHovered, 
  onSelect, 
  onHover, 
  onDragStart 
}: { 
  node: GraphNode; 
  isSelected: boolean; 
  isHovered: boolean; 
  onSelect: (id: string) => void; 
  onHover: (id: string | null) => void; 
  onDragStart: (id: string, e: React.MouseEvent) => void;
}) => {
  const size = 10 + (node.importance / 100) * 20;
  const Icon = getIconComponent(node.metadata.icon);

  return (
    <g 
      transform={`translate(${node.x}, ${node.y})`} 
      style={{ cursor: "pointer" }}
      onClick={(e) => { e.stopPropagation(); onSelect(node.id); }}
      onMouseEnter={() => onHover(node.id)}
      onMouseLeave={() => onHover(null)}
      onMouseDown={(e) => onDragStart(node.id, e)}
    >
      {/* Glow Effect */}
      {(isSelected || isHovered) && (
        <circle r={size + 10} fill={node.metadata.color} opacity="0.2">
          <animate attributeName="r" values={`${size + 5};${size + 15};${size + 5}`} dur="2s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.2;0.4;0.2" dur="2s" repeatCount="indefinite" />
        </circle>
      )}
      
      {/* Node Circle */}
      <circle 
        r={size} 
        fill="rgba(0,0,0,0.8)" 
        stroke={node.metadata.color} 
        strokeWidth={isSelected ? 3 : 1.5}
        filter="drop-shadow(0 0 5px rgba(0,0,0,0.5))"
      />
      
      {/* Icon */}
      <foreignObject x={-size/2} y={-size/2} width={size} height={size}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: node.metadata.color }}>
          <Icon size={size * 0.6} />
        </div>
      </foreignObject>

      {/* Label */}
      <text 
        y={size + 15} 
        textAnchor="middle" 
        fill="white" 
        fontSize="10" 
        fontWeight="bold"
        style={{ textShadow: "0 1px 3px rgba(0,0,0,0.8)", pointerEvents: "none" }}
      >
        {node.label}
      </text>
    </g>
  );
});

// --- Graph Edge Component ---
const GraphEdgeComponent = memo(({ 
  edge, 
  sourceNode, 
  targetNode, 
  isHighlighted 
}: { 
  edge: GraphEdge; 
  sourceNode: GraphNode; 
  targetNode: GraphNode; 
  isHighlighted: boolean;
}) => {
  if (!sourceNode || !targetNode) return null;

  return (
    <line
      x1={sourceNode.x}
      y1={sourceNode.y}
      x2={targetNode.x}
      y2={targetNode.y}
      stroke={isHighlighted ? edge.metadata.color : "rgba(255,255,255,0.1)"}
      strokeWidth={isHighlighted ? edge.weight : edge.weight * 0.5}
      strokeDasharray={edge.type === "TEMPORAL" ? "5,5" : "none"}
      opacity={isHighlighted ? 1 : 0.3}
      style={{ transition: "all 0.3s ease" }}
    />
  );
});

// --- Node Details Panel ---
const NodeDetailsPanel: React.FC<{
  node: GraphNode | null;
  edges: GraphEdge[];
  nodes: GraphNode[];
  onClose: () => void;
}> = ({ node, edges, nodes, onClose }) => {
  if (!node) return null;

  const connectedEdges = edges.filter(e => e.source === node.id || e.target === node.id);
  const connectedNodes = nodes.filter(n => node.metadata.relatedNodes.includes(n.id));

  return (
    <motion.div
      initial={{ x: 400, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 400, opacity: 0 }}
      className="absolute right-0 top-0 bottom-0 w-96 bg-black/80 backdrop-blur-xl border-l border-white/10 p-6 overflow-y-auto z-20"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-white tracking-wider">NODE INSPECTOR</h3>
        <button onClick={onClose} className="text-white/60 hover:text-white">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl" style={{ backgroundColor: `${node.metadata.color}20` }}>
            {React.createElement(getIconComponent(node.metadata.icon), { className: "w-8 h-8", style: { color: node.metadata.color } })}
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">{node.label}</h2>
            <p className="text-xs text-white/60">{node.type} • {CLUSTER_CONFIG[node.cluster].name}</p>
          </div>
        </div>

        {/* Description */}
        <div className="bg-black/40 rounded-lg p-4 border border-white/5">
          <div className="text-[10px] text-white/40 uppercase tracking-wider mb-2">Description</div>
          <p className="text-sm text-white/80 leading-relaxed">{node.metadata.description}</p>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-black/40 rounded-lg p-3 border border-white/5">
            <div className="text-[10px] text-white/40 mb-1">Importance</div>
            <div className="text-lg font-bold" style={{ color: node.metadata.color }}>{node.importance.toFixed(0)}%</div>
          </div>
          <div className="bg-black/40 rounded-lg p-3 border border-white/5">
            <div className="text-[10px] text-white/40 mb-1">Access Count</div>
            <div className="text-lg font-bold text-cyan-400">{node.metadata.accessCount.toLocaleString()}</div>
          </div>
          <div className="bg-black/40 rounded-lg p-3 border border-white/5">
            <div className="text-[10px] text-white/40 mb-1">Connections</div>
            <div className="text-lg font-bold text-purple-400">{connectedEdges.length}</div>
          </div>
          <div className="bg-black/40 rounded-lg p-3 border border-white/5">
            <div className="text-[10px] text-white/40 mb-1">Last Accessed</div>
            <div className="text-xs font-bold text-green-400">{formatRelativeTime(node.metadata.lastAccessed)}</div>
          </div>
        </div>

        {/* Tags */}
        <div>
          <div className="text-[10px] text-white/40 uppercase tracking-wider mb-2">Tags</div>
          <div className="flex flex-wrap gap-2">
            {node.metadata.tags.map(tag => (
              <span key={tag} className="px-2 py-1 rounded bg-white/5 border border-white/10 text-[10px] text-white/60">
                #{tag}
              </span>
            ))}
          </div>
        </div>

        {/* Connected Nodes */}
        <div>
          <div className="text-[10px] text-white/40 uppercase tracking-wider mb-2">Connected Nodes ({connectedNodes.length})</div>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {connectedNodes.slice(0, 10).map(connected => (
              <div key={connected.id} className="flex items-center gap-3 p-2 rounded-lg bg-black/40 border border-white/5 hover:border-white/20 transition-colors">
                <div className="p-1.5 rounded" style={{ backgroundColor: `${connected.metadata.color}20` }}>
                  {React.createElement(getIconComponent(connected.metadata.icon), { size: 14, style: { color: connected.metadata.color } })}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium text-white truncate">{connected.label}</div>
                  <div className="text-[10px] text-white/40">{connected.type}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// --- Graph Analytics Panel ---
const GraphAnalytics: React.FC<{ metrics: GraphMetrics; clusters: GraphCluster[] }> = ({ metrics, clusters }) => {
  const clusterData = clusters.map(c => ({ name: c.name, value: c.nodeCount, color: c.color }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-black/40 border border-purple-500/30 rounded-2xl p-6 backdrop-blur-xl shadow-[0_0_30px_rgba(168,85,247,0.2)]"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <BarChart3 className="w-5 h-5 text-purple-400" />
          <h3 className="text-sm font-bold text-white tracking-wider">GRAPH ANALYTICS</h3>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-black/30 rounded-lg p-3 border border-white/5">
          <div className="text-[10px] text-white/40 mb-1">DENSITY</div>
          <div className="text-lg font-bold text-cyan-400">{metrics.density.toFixed(3)}</div>
        </div>
        <div className="bg-black/30 rounded-lg p-3 border border-white/5">
          <div className="text-[10px] text-white/40 mb-1">AVG DEGREE</div>
          <div className="text-lg font-bold text-green-400">{metrics.avgDegree.toFixed(1)}</div>
        </div>
        <div className="bg-black/30 rounded-lg p-3 border border-white/5">
          <div className="text-[10px] text-white/40 mb-1">CLUSTERING</div>
          <div className="text-lg font-bold text-purple-400">{(metrics.clusteringCoefficient * 100).toFixed(1)}%</div>
        </div>
        <div className="bg-black/30 rounded-lg p-3 border border-white/5">
          <div className="text-[10px] text-white/40 mb-1">DIAMETER</div>
          <div className="text-lg font-bold text-yellow-400">{metrics.diameter}</div>
        </div>
      </div>

      <div className="h-48">
        <div className="text-[10px] text-white/40 mb-2">CLUSTER DISTRIBUTION</div>
        <RechartsResponsiveContainer width="100%" height="100%">
          <RechartsPie>
            <RechartsPieSlice data={clusterData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={2} dataKey="value">
              {clusterData.map((entry, index) => (
                <RechartsCell key={`cell-${index}`} fill={entry.color} stroke="none" />
              ))}
            </RechartsPieSlice>
            <RechartsTooltip contentStyle={{ backgroundColor: "rgba(0,0,0,0.9)", border: "1px solid rgba(168,85,247,0.3)", borderRadius: "8px", color: "white", fontSize: "10px" }} />
          </RechartsPie>
        </RechartsResponsiveContainer>
      </div>
    </motion.div>
  );
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

const getIconComponent = (iconName: string) => {
  const icons: Record<string, React.ComponentType<any>> = {
    Brain, Zap, Atom, Shield, Database, Network, Link, Smartphone,
    Activity, Cpu, MemoryStick, HardDrive, Server, Cloud, Wifi,
    Signal, Radio, Bluetooth, Usb, Thermometer, Fan, Power, Battery,
    Gauge, Tachometer, GitBranch, GitCommit, Package, Box, Layers,
    Grid, List, Table, Columns, Rows, LayoutDashboard, Folder, File,
    FileText, FileCode, FileJson, Trash, Edit, Save, RefreshCw,
    Settings, Sliders, CheckCircle, AlertTriangle, Info, Clock,
    Calendar, Bell, MessageSquare, User, Users, Award, Target,
    Home, Building, Factory, Store, Hospital, School, University,
    Sun, Moon, CloudRain, Wind, Droplets, Flame, Snowflake,
    // Add more as needed
  };
  return icons[iconName] || Brain;
};

const formatRelativeTime = (date: Date): string => {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};

// ============================================================================
// MAIN KNOWLEDGE GRAPH COMPONENT
// ============================================================================

export default function KnowledgeGraph() {
  const [graphData, setGraphData] = useState(() => generateMockGraph(150));
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isPlaying, setIsPlaying] = useState(true);
  const [layoutMode, setLayoutMode] = useState<LayoutMode>("FORCE");
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [activeFilters, setActiveFilters] = useState<Set<NodeType>>(new Set());
  const [showAnalytics, setShowAnalytics] = useState(true);

  const svgRef = useRef<SVGSVGElement>(null);
  const { nodes, edges, updateNodePosition, releaseNode } = useForceSimulation(graphData.nodes, graphData.edges, isPlaying);

  // Calculate Metrics
  const metrics: GraphMetrics = useMemo(() => {
    const totalNodes = nodes.length;
    const totalEdges = edges.length;
    const density = (2 * totalEdges) / (totalNodes * (totalNodes - 1));
    const degrees = nodes.map(n => edges.filter(e => e.source === n.id || e.target === n.id).length);
    const avgDegree = degrees.reduce((a, b) => a + b, 0) / totalNodes;
    const maxDegree = Math.max(...degrees);
    
    return {
      totalNodes,
      totalEdges,
      density,
      avgDegree,
      maxDegree,
      clusteringCoefficient: 0.65, // Mock
      diameter: 6, // Mock
      activeClusters: Object.keys(CLUSTER_CONFIG).length,
    };
  }, [nodes, edges]);

  // Filter Nodes
  const filteredNodes = useMemo(() => {
    return nodes.filter(node => {
      const matchesSearch = node.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          node.metadata.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter = activeFilters.size === 0 || activeFilters.has(node.type);
      return matchesSearch && matchesFilter;
    });
  }, [nodes, searchQuery, activeFilters]);

  const filteredNodeIds = new Set(filteredNodes.map(n => n.id));
  const filteredEdges = edges.filter(e => filteredNodeIds.has(e.source) && filteredNodeIds.has(e.target));

  // Interaction Handlers
  const handleNodeSelect = useCallback((id: string) => {
    setSelectedNodeId(prev => prev === id ? null : id);
  }, []);

  const handleNodeHover = useCallback((id: string | null) => {
    setHoveredNodeId(id);
  }, []);

  const handleDragStart = useCallback((id: string, e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    updateNodePosition(id, e.clientX, e.clientY); // Simplified, needs coordinate mapping
  }, [updateNodePosition]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isDragging && hoveredNodeId) {
      // In a real app, map screen coords to SVG coords
    }
    if (isDragging) {
      setPan(prev => ({
        x: prev.x + e.movementX,
        y: prev.y + e.movementY,
      }));
    }
  }, [isDragging, hoveredNodeId]);

  const handleMouseUp = useCallback(() => {
    if (isDragging && hoveredNodeId) {
      releaseNode(hoveredNodeId);
    }
    setIsDragging(false);
  }, [isDragging, hoveredNodeId, releaseNode]);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    setZoom(prev => Math.max(0.1, Math.min(3, prev - e.deltaY * 0.001)));
  }, []);

  const toggleFilter = useCallback((type: NodeType) => {
    setActiveFilters(prev => {
      const next = new Set(prev);
      if (next.has(type)) next.delete(type);
      else next.add(type);
      return next;
    });
  }, []);

  const selectedNode = nodes.find(n => n.id === selectedNodeId) || null;

  return (
    <div className="relative w-full h-full bg-black overflow-hidden">
      {/* Header Controls */}
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="absolute top-0 left-0 right-0 z-10 p-4 flex items-center justify-between bg-gradient-to-b from-black/80 to-transparent"
      >
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Network className="w-6 h-6 text-cyan-400" />
            <h1 className="text-xl font-black text-white tracking-wider">KNOWLEDGE GRAPH</h1>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <input
              type="text"
              placeholder="Search nodes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-64 bg-black/60 border border-white/10 rounded-lg pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500/50 backdrop-blur-xl"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`p-2 rounded-lg border transition-all ${isPlaying ? "bg-green-500/20 border-green-500/50 text-green-400" : "bg-white/5 border-white/10 text-white/60"}`}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>
          <button
            onClick={() => setGraphData(generateMockGraph(150))}
            className="p-2 rounded-lg bg-white/5 border border-white/10 text-white/60 hover:bg-white/10 transition-all"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowAnalytics(!showAnalytics)}
            className={`p-2 rounded-lg border transition-all ${showAnalytics ? "bg-purple-500/20 border-purple-500/50 text-purple-400" : "bg-white/5 border-white/10 text-white/60"}`}
          >
            <BarChart3 className="w-4 h-4" />
          </button>
        </div>
      </motion.div>

      {/* Filter Panel */}
      <motion.div
        initial={{ x: -50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="absolute left-4 top-20 z-10 w-48 bg-black/60 backdrop-blur-xl border border-white/10 rounded-xl p-4"
      >
        <div className="text-[10px] text-white/40 uppercase tracking-wider mb-3">Filter by Type</div>
        <div className="space-y-2">
          {(["CONCEPT", "ENTITY", "EVENT", "MEMORY", "PROTOCOL", "HARDWARE", "SOFTWARE", "PERSON", "LOCATION", "DOCUMENT"] as NodeType[]).map(type => (
            <button
              key={type}
              onClick={() => toggleFilter(type)}
              className={`w-full text-left px-3 py-1.5 rounded-lg text-xs transition-all ${
                activeFilters.has(type)
                  ? "bg-cyan-500/20 border border-cyan-500/50 text-cyan-400"
                  : "bg-white/5 border border-white/5 text-white/60 hover:bg-white/10"
              }`}
            >
              {type.replace(/_/g, " ")}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Main SVG Canvas */}
      <svg
        ref={svgRef}
        className="w-full h-full"
        style={{ cursor: isDragging ? "grabbing" : "grab" }}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
      >
        <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
          {/* Edges */}
          {filteredEdges.map(edge => {
            const source = nodes.find(n => n.id === edge.source);
            const target = nodes.find(n => n.id === edge.target);
            const isHighlighted = hoveredNodeId === edge.source || hoveredNodeId === edge.target ||
                                  selectedNodeId === edge.source || selectedNodeId === edge.target;
            return (
              <GraphEdgeComponent
                key={edge.id}
                edge={edge}
                sourceNode={source!}
                targetNode={target!}
                isHighlighted={isHighlighted}
              />
            );
          })}

          {/* Nodes */}
          {filteredNodes.map(node => (
            <GraphNodeComponent
              key={node.id}
              node={node}
              isSelected={selectedNodeId === node.id}
              isHovered={hoveredNodeId === node.id}
              onSelect={handleNodeSelect}
              onHover={handleNodeHover}
              onDragStart={handleDragStart}
            />
          ))}
        </g>
      </svg>

      {/* Node Details Panel */}
      <AnimatePresence>
        {selectedNode && (
          <NodeDetailsPanel
            node={selectedNode}
            edges={edges}
            nodes={nodes}
            onClose={() => setSelectedNodeId(null)}
          />
        )}
      </AnimatePresence>

      {/* Analytics Panel */}
      <AnimatePresence>
        {showAnalytics && (
          <motion.div
            initial={{ x: 400, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 400, opacity: 0 }}
            className="absolute right-4 bottom-4 z-10 w-80"
          >
            <GraphAnalytics metrics={metrics} clusters={graphData.clusters} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Zoom Controls */}
      <div className="absolute bottom-4 left-4 z-10 flex flex-col gap-2">
        <button
          onClick={() => setZoom(prev => Math.min(3, prev + 0.2))}
          className="p-2 rounded-lg bg-black/60 border border-white/10 text-white/60 hover:bg-white/10 backdrop-blur-xl"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={() => setZoom(prev => Math.max(0.1, prev - 0.2))}
          className="p-2 rounded-lg bg-black/60 border border-white/10 text-white/60 hover:bg-white/10 backdrop-blur-xl"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }}
          className="p-2 rounded-lg bg-black/60 border border-white/10 text-white/60 hover:bg-white/10 backdrop-blur-xl"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
      </div>

      {/* Stats Overlay */}
      <div className="absolute top-4 right-4 z-10 flex gap-3">
        <div className="px-3 py-1.5 rounded-lg bg-black/60 border border-white/10 backdrop-blur-xl">
          <span className="text-[10px] text-white/40">NODES: </span>
          <span className="text-xs font-bold text-cyan-400">{filteredNodes.length}</span>
        </div>
        <div className="px-3 py-1.5 rounded-lg bg-black/60 border border-white/10 backdrop-blur-xl">
          <span className="text-[10px] text-white/40">EDGES: </span>
          <span className="text-xs font-bold text-purple-400">{filteredEdges.length}</span>
        </div>
      </div>
    </div>
  );
}