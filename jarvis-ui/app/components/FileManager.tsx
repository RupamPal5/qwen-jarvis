"use client";
import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Folder, FolderOpen, File, FileText, FileCode, FileImage, FileJson,
  FileArchive, FileVideo, FileAudio, Search, Filter, ChevronRight,
  ChevronDown, MoreVertical, Plus, Upload, Download, Trash2, Edit,
  Copy, Clipboard, Scissors, Rename, Share2, Lock, Unlock, Eye,
  EyeOff, Grid, List, TreeView, HardDrive, Cpu, Activity,
  CheckCircle, AlertTriangle, Info, X, ArrowLeft, ArrowRight,
  Home, Star, Clock, Tag, Hash, Shield, Zap, Terminal,
  Code2, Braces, Database, Network, Globe, Settings, Bell,
  Maximize2, Minimize2, RefreshCw, SortAsc, SortDesc, FilterIcon,
  FolderPlus, FilePlus, GitBranch, GitCommit, GitPullRequest,
  Package, Box, Layers, Server, Cloud, CloudOff, Wifi,
  Battery, Thermometer, Cpu as CpuIcon, MemoryStick,
  BarChart3, PieChart, LineChart, Radar, RadarChart,
  PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer,
  Cell, Tooltip, Legend,
} from "lucide-react";
import {
  PieChart as RechartsPie, Pie, Cell as RechartsCell,
  ResponsiveContainer as RechartsResponsiveContainer, Tooltip as RechartsTooltip,
} from "recharts";

// ============================================================================
// TYPE DEFINITIONS - FILE SYSTEM ARCHITECTURE
// ============================================================================

type FileType = "folder" | "file";
type FileExtension = "ts" | "tsx" | "js" | "jsx" | "py" | "md" | "json" | "html" | "css" | "png" | "jpg" | "mp4" | "zip" | "txt" | "log" | "yml" | "sh";
type ViewMode = "grid" | "list" | "tree";
type SortOption = "name" | "date" | "size" | "type";
type ContextMenuAction = "open" | "rename" | "delete" | "copy" | "cut" | "properties" | "share" | "encrypt";

interface FileNode {
  id: string;
  name: string;
  type: FileType;
  extension?: FileExtension;
  size?: number;
  modifiedAt: Date;
  createdAt: Date;
  isHidden?: boolean;
  isEncrypted?: boolean;
  isFavorite?: boolean;
  permissions?: string;
  owner?: string;
  tags?: string[];
  children?: FileNode[];
  content?: string; // For preview
  iconColor?: string;
}

interface BreadcrumbItem {
  id: string;
  name: string;
  path: string;
}

interface ContextMenuState {
  visible: boolean;
  x: number;
  y: number;
  target: FileNode | null;
}

// ============================================================================
// MOCK DATA - THE SOVEREIGN VAULT
// ============================================================================

const generateMockVFS = (): FileNode => ({
  id: "root",
  name: "JARVIS_ROOT",
  type: "folder",
  modifiedAt: new Date(),
  createdAt: new Date(),
  permissions: "drwxr-xr-x",
  owner: "root",
  children: [
    {
      id: "home",
      name: "home",
      type: "folder",
      modifiedAt: new Date(),
      createdAt: new Date(),
      children: [
        {
          id: "architect",
          name: "architect",
          type: "folder",
          modifiedAt: new Date(),
          createdAt: new Date(),
          children: [
            {
              id: "projects",
              name: "projects",
              type: "folder",
              modifiedAt: new Date(),
              createdAt: new Date(),
              children: [
                {
                  id: "jarvis_sovereign",
                  name: "jarvis_sovereign",
                  type: "folder",
                  modifiedAt: new Date(),
                  createdAt: new Date(),
                  children: [
                    {
                      id: "core",
                      name: "core",
                      type: "folder",
                      modifiedAt: new Date(),
                      createdAt: new Date(),
                      children: [
                        { id: "neural_net", name: "neural_net.py", type: "file", extension: "py", size: 45000, modifiedAt: new Date(), createdAt: new Date(), content: "import torch\n\nclass JARVIS:\n    def think(self): pass", iconColor: "text-blue-400" },
                        { id: "self_heal", name: "self_heal.py", type: "file", extension: "py", size: 12000, modifiedAt: new Date(), createdAt: new Date(), content: "# Self-healing protocol", iconColor: "text-blue-400" },
                        { id: "god_protocol", name: "god_protocol.ts", type: "file", extension: "ts", size: 89000, modifiedAt: new Date(), createdAt: new Date(), content: "export const GOD_MODE = true;", iconColor: "text-cyan-400" },
                      ],
                    },
                    {
                      id: "ui_renders",
                      name: "ui_renders",
                      type: "folder",
                      modifiedAt: new Date(),
                      createdAt: new Date(),
                      children: [
                        { id: "custom_chart", name: "custom_chart.html", type: "file", extension: "html", size: 8500, modifiedAt: new Date(), createdAt: new Date(), content: "<html>...</html>", iconColor: "text-orange-400" },
                        { id: "dashboard", name: "dashboard.tsx", type: "file", extension: "tsx", size: 125000, modifiedAt: new Date(), createdAt: new Date(), content: "export default function Dashboard() {}", iconColor: "text-cyan-400" },
                      ],
                    },
                    { id: "package_json", name: "package.json", type: "file", extension: "json", size: 2400, modifiedAt: new Date(), createdAt: new Date(), content: "{ \"name\": \"jarvis\" }", iconColor: "text-yellow-400" },
                    { id: "readme", name: "README.md", type: "file", extension: "md", size: 15000, modifiedAt: new Date(), createdAt: new Date(), content: "# JARVIS V5.0\nThe God Protocol.", iconColor: "text-white" },
                  ],
                },
                {
                  id: "stark_industries",
                  name: "stark_industries",
                  type: "folder",
                  modifiedAt: new Date(),
                  createdAt: new Date(),
                  children: [
                    { id: "arc_reactor", name: "arc_reactor_specs.pdf", type: "file", extension: "txt", size: 5400000, modifiedAt: new Date(), createdAt: new Date(), isEncrypted: true, iconColor: "text-red-400" },
                    { id: "suit_blueprints", name: "suit_blueprints.png", type: "file", extension: "png", size: 12000000, modifiedAt: new Date(), createdAt: new Date(), iconColor: "text-purple-400" },
                  ],
                },
              ],
            },
            {
              id: "documents",
              name: "documents",
              type: "folder",
              modifiedAt: new Date(),
              createdAt: new Date(),
              children: [
                { id: "classified", name: "classified_docs.zip", type: "file", extension: "zip", size: 45000000, modifiedAt: new Date(), createdAt: new Date(), isEncrypted: true, iconColor: "text-red-400" },
                { id: "notes", name: "meeting_notes.txt", type: "file", extension: "txt", size: 4500, modifiedAt: new Date(), createdAt: new Date(), iconColor: "text-gray-400" },
              ],
            },
            { id: "bash_history", name: ".bash_history", type: "file", extension: "sh", size: 1200, modifiedAt: new Date(), createdAt: new Date(), isHidden: true, iconColor: "text-green-400" },
          ],
        },
      ],
    },
    {
      id: "etc",
      name: "etc",
      type: "folder",
      modifiedAt: new Date(),
      createdAt: new Date(),
      children: [
        { id: "passwd", name: "passwd", type: "file", extension: "txt", size: 1024, modifiedAt: new Date(), createdAt: new Date(), iconColor: "text-gray-400" },
        { id: "hosts", name: "hosts", type: "file", extension: "txt", size: 512, modifiedAt: new Date(), createdAt: new Date(), iconColor: "text-gray-400" },
      ],
    },
    {
      id: "var",
      name: "var",
      type: "folder",
      modifiedAt: new Date(),
      createdAt: new Date(),
      children: [
        {
          id: "log",
          name: "log",
          type: "folder",
          modifiedAt: new Date(),
          createdAt: new Date(),
          children: [
            { id: "syslog", name: "syslog", type: "file", extension: "log", size: 50000, modifiedAt: new Date(), createdAt: new Date(), iconColor: "text-yellow-400" },
            { id: "auth_log", name: "auth.log", type: "file", extension: "log", size: 120000, modifiedAt: new Date(), createdAt: new Date(), iconColor: "text-yellow-400" },
          ],
        },
      ],
    },
  ],
});

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

const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }).format(date);
};

const getFileIcon = (node: FileNode) => {
  if (node.type === "folder") return Folder;
  switch (node.extension) {
    case "ts": case "tsx": case "js": case "jsx": return FileCode;
    case "py": return FileCode;
    case "json": return FileJson;
    case "md": case "txt": return FileText;
    case "html": case "css": return FileCode;
    case "png": case "jpg": case "jpeg": return FileImage;
    case "mp4": case "mov": return FileVideo;
    case "zip": case "tar": case "gz": return FileArchive;
    case "log": return FileText;
    default: return File;
  }
};

const findNodeById = (root: FileNode, id: string): FileNode | null => {
  if (root.id === id) return root;
  if (root.children) {
    for (const child of root.children) {
      const found = findNodeById(child, id);
      if (found) return found;
    }
  }
  return null;
};

const getPathToNode = (root: FileNode, targetId: string, path: FileNode[] = []): FileNode[] | null => {
  if (root.id === targetId) return [...path, root];
  if (root.children) {
    for (const child of root.children) {
      const result = getPathToNode(child, targetId, [...path, root]);
      if (result) return result;
    }
  }
  return null;
};

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

const TreeNode: React.FC<{
  node: FileNode;
  depth: number;
  expandedFolders: Set<string>;
  selectedId: string | null;
  onToggle: (id: string) => void;
  onSelect: (node: FileNode) => void;
  onContextMenu: (e: React.MouseEvent, node: FileNode) => void;
}> = ({ node, depth, expandedFolders, selectedId, onToggle, onSelect, onContextMenu }) => {
  const isExpanded = expandedFolders.has(node.id);
  const isSelected = selectedId === node.id;
  const Icon = getFileIcon(node);
  const hasChildren = node.children && node.children.length > 0;

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        className={`flex items-center gap-2 py-1.5 px-2 rounded-lg cursor-pointer transition-all group ${
          isSelected ? "bg-cyan-500/20 border border-cyan-500/50" : "hover:bg-white/5 border border-transparent"
        }`}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
        onClick={() => {
          if (node.type === "folder") onToggle(node.id);
          onSelect(node);
        }}
        onContextMenu={(e) => onContextMenu(e, node)}
      >
        {hasChildren ? (
          isExpanded ? <ChevronDown className="w-3 h-3 text-white/40" /> : <ChevronRight className="w-3 h-3 text-white/40" />
        ) : (
          <div className="w-3" />
        )}
        
        {node.type === "folder" ? (
          isExpanded ? <FolderOpen className="w-4 h-4 text-yellow-400" /> : <Folder className="w-4 h-4 text-yellow-400/70" />
        ) : (
          <Icon className={`w-4 h-4 ${node.iconColor || "text-white/60"}`} />
        )}
        
        <span className={`text-xs truncate ${isSelected ? "text-cyan-300 font-medium" : "text-white/80"} ${node.isHidden ? "opacity-50" : ""}`}>
          {node.name}
        </span>
        
        {node.isEncrypted && <Lock className="w-3 h-3 text-red-400 ml-auto" />}
        {node.isFavorite && <Star className="w-3 h-3 text-yellow-400 fill-yellow-400 ml-1" />}
      </motion.div>

      <AnimatePresence>
        {isExpanded && hasChildren && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            {node.children!.map(child => (
              <TreeNode
                key={child.id}
                node={child}
                depth={depth + 1}
                expandedFolders={expandedFolders}
                selectedId={selectedId}
                onToggle={onToggle}
                onSelect={onSelect}
                onContextMenu={onContextMenu}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const FileCard: React.FC<{
  node: FileNode;
  isSelected: boolean;
  onSelect: (node: FileNode) => void;
  onContextMenu: (e: React.MouseEvent, node: FileNode) => void;
}> = ({ node, isSelected, onSelect, onContextMenu }) => {
  const Icon = getFileIcon(node);
  
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -2 }}
      className={`relative p-4 rounded-xl border backdrop-blur-xl cursor-pointer transition-all group ${
        isSelected 
          ? "bg-cyan-500/10 border-cyan-500/50 shadow-[0_0_20px_rgba(6,182,212,0.2)]" 
          : "bg-black/40 border-white/10 hover:border-white/30 hover:bg-white/5"
      }`}
      onClick={() => onSelect(node)}
      onContextMenu={(e) => onContextMenu(e, node)}
    >
      <div className="flex flex-col items-center text-center gap-3">
        <div className={`p-3 rounded-lg ${node.type === "folder" ? "bg-yellow-500/10" : "bg-white/5"}`}>
          {node.type === "folder" ? (
            <FolderOpen className="w-8 h-8 text-yellow-400" />
          ) : (
            <Icon className={`w-8 h-8 ${node.iconColor || "text-white/60"}`} />
          )}
        </div>
        <div className="w-full">
          <div className={`text-xs font-medium truncate ${isSelected ? "text-cyan-300" : "text-white/90"}`}>
            {node.name}
          </div>
          <div className="text-[10px] text-white/40 mt-1">
            {node.type === "folder" ? `${node.children?.length || 0} items` : formatBytes(node.size || 0)}
          </div>
          <div className="text-[10px] text-white/30 mt-0.5">
            {formatDate(node.modifiedAt)}
          </div>
        </div>
      </div>
      
      {node.isEncrypted && (
        <div className="absolute top-2 right-2 p-1 rounded bg-red-500/20 border border-red-500/50">
          <Lock className="w-3 h-3 text-red-400" />
        </div>
      )}
      
      {isSelected && (
        <motion.div
          layoutId="selection-ring"
          className="absolute inset-0 rounded-xl border-2 border-cyan-400 pointer-events-none"
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        />
      )}
    </motion.div>
  );
};

const FileRow: React.FC<{
  node: FileNode;
  isSelected: boolean;
  onSelect: (node: FileNode) => void;
  onContextMenu: (e: React.MouseEvent, node: FileNode) => void;
}> = ({ node, isSelected, onSelect, onContextMenu }) => {
  const Icon = getFileIcon(node);
  
  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className={`flex items-center gap-4 p-3 rounded-lg border cursor-pointer transition-all ${
        isSelected 
          ? "bg-cyan-500/10 border-cyan-500/50" 
          : "bg-black/20 border-white/5 hover:bg-white/5 hover:border-white/20"
      }`}
      onClick={() => onSelect(node)}
      onContextMenu={(e) => onContextMenu(e, node)}
    >
      <div className={`p-2 rounded-lg ${node.type === "folder" ? "bg-yellow-500/10" : "bg-white/5"}`}>
        {node.type === "folder" ? (
          <Folder className="w-5 h-5 text-yellow-400" />
        ) : (
          <Icon className={`w-5 h-5 ${node.iconColor || "text-white/60"}`} />
        )}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className={`text-sm font-medium truncate ${isSelected ? "text-cyan-300" : "text-white/90"}`}>
          {node.name}
        </div>
        <div className="text-[10px] text-white/40 flex items-center gap-2">
          {node.type === "folder" ? `${node.children?.length || 0} items` : node.extension?.toUpperCase()}
          {node.isEncrypted && <Lock className="w-3 h-3 text-red-400" />}
        </div>
      </div>
      
      <div className="text-xs text-white/60 w-24 text-right">
        {node.type === "folder" ? "-" : formatBytes(node.size || 0)}
      </div>
      <div className="text-xs text-white/60 w-32 text-right">
        {formatDate(node.modifiedAt)}
      </div>
      <div className="text-xs text-white/40 w-24 text-right font-mono">
        {node.permissions || "-rw-r--r--"}
      </div>
    </motion.div>
  );
};

const ContextMenu: React.FC<{
  state: ContextMenuState;
  onClose: () => void;
  onAction: (action: ContextMenuAction, node: FileNode) => void;
}> = ({ state, onClose, onAction }) => {
  if (!state.visible || !state.target) return null;

  const actions: { id: ContextMenuAction; label: string; icon: React.ReactNode; danger?: boolean }[] = [
    { id: "open", label: "Open", icon: <Eye className="w-4 h-4" /> },
    { id: "rename", label: "Rename", icon: <Edit className="w-4 h-4" /> },
    { id: "copy", label: "Copy", icon: <Copy className="w-4 h-4" /> },
    { id: "cut", label: "Cut", icon: <Scissors className="w-4 h-4" /> },
    { id: "share", label: "Share", icon: <Share2 className="w-4 h-4" /> },
    { id: "encrypt", label: state.target.isEncrypted ? "Decrypt" : "Encrypt", icon: state.target.isEncrypted ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" /> },
    { id: "properties", label: "Properties", icon: <Info className="w-4 h-4" /> },
    { id: "delete", label: "Delete", icon: <Trash2 className="w-4 h-4" />, danger: true },
  ];

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} onContextMenu={(e) => { e.preventDefault(); onClose(); }} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="fixed z-50 w-56 bg-black/90 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl overflow-hidden py-2"
        style={{ left: state.x, top: state.y }}
      >
        <div className="px-4 py-2 border-b border-white/10 mb-1">
          <div className="text-xs font-bold text-white truncate">{state.target.name}</div>
          <div className="text-[10px] text-white/40">{state.target.type === "folder" ? "Folder" : formatBytes(state.target.size || 0)}</div>
        </div>
        {actions.map(action => (
          <button
            key={action.id}
            onClick={() => { onAction(action.id, state.target!); onClose(); }}
            className={`w-full flex items-center gap-3 px-4 py-2 text-xs transition-colors ${
              action.danger ? "text-red-400 hover:bg-red-500/10" : "text-white/80 hover:bg-white/10 hover:text-white"
            }`}
          >
            {action.icon}
            {action.label}
          </button>
        ))}
      </motion.div>
    </>
  );
};

const PropertiesPanel: React.FC<{ node: FileNode | null; onClose: () => void }> = ({ node, onClose }) => {
  if (!node) return null;
  const Icon = getFileIcon(node);

  const storageData = [
    { name: "Used", value: 65, color: "#06b6d4" },
    { name: "Free", value: 35, color: "#1e293b" },
  ];

  return (
    <motion.div
      initial={{ x: 300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 300, opacity: 0 }}
      className="w-80 bg-black/60 backdrop-blur-xl border-l border-white/10 p-6 overflow-y-auto"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-sm font-bold text-white tracking-widest">PROPERTIES</h3>
        <button onClick={onClose} className="text-white/40 hover:text-white"><X className="w-4 h-4" /></button>
      </div>

      <div className="flex flex-col items-center mb-6 pb-6 border-b border-white/10">
        <div className={`p-4 rounded-2xl mb-4 ${node.type === "folder" ? "bg-yellow-500/10" : "bg-white/5"}`}>
          {node.type === "folder" ? (
            <FolderOpen className="w-12 h-12 text-yellow-400" />
          ) : (
            <Icon className={`w-12 h-12 ${node.iconColor || "text-white/60"}`} />
          )}
        </div>
        <div className="text-base font-bold text-white text-center break-all">{node.name}</div>
        <div className="text-xs text-white/40 mt-1">{node.type === "folder" ? "Directory" : node.extension?.toUpperCase() + " File"}</div>
      </div>

      <div className="space-y-4">
        <div>
          <div className="text-[10px] text-white/40 uppercase tracking-wider mb-1">Information</div>
          <div className="bg-black/40 rounded-lg p-3 space-y-2 text-xs">
            <div className="flex justify-between"><span className="text-white/60">Size</span><span className="text-white">{node.type === "folder" ? "-" : formatBytes(node.size || 0)}</span></div>
            <div className="flex justify-between"><span className="text-white/60">Created</span><span className="text-white">{formatDate(node.createdAt)}</span></div>
            <div className="flex justify-between"><span className="text-white/60">Modified</span><span className="text-white">{formatDate(node.modifiedAt)}</span></div>
            <div className="flex justify-between"><span className="text-white/60">Owner</span><span className="text-white">{node.owner || "architect"}</span></div>
          </div>
        </div>

        <div>
          <div className="text-[10px] text-white/40 uppercase tracking-wider mb-1">Permissions</div>
          <div className="bg-black/40 rounded-lg p-3 text-xs font-mono text-cyan-400">
            {node.permissions || (node.type === "folder" ? "drwxr-xr-x" : "-rw-r--r--")}
          </div>
        </div>

        <div>
          <div className="text-[10px] text-white/40 uppercase tracking-wider mb-1">Security</div>
          <div className="bg-black/40 rounded-lg p-3 space-y-2 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-white/60">Encryption</span>
              {node.isEncrypted ? (
                <span className="flex items-center gap-1 text-red-400"><Lock className="w-3 h-3" /> AES-256</span>
              ) : (
                <span className="text-green-400">None</span>
              )}
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/60">Hash (SHA-256)</span>
            </div>
            <div className="text-[10px] text-white/40 font-mono break-all">
              e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855
            </div>
          </div>
        </div>

        {node.type === "file" && (
          <div>
            <div className="text-[10px] text-white/40 uppercase tracking-wider mb-1">Storage Allocation</div>
            <div className="bg-black/40 rounded-lg p-3 h-32">
              <RechartsResponsiveContainer width="100%" height="100%">
                <RechartsPie>
                  <RechartsPie data={storageData} cx="50%" cy="50%" innerRadius={30} outerRadius={50} paddingAngle={2} dataKey="value">
                    {storageData.map((entry, index) => (
                      <RechartsCell key={`cell-${index}`} fill={entry.color} stroke="none" />
                    ))}
                  </RechartsPie>
                  <RechartsTooltip contentStyle={{ backgroundColor: "rgba(0,0,0,0.9)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "white", fontSize: "10px" }} />
                </RechartsPie>
              </RechartsResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

// ============================================================================
// MAIN FILE MANAGER COMPONENT
// ============================================================================

export default function FileManager() {
  const [vfs] = useState<FileNode>(generateMockVFS());
  const [currentFolderId, setCurrentFolderId] = useState<string>("jarvis_sovereign");
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(["root", "home", "architect", "projects"]));
  const [selectedNode, setSelectedNode] = useState<FileNode | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [showProperties, setShowProperties] = useState(true);
  const [contextMenu, setContextMenu] = useState<ContextMenuState>({ visible: false, x: 0, y: 0, target: null });
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([]);

  const currentFolder = useMemo(() => findNodeById(vfs, currentFolderId), [vfs, currentFolderId]);
  
  useEffect(() => {
    if (currentFolder) {
      const path = getPathToNode(vfs, currentFolderId);
      if (path) {
        setBreadcrumbs(path.map(n => ({ id: n.id, name: n.name, path: n.id })));
      }
    }
  }, [currentFolderId, vfs]);

  const handleToggleFolder = useCallback((id: string) => {
    setExpandedFolders(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const handleSelectNode = useCallback((node: FileNode) => {
    setSelectedNode(node);
    if (node.type === "folder") {
      setCurrentFolderId(node.id);
      handleToggleFolder(node.id);
    }
  }, [handleToggleFolder]);

  const handleContextMenu = useCallback((e: React.MouseEvent, node: FileNode) => {
    e.preventDefault();
    setContextMenu({ visible: true, x: e.clientX, y: e.clientY, target: node });
  }, []);

  const handleAction = useCallback((action: ContextMenuAction, node: FileNode) => {
    console.log(`Action: ${action} on ${node.name}`);
    // Implement actual logic here (API calls, state updates)
  }, []);

  const filteredChildren = useMemo(() => {
    if (!currentFolder?.children) return [];
    return currentFolder.children.filter(child => 
      child.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [currentFolder, searchQuery]);

  return (
    <div className="flex h-full bg-black text-white overflow-hidden">
      {/* LEFT SIDEBAR - TREE VIEW */}
      <div className="w-72 bg-black/40 border-r border-white/10 flex flex-col">
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center gap-2 mb-4">
            <HardDrive className="w-5 h-5 text-cyan-400" />
            <h2 className="text-sm font-bold tracking-widest">SOVEREIGN VAULT</h2>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-white/40" />
            <input
              type="text"
              placeholder="Search files..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-black/50 border border-white/10 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500/50"
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-2 custom-scrollbar">
          <TreeNode
            node={vfs}
            depth={0}
            expandedFolders={expandedFolders}
            selectedId={currentFolderId}
            onToggle={handleToggleFolder}
            onSelect={handleSelectNode}
            onContextMenu={handleContextMenu}
          />
        </div>

        <div className="p-4 border-t border-white/10">
          <div className="text-[10px] text-white/40 mb-2">STORAGE USAGE</div>
          <div className="h-1.5 bg-black/50 rounded-full overflow-hidden mb-2">
            <div className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 w-[65%]" />
          </div>
          <div className="flex justify-between text-[10px]">
            <span className="text-white/60">650 GB Used</span>
            <span className="text-white/40">1 TB Total</span>
          </div>
        </div>
      </div>

      {/* CENTER - FILE GRID/LIST */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Toolbar */}
        <div className="p-4 border-b border-white/10 bg-black/20">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-xs text-white/60">
              <Home className="w-4 h-4 cursor-pointer hover:text-white" onClick={() => setCurrentFolderId("root")} />
              {breadcrumbs.map((crumb, index) => (
                <React.Fragment key={crumb.id}>
                  <ChevronRight className="w-3 h-3" />
                  <span 
                    className={`cursor-pointer hover:text-white ${index === breadcrumbs.length - 1 ? "text-cyan-400 font-medium" : ""}`}
                    onClick={() => setCurrentFolderId(crumb.id)}
                  >
                    {crumb.name}
                  </span>
                </React.Fragment>
              ))}
            </div>
            
            <div className="flex items-center gap-2">
              <button className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"><Plus className="w-4 h-4" /></button>
              <button className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"><Upload className="w-4 h-4" /></button>
              <button className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"><RefreshCw className="w-4 h-4" /></button>
              <div className="w-px h-6 bg-white/10 mx-1" />
              <button 
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-lg transition-colors ${viewMode === "grid" ? "bg-cyan-500/20 text-cyan-400" : "bg-white/5 text-white/60 hover:bg-white/10"}`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-lg transition-colors ${viewMode === "list" ? "bg-cyan-500/20 text-cyan-400" : "bg-white/5 text-white/60 hover:bg-white/10"}`}
              >
                <List className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setShowProperties(!showProperties)}
                className={`p-2 rounded-lg transition-colors ${showProperties ? "bg-cyan-500/20 text-cyan-400" : "bg-white/5 text-white/60 hover:bg-white/10"}`}
              >
                <Info className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* File Area */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          {filteredChildren.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-white/40">
              <FolderOpen className="w-16 h-16 mb-4 opacity-50" />
              <p className="text-sm">This folder is empty</p>
            </div>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {filteredChildren.map(child => (
                <FileCard
                  key={child.id}
                  node={child}
                  isSelected={selectedNode?.id === child.id}
                  onSelect={handleSelectNode}
                  onContextMenu={handleContextMenu}
                />
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center gap-4 px-3 pb-2 border-b border-white/10 text-[10px] text-white/40 uppercase tracking-wider">
                <div className="w-9"></div>
                <div className="flex-1">Name</div>
                <div className="w-24 text-right">Size</div>
                <div className="w-32 text-right">Modified</div>
                <div className="w-24 text-right">Perms</div>
              </div>
              {filteredChildren.map(child => (
                <FileRow
                  key={child.id}
                  node={child}
                  isSelected={selectedNode?.id === child.id}
                  onSelect={handleSelectNode}
                  onContextMenu={handleContextMenu}
                />
              ))}
            </div>
          )}
        </div>

        {/* Status Bar */}
        <div className="px-4 py-2 border-t border-white/10 bg-black/40 text-[10px] text-white/40 flex justify-between">
          <span>{filteredChildren.length} items</span>
          <span>{selectedNode ? `Selected: ${selectedNode.name}` : "No selection"}</span>
          <span className="flex items-center gap-1"><Shield className="w-3 h-3 text-green-400" /> Encrypted Connection</span>
        </div>
      </div>

      {/* RIGHT SIDEBAR - PROPERTIES */}
      <AnimatePresence>
        {showProperties && <PropertiesPanel node={selectedNode} onClose={() => setShowProperties(false)} />}
      </AnimatePresence>

      {/* CONTEXT MENU */}
      <ContextMenu state={contextMenu} onClose={() => setContextMenu(prev => ({ ...prev, visible: false }))} onAction={handleAction} />
    </div>
  );
}