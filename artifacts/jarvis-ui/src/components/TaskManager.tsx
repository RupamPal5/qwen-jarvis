"use client";
import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import {
  motion, AnimatePresence, Reorder
} from "framer-motion";
import {
  Plus, Search, Filter, Download, Upload, Trash2, Edit, Check, X, ChevronDown, ChevronRight, ChevronLeft, Calendar, Clock, User, Users, Tag, Flag, AlertCircle, AlertTriangle, Info, CheckCircle, BarChart3, TrendingUp, MoreVertical, MoreHorizontal, Copy, Link as LinkIcon, MessageSquare, FileText, Image, Video, Paperclip, Star, StarOff, Bookmark, Archive, Play, Pause, Square, RotateCcw, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, GripVertical, Layers, List, Grid, Kanban, Timer, TimerOff, TimerReset, Zap, Target, Trophy, Award, GitBranch, GitCommit, GitPullRequest, GitMerge, Database, Server, Cloud, CloudOff, Bell, BellOff, Settings, Sliders, Eye, EyeOff, Lock, Unlock, Folder, FolderOpen, FolderPlus, Hash, AtSign, DollarSign, Percent, Activity, TrendingDown, CalendarDays, CalendarCheck, CalendarClock, UserCheck, UserX, UserPlus, UserMinus, Briefcase, Code, Bug, Palette, Lightbulb, Rocket, Shield, Key, Mail, Phone, Globe, MapPin, Sun, Moon, Monitor, Smartphone, Cpu, MemoryStick, HardDrive, Network, Wifi, WifiOff, Bluetooth, Usb, Battery, BatteryCharging, Power, Thermometer, Fan, Gauge, Navigation, Compass, Map, Satellite, SatelliteDish, Radio, Signal, Volume2, VolumeX, Mic, MicOff, Camera, CameraOff, SkipForward, SkipBack, Repeat, Shuffle, Heart, ThumbsUp, ThumbsDown, Share2, ExternalLink, Save, SaveAll, Printer, Scan, QrCode, ZoomIn, ZoomOut, Focus, Maximize, Maximize2, Minimize, Minimize2, Expand, Fullscreen, RefreshCw, RefreshCcw, Loader, CheckSquare, Circle, ListOrdered, ListTodo, ListChecks, AlignLeft, AlignCenter, AlignRight, Bold, Italic, Underline, Strikethrough, Type, Heading, Code2, Braces, Terminal as TerminalIcon, Brain, Sparkles, Wand2, Crown, Gem, Diamond, Flame, Snowflake, Umbrella, CloudRain, Bolt, Plane, Train, Car, Bike, Footprints, Dumbbell, Weight, Scale, Hammer, Wrench, ToggleLeft, ToggleRight, FormInput, Badge, File, Music, Film, Tv, Book, BookOpen, Library, GraduationCap, Medal, Gift, PartyPopper, Coffee, Beer, Wine, Pizza, Sandwich, Apple, Banana, Carrot, Dog, Cat, Bird, Flower, Leaf, Home, Building, Hospital, School, University, Store, ShoppingCart, CreditCard, Wallet, PiggyBank, Coins, ChartLine, ChartBar, ChartPie, CloudUpload, CloudDownload, Share, Send, MessageCircle, Inbox, AlarmClock, Hourglass, Handshake, Fingerprint, ShieldCheck
} from "lucide-react";
import {
  LineChart as RechartsLineChart, Line as RechartsLine, XAxis as RechartsXAxis, YAxis as RechartsYAxis, CartesianGrid as RechartsCartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer as RechartsResponsiveContainer, AreaChart as RechartsAreaChart, Area as RechartsArea, BarChart as RechartsBarChart, Bar as RechartsBar, PieChart as RechartsPieChart, Pie as RechartsPie, Cell as RechartsCell, ComposedChart as RechartsComposedChart, ReferenceLine as RechartsReferenceLine, Legend as RechartsLegend, RadialBarChart, RadialBar, ScatterChart as RechartsScatterChart, Scatter as RechartsScatter, ZAxis as RechartsZAxis
} from "recharts";

// ============================================================================
// TYPE DEFINITIONS — TASK MANAGEMENT DATA STRUCTURES
// ============================================================================

type TaskPriority = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "NONE";
type TaskStatus = "BACKLOG" | "TODO" | "IN_PROGRESS" | "REVIEW" | "DONE" | "ARCHIVED";
type TaskType = "FEATURE" | "BUG" | "TASK" | "DESIGN" | "RESEARCH" | "MEETING" | "DOCUMENTATION";
type TaskComplexity = "XS" | "S" | "M" | "L" | "XL" | "XXL";
type TimeTrackingStatus = "NOT_STARTED" | "IN_PROGRESS" | "PAUSED" | "COMPLETED";

interface User {
  id: string;
  name: string;
  avatar?: string;
  role: string;
  email: string;
  status: "ONLINE" | "OFFLINE" | "BUSY" | "AWAY";
}

interface Tag {
  id: string;
  name: string;
  color: string;
  icon?: string;
}

interface Comment {
  id: string;
  authorId: string;
  content: string;
  timestamp: Date;
  edited?: boolean;
  attachments?: string[];
  reactions?: { emoji: string; userIds: string[] }[];
}

interface Subtask {
  id: string;
  title: string;
  completed: boolean;
  assigneeId?: string;
  dueDate?: Date;
}

interface TimeEntry {
  id: string;
  startTime: Date;
  endTime?: Date;
  duration: number; // in seconds
  description?: string;
  billable: boolean;
}

interface TaskDependency {
  taskId: string;
  type: "BLOCKS" | "BLOCKED_BY" | "RELATED" | "DUPLICATE";
}

interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  type: TaskType;
  complexity: TaskComplexity;
  assigneeId?: string;
  creatorId: string;
  tags: string[];
  dueDate?: Date;
  startDate?: Date;
  completedDate?: Date;
  estimatedHours: number;
  actualHours: number;
  progress: number; // 0-100
  subtasks: Subtask[];
  comments: Comment[];
  timeEntries: TimeEntry[];
  timeTrackingStatus: TimeTrackingStatus;
  dependencies: TaskDependency[];
  attachments: string[];
  checklist: { id: string; text: string; completed: boolean }[];
  notes: string;
  links: { title: string; url: string }[];
  customFields: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
  archived: boolean;
  pinned: boolean;
  starred: boolean;
  color?: string;
  position: number; // for ordering within column
  sprintId?: string;
  epicId?: string;
  storyPoints: number;
  velocity?: number;
  riskLevel: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  blockers: string[];
  labels: string[];
  watchers: string[];
  mentions: string[];
}

interface Column {
  id: TaskStatus;
  title: string;
  color: string;
  icon: React.ReactNode;
  limit?: number;
  tasks: Task[];
}

interface Project {
  id: string;
  name: string;
  description: string;
  color: string;
  icon: string;
  members: string[];
  startDate: Date;
  endDate?: Date;
  status: "ACTIVE" | "COMPLETED" | "ARCHIVED" | "ON_HOLD";
}

interface Sprint {
  id: string;
  name: string;
  projectId: string;
  startDate: Date;
  endDate: Date;
  goal: string;
  status: "PLANNED" | "ACTIVE" | "COMPLETED";
  velocity: number;
  capacity: number;
}

interface TaskFilter {
  searchQuery: string;
  priorities: TaskPriority[];
  types: TaskType[];
  assignees: string[];
  tags: string[];
  dueDateRange?: { start: Date; end: Date };
  complexity: TaskComplexity[];
  hasSubtasks?: boolean;
  hasComments?: boolean;
  hasAttachments?: boolean;
  isOverdue?: boolean;
  isPinned?: boolean;
  isStarred?: boolean;
  sprintId?: string;
  epicId?: string;
}

interface TaskStatistics {
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  overdueTasks: number;
  avgCompletionTime: number;
  velocity: number;
  burndown: { day: string; remaining: number; ideal: number }[];
  priorityDistribution: { priority: string; count: number }[];
  typeDistribution: { type: string; count: number }[];
  assigneeWorkload: { assignee: string; tasks: number; hours: number }[];
  weeklyCompletion: { week: string; completed: number }[];
  cycleTime: { avg: number; median: number; p95: number };
  throughput: { week: string; tasks: number }[];
  cumulativeFlow: { date: string; backlog: number; todo: number; inProgress: number; review: number; done: number }[];
}

// ============================================================================
// UTILITY FUNCTIONS — TASK MANAGEMENT HELPERS
// ============================================================================

const generateTaskId = (): string => {
  return `task_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
};

const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

const formatRelativeTime = (date: Date): string => {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 30) return formatDate(date);
  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return "Just now";
};

const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
};

const getPriorityColor = (priority: TaskPriority): string => {
  const colors: Record<TaskPriority, string> = {
    CRITICAL: "text-red-400 bg-red-500/20 border-red-500/50",
    HIGH: "text-orange-400 bg-orange-500/20 border-orange-500/50",
    MEDIUM: "text-yellow-400 bg-yellow-500/20 border-yellow-500/50",
    LOW: "text-blue-400 bg-blue-500/20 border-blue-500/50",
    NONE: "text-slate-400 bg-slate-500/20 border-slate-500/50",
  };
  return colors[priority];
};

const getStatusColor = (status: TaskStatus): string => {
  const colors: Record<TaskStatus, string> = {
    BACKLOG: "text-slate-400",
    TODO: "text-blue-400",
    IN_PROGRESS: "text-yellow-400",
    REVIEW: "text-purple-400",
    DONE: "text-green-400",
    ARCHIVED: "text-slate-600",
  };
  return colors[status];
};

const getTypeIcon = (type: TaskType): React.ReactNode => {
  const icons: Record<TaskType, React.ReactNode> = {
    FEATURE: <Sparkles size={14} />,
    BUG: <Bug size={14} />,
    TASK: <CheckSquare size={14} />,
    DESIGN: <Palette size={14} />,
    RESEARCH: <Search size={14} />,
    MEETING: <Users size={14} />,
    DOCUMENTATION: <FileText size={14} />,
  };
  return icons[type];
};

const getComplexityPoints = (complexity: TaskComplexity): number => {
  const points: Record<TaskComplexity, number> = {
    XS: 1,
    S: 2,
    M: 5,
    L: 8,
    XL: 13,
    XXL: 21,
  };
  return points[complexity];
};

const isOverdue = (task: Task): boolean => {
  if (!task.dueDate || task.status === "DONE" || task.status === "ARCHIVED") return false;
  return new Date() > task.dueDate;
};

const calculateProgress = (task: Task): number => {
  if (task.subtasks.length === 0) return task.progress;
  const completed = task.subtasks.filter(s => s.completed).length;
  return Math.round((completed / task.subtasks.length) * 100);
};

const estimateCompletionDate = (task: Task): Date => {
  const remainingHours = task.estimatedHours - task.actualHours;
  const hoursPerDay = 8;
  const daysRemaining = Math.ceil(remainingHours / hoursPerDay);
  return new Date(Date.now() + daysRemaining * 86400000);
};

// ============================================================================
// DATA SIMULATION — TASK GENERATOR
// ============================================================================

const MOCK_USERS: User[] = [
  { id: "user-1", name: "Rupam (Architect)", role: "Lead Developer", email: "rupam@stark.ind", status: "ONLINE" },
  { id: "user-2", name: "JARVIS Core", role: "AI Assistant", email: "jarvis@stark.ind", status: "ONLINE" },
  { id: "user-3", name: "Tony Stark", role: "Product Owner", email: "tony@stark.ind", status: "BUSY" },
  { id: "user-4", name: "Pepper Potts", role: "Project Manager", email: "pepper@stark.ind", status: "AWAY" },
  { id: "user-5", name: "Happy Hogan", role: "Security", email: "happy@stark.ind", status: "OFFLINE" },
];

const MOCK_TAGS: Tag[] = [
  { id: "tag-1", name: "AI/ML", color: "#a855f7" },
  { id: "tag-2", name: "Blockchain", color: "#06b6d4" },
  { id: "tag-3", name: "Security", color: "#ef4444" },
  { id: "tag-4", name: "UI/UX", color: "#ec4899" },
  { id: "tag-5", name: "Backend", color: "#10b981" },
  { id: "tag-6", name: "DevOps", color: "#f59e0b" },
  { id: "tag-7", name: "Research", color: "#8b5cf6" },
  { id: "tag-8", name: "Critical", color: "#dc2626" },
];

const TASK_TITLES = [
  "Implement neural network visualization",
  "Fix authentication bug in login flow",
  "Design new dashboard layout",
  "Research quantum computing integration",
  "Write API documentation",
  "Setup CI/CD pipeline",
  "Optimize database queries",
  "Add real-time notifications",
  "Implement drag-and-drop functionality",
  "Create user onboarding flow",
  "Build analytics dashboard",
  "Integrate payment gateway",
  "Setup monitoring and alerting",
  "Write unit tests for core modules",
  "Refactor legacy code",
  "Implement caching layer",
  "Add internationalization support",
  "Create mobile responsive design",
  "Setup error tracking",
  "Implement file upload system",
];

const TASK_DESCRIPTIONS = [
  "This task involves implementing a new feature that will improve user experience and system performance.",
  "Critical bug fix required to resolve authentication issues affecting multiple users.",
  "Design and implement a modern, intuitive interface for the main dashboard.",
  "Research and evaluate quantum computing libraries for potential integration.",
  "Create comprehensive API documentation with examples and use cases.",
];

const generateMockTasks = (count: number): Task[] => {
  const tasks: Task[] = [];
  const statuses: TaskStatus[] = ["BACKLOG", "TODO", "IN_PROGRESS", "REVIEW", "DONE"];
  const priorities: TaskPriority[] = ["CRITICAL", "HIGH", "MEDIUM", "LOW", "NONE"];
  const types: TaskType[] = ["FEATURE", "BUG", "TASK", "DESIGN", "RESEARCH"];
  const complexities: TaskComplexity[] = ["XS", "S", "M", "L", "XL", "XXL"];

  for (let i = 0; i < count; i++) {
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const priority = priorities[Math.floor(Math.random() * priorities.length)];
    const type = types[Math.floor(Math.random() * types.length)];
    const complexity = complexities[Math.floor(Math.random() * complexities.length)];
    const estimatedHours = Math.random() * 40 + 2;
    const actualHours = status === "DONE" ? estimatedHours * (0.8 + Math.random() * 0.4) : Math.random() * estimatedHours;
    const progress = status === "DONE" ? 100 : status === "IN_PROGRESS" ? Math.random() * 80 + 10 : status === "REVIEW" ? 90 : 0;
    const dueDate = new Date(Date.now() + (Math.random() - 0.3) * 86400000 * 30);
    const subtaskCount = Math.floor(Math.random() * 5);
    const subtasks: Subtask[] = Array.from({ length: subtaskCount }, (_, j) => ({
      id: `subtask-${i}-${j}`,
      title: `Subtask ${j + 1} for task ${i + 1}`,
      completed: Math.random() > 0.5,
      assigneeId: MOCK_USERS[Math.floor(Math.random() * MOCK_USERS.length)].id,
    }));

    tasks.push({
      id: generateTaskId(),
      title: TASK_TITLES[i % TASK_TITLES.length] + ` #${i + 1}`,
      description: TASK_DESCRIPTIONS[i % TASK_DESCRIPTIONS.length],
      status,
      priority,
      type,
      complexity,
      assigneeId: MOCK_USERS[Math.floor(Math.random() * MOCK_USERS.length)].id,
      creatorId: MOCK_USERS[0].id,
      tags: MOCK_TAGS.sort(() => Math.random() - 0.5).slice(0, Math.floor(Math.random() * 3) + 1).map(t => t.id),
      dueDate: Math.random() > 0.3 ? dueDate : undefined,
      startDate: new Date(Date.now() - Math.random() * 86400000 * 7),
      completedDate: status === "DONE" ? new Date() : undefined,
      estimatedHours,
      actualHours,
      progress,
      subtasks,
      comments: [],
      timeEntries: [],
      timeTrackingStatus: status === "IN_PROGRESS" ? "IN_PROGRESS" : "NOT_STARTED",
      dependencies: [],
      attachments: [],
      checklist: [],
      notes: "",
      links: [],
      customFields: {},
      createdAt: new Date(Date.now() - Math.random() * 86400000 * 30),
      updatedAt: new Date(),
      archived: false,
      pinned: Math.random() > 0.9,
      starred: Math.random() > 0.8,
      position: i,
      storyPoints: getComplexityPoints(complexity),
      riskLevel: priority === "CRITICAL" ? "CRITICAL" : priority === "HIGH" ? "HIGH" : Math.random() > 0.7 ? "MEDIUM" : "LOW",
      blockers: [],
      labels: [],
      watchers: [],
      mentions: [],
    });
  }

  return tasks;
};

// ============================================================================
// SUB-COMPONENTS — MODULAR TASK MANAGER
// ============================================================================

// --- Task Card Component (Draggable) ---
const TaskCard: React.FC<{
  task: Task;
  onDragStart: (e: React.DragEvent, taskId: string) => void;
  onEdit: (task: Task) => void;
  onToggleStar: (taskId: string) => void;
  onTogglePin: (taskId: string) => void;
}> = ({ task, onDragStart, onEdit, onToggleStar, onTogglePin }) => {
  const [isDragging, setIsDragging] = useState(false);
  const overdue = isOverdue(task);
  const progress = calculateProgress(task);
  const assignee = MOCK_USERS.find(u => u.id === task.assigneeId);
  const tags = MOCK_TAGS.filter(t => task.tags.includes(t.id));

  return (
    <motion.div
      layout
      draggable
      onDragStart={(e) => {
        setIsDragging(true);
        onDragStart(e as any, task.id);
      }}
      onDragEnd={() => setIsDragging(false)}
      whileHover={{ scale: 1.02 }}
      whileDrag={{ scale: 1.05, rotate: 2, zIndex: 50 }}
      className={`bg-black/40 backdrop-blur-xl border rounded-xl p-4 cursor-grab active:cursor-grabbing transition-all ${
        isDragging ? "opacity-50 border-purple-500/50 shadow-[0_0_30px_rgba(168,85,247,0.3)]" :
        overdue ? "border-red-500/50 bg-red-500/5" :
        task.pinned ? "border-yellow-500/50 bg-yellow-500/5" :
        "border-white/10 hover:border-purple-500/30"
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2 flex-1">
          <GripVertical className="w-4 h-4 text-white/40 flex-shrink-0" />
          <div className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getPriorityColor(task.priority)}`}>
            {task.priority}
          </div>
          {task.pinned && <Bookmark className="w-3 h-3 text-yellow-400" fill="currentColor" />}
          {overdue && <AlertCircle className="w-3 h-3 text-red-400" />}
        </div>
        <div className="flex gap-1">
          <button
            onClick={(e) => { e.stopPropagation(); onToggleStar(task.id); }}
            className="p-1 hover:bg-white/10 rounded transition-colors"
          >
            <Star className={`w-3 h-3 ${task.starred ? "text-yellow-400" : "text-white/40"}`} fill={task.starred ? "currentColor" : "none"} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onEdit(task); }}
            className="p-1 hover:bg-white/10 rounded transition-colors"
          >
            <Edit className="w-3 h-3 text-white/40" />
          </button>
        </div>
      </div>

      {/* Title */}
      <h4 className="text-sm font-semibold text-white mb-2 line-clamp-2">{task.title}</h4>

      {/* Type & Complexity */}
      <div className="flex items-center gap-2 mb-3">
        <div className="flex items-center gap-1 text-[10px] text-white/60">
          {getTypeIcon(task.type)}
          <span>{task.type}</span>
        </div>
        <div className="px-1.5 py-0.5 rounded bg-white/5 text-[10px] text-white/60">
          {task.complexity} • {task.storyPoints}pts
        </div>
      </div>

      {/* Tags */}
      {tags.length > 0 && (
        <div className="flex gap-1 flex-wrap mb-3">
          {tags.map(tag => (
            <span
              key={tag.id}
              className="px-2 py-0.5 rounded text-[9px] font-medium"
              style={{ backgroundColor: tag.color + "20", color: tag.color, border: `1px solid ${tag.color}50` }}
            >
              {tag.name}
            </span>
          ))}
        </div>
      )}

      {/* Progress RechartsBar */}
      {task.subtasks.length > 0 && (
        <div className="mb-3">
          <div className="flex justify-between text-[10px] text-white/60 mb-1">
            <span>Subtasks</span>
            <span>{task.subtasks.filter(s => s.completed).length}/{task.subtasks.length}</span>
          </div>
          <div className="h-1.5 bg-black/50 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-cyan-500 to-purple-500"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-white/5">
        <div className="flex items-center gap-2">
          {assignee && (
            <div className="flex items-center gap-1">
              <div className="w-5 h-5 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center text-[9px] font-bold text-white">
                {assignee.name[0]}
              </div>
            </div>
          )}
          {task.dueDate && (
            <div className={`flex items-center gap-1 text-[10px] ${overdue ? "text-red-400" : "text-white/60"}`}>
              <Calendar className="w-3 h-3" />
              <span>{formatRelativeTime(task.dueDate)}</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2 text-[10px] text-white/60">
          {task.comments.length > 0 && (
            <div className="flex items-center gap-1">
              <MessageSquare className="w-3 h-3" />
              <span>{task.comments.length}</span>
            </div>
          )}
          {task.attachments.length > 0 && (
            <div className="flex items-center gap-1">
              <Paperclip className="w-3 h-3" />
              <span>{task.attachments.length}</span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

// --- Task Column Component (Drop Zone) ---
const TaskColumn: React.FC<{
  column: Column;
  onDrop: (taskId: string, newStatus: TaskStatus) => void;
  onEditTask: (task: Task) => void;
  onToggleStar: (taskId: string) => void;
  onTogglePin: (taskId: string) => void;
}> = ({ column, onDrop, onEditTask, onToggleStar, onTogglePin }) => {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const taskId = e.dataTransfer.getData("taskId");
    if (taskId) {
      onDrop(taskId, column.id);
    }
  };

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData("taskId", taskId);
    e.dataTransfer.effectAllowed = "move";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex-shrink-0 w-80 bg-black/20 backdrop-blur-xl border rounded-2xl p-4 transition-all ${
        isDragOver ? "border-purple-500/50 bg-purple-500/5 shadow-[0_0_30px_rgba(168,85,247,0.2)]" : "border-white/10"
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${column.color}20`}>
            {column.icon}
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">{column.title}</h3>
            <div className="text-[10px] text-white/60">
              {column.tasks.length} tasks
              {column.limit && ` / ${column.limit}`}
            </div>
          </div>
        </div>
        <button className="p-1 hover:bg-white/10 rounded transition-colors">
          <MoreVertical className="w-4 h-4 text-white/60" />
        </button>
      </div>

      {/* Tasks */}
      <div className="space-y-3 min-h-[200px]">
        <AnimatePresence>
          {column.tasks.map(task => (
            <TaskCard
              key={task.id}
              task={task}
              onDragStart={handleDragStart}
              onEdit={onEditTask}
              onToggleStar={onToggleStar}
              onTogglePin={onTogglePin}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* Add Task Button */}
      <button className="w-full mt-4 p-3 border-2 border-dashed border-white/10 rounded-xl text-xs text-white/60 hover:border-purple-500/50 hover:text-purple-400 transition-all flex items-center justify-center gap-2">
        <Plus className="w-4 h-4" />
        Add Task
      </button>
    </motion.div>
  );
};

// --- Task Modal Component ---
const TaskModal: React.FC<{
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: Task) => void;
}> = ({ task, isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState<Task | null>(task);

  useEffect(() => {
    setFormData(task);
  }, [task]);

  if (!isOpen || !formData) return null;

  const handleSave = () => {
    if (formData) {
      onSave({ ...formData, updatedAt: new Date() });
      onClose();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-gradient-to-br from-slate-900 to-black border border-white/10 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h2 className="text-xl font-bold text-white">
            {task ? "Edit Task" : "Create Task"}
          </h2>
          <button onClick={onClose} className="text-white/60 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)] space-y-6">
          {/* Title */}
          <div>
            <label className="text-xs text-white/60 mb-2 block">Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500/50"
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-xs text-white/60 mb-2 block">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500/50 resize-none"
            />
          </div>

          {/* Status & Priority */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-white/60 mb-2 block">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as TaskStatus })}
                className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500/50"
              >
                <option value="BACKLOG">Backlog</option>
                <option value="TODO">To Do</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="REVIEW">Review</option>
                <option value="DONE">Done</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-white/60 mb-2 block">Priority</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value as TaskPriority })}
                className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500/50"
              >
                <option value="CRITICAL">Critical</option>
                <option value="HIGH">High</option>
                <option value="MEDIUM">Medium</option>
                <option value="LOW">Low</option>
                <option value="NONE">None</option>
              </select>
            </div>
          </div>

          {/* Type & Complexity */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-white/60 mb-2 block">Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as TaskType })}
                className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500/50"
              >
                <option value="FEATURE">Feature</option>
                <option value="BUG">Bug</option>
                <option value="TASK">Task</option>
                <option value="DESIGN">Design</option>
                <option value="RESEARCH">Research</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-white/60 mb-2 block">Complexity</label>
              <select
                value={formData.complexity}
                onChange={(e) => setFormData({ ...formData, complexity: e.target.value as TaskComplexity })}
                className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500/50"
              >
                <option value="XS">XS (1pt)</option>
                <option value="S">S (2pts)</option>
                <option value="M">M (5pts)</option>
                <option value="L">L (8pts)</option>
                <option value="XL">XL (13pts)</option>
                <option value="XXL">XXL (21pts)</option>
              </select>
            </div>
          </div>

          {/* Assignee & Due Date */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-white/60 mb-2 block">Assignee</label>
              <select
                value={formData.assigneeId || ""}
                onChange={(e) => setFormData({ ...formData, assigneeId: e.target.value || undefined })}
                className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500/50"
              >
                <option value="">Unassigned</option>
                {MOCK_USERS.map(user => (
                  <option key={user.id} value={user.id}>{user.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-white/60 mb-2 block">Due Date</label>
              <input
                type="datetime-local"
                value={formData.dueDate ? new Date(formData.dueDate).toISOString().slice(0, 16) : ""}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value ? new Date(e.target.value) : undefined })}
                className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500/50"
              />
            </div>
          </div>

          {/* Estimated Hours */}
          <div>
            <label className="text-xs text-white/60 mb-2 block">Estimated Hours</label>
            <input
              type="number"
              value={formData.estimatedHours}
              onChange={(e) => setFormData({ ...formData, estimatedHours: parseFloat(e.target.value) || 0 })}
              className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500/50"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-white/10">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white/5 border border-white/10 text-white/60 rounded-lg text-sm hover:bg-white/10 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg text-sm font-semibold hover:from-purple-500 hover:to-blue-500 transition-all shadow-[0_0_20px_rgba(168,85,247,0.4)]"
          >
            Save Task
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

// --- Task Statistics Component ---
const TaskStatistics: React.FC<{ tasks: Task[] }> = ({ tasks }) => {
  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.status === "DONE").length;
    const inProgress = tasks.filter(t => t.status === "IN_PROGRESS").length;
    const overdue = tasks.filter(t => isOverdue(t)).length;
    const avgCompletionTime = 24; // hours
    const velocity = 42; // story points per sprint

    const priorityDist = ["CRITICAL", "HIGH", "MEDIUM", "LOW", "NONE"].map(priority => ({
      priority,
      count: tasks.filter(t => t.priority === priority).length,
    }));

    const typeDist = ["FEATURE", "BUG", "TASK", "DESIGN", "RESEARCH"].map(type => ({
      type,
      count: tasks.filter(t => t.type === type).length,
    }));

    const weeklyCompletion = Array.from({ length: 8 }, (_, i) => ({
      week: `W${i + 1}`,
      completed: Math.floor(Math.random() * 20) + 5,
    }));

    return {
      total,
      completed,
      inProgress,
      overdue,
      avgCompletionTime,
      velocity,
      priorityDistribution: priorityDist,
      typeDistribution: typeDist,
      weeklyCompletion,
    };
  }, [tasks]);

  const COLORS = ["#ef4444", "#f97316", "#eab308", "#3b82f6", "#64748b"];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        <div className="bg-black/40 border border-white/10 rounded-lg p-3">
          <div className="text-[10px] text-white/40 mb-1">TOTAL TASKS</div>
          <div className="text-lg font-bold text-white">{stats.total}</div>
        </div>
        <div className="bg-black/40 border border-white/10 rounded-lg p-3">
          <div className="text-[10px] text-white/40 mb-1">COMPLETED</div>
          <div className="text-lg font-bold text-green-400">{stats.completed}</div>
        </div>
        <div className="bg-black/40 border border-white/10 rounded-lg p-3">
          <div className="text-[10px] text-white/40 mb-1">IN PROGRESS</div>
          <div className="text-lg font-bold text-yellow-400">{stats.inProgress}</div>
        </div>
        <div className="bg-black/40 border border-white/10 rounded-lg p-3">
          <div className="text-[10px] text-white/40 mb-1">OVERDUE</div>
          <div className="text-lg font-bold text-red-400">{stats.overdue}</div>
        </div>
        <div className="bg-black/40 border border-white/10 rounded-lg p-3">
          <div className="text-[10px] text-white/40 mb-1">AVG TIME</div>
          <div className="text-lg font-bold text-cyan-400">{stats.avgCompletionTime}h</div>
        </div>
        <div className="bg-black/40 border border-white/10 rounded-lg p-3">
          <div className="text-[10px] text-white/40 mb-1">VELOCITY</div>
          <div className="text-lg font-bold text-purple-400">{stats.velocity}pts</div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Priority Distribution */}
        <div className="bg-black/40 border border-white/10 rounded-xl p-4">
          <div className="text-sm font-bold text-white mb-3">PRIORITY DISTRIBUTION</div>
          <RechartsResponsiveContainer width="100%" height={200}>
            <RechartsPieChart>
              <RechartsPie data={stats.priorityDistribution} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={2} dataKey="count">
                {stats.priorityDistribution.map((_, index) => (
                  <RechartsCell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                ))}
              </RechartsPie>
              <RechartsTooltip contentStyle={{ backgroundColor: "rgba(0,0,0,0.9)", border: "1px solid rgba(168,85,247,0.3)", borderRadius: "8px", color: "white" }} />
            </RechartsPieChart>
          </RechartsResponsiveContainer>
        </div>

        {/* Weekly Completion */}
        <div className="bg-black/40 border border-white/10 rounded-xl p-4">
          <div className="text-sm font-bold text-white mb-3">WEEKLY COMPLETION</div>
          <RechartsResponsiveContainer width="100%" height={200}>
            <RechartsBarChart data={stats.weeklyCompletion}>
              <RechartsCartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <RechartsXAxis dataKey="week" stroke="rgba(255,255,255,0.3)" tick={{ fontSize: 10 }} />
              <RechartsYAxis stroke="rgba(255,255,255,0.3)" tick={{ fontSize: 10 }} />
              <RechartsTooltip contentStyle={{ backgroundColor: "rgba(0,0,0,0.9)", border: "1px solid rgba(168,85,247,0.3)", borderRadius: "8px", color: "white" }} />
              <RechartsBar dataKey="completed" fill="#a855f7" />
            </RechartsBarChart>
          </RechartsResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// MAIN TASK MANAGER COMPONENT
// ============================================================================

export default function TaskManager() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [columns, setColumns] = useState<Column[]>([]);
  const [viewMode, setViewMode] = useState<"kanban" | "list" | "stats">("kanban");
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<TaskFilter>({
    searchQuery: "",
    priorities: [],
    types: [],
    assignees: [],
    tags: [],
    complexity: [],
  });
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);

  // Initialize tasks
  useEffect(() => {
    const mockTasks = generateMockTasks(50);
    setTasks(mockTasks);

    const cols: Column[] = [
      { id: "BACKLOG", title: "Backlog", color: "bg-slate-500", icon: <Archive className="w-4 h-4 text-slate-400" />, tasks: mockTasks.filter(t => t.status === "BACKLOG") },
      { id: "TODO", title: "To Do", color: "bg-blue-500", icon: <ListTodo className="w-4 h-4 text-blue-400" />, tasks: mockTasks.filter(t => t.status === "TODO") },
      { id: "IN_PROGRESS", title: "In Progress", color: "bg-yellow-500", icon: <Loader className="w-4 h-4 text-yellow-400" />, tasks: mockTasks.filter(t => t.status === "IN_PROGRESS") },
      { id: "REVIEW", title: "Review", color: "bg-purple-500", icon: <Eye className="w-4 h-4 text-purple-400" />, tasks: mockTasks.filter(t => t.status === "REVIEW") },
      { id: "DONE", title: "Done", color: "bg-green-500", icon: <CheckCircle className="w-4 h-4 text-green-400" />, tasks: mockTasks.filter(t => t.status === "DONE") },
    ];
    setColumns(cols);
  }, []);

  // Handle drag and drop
  const handleDrop = useCallback((taskId: string, newStatus: TaskStatus) => {
    setTasks(prev => prev.map(task =>
      task.id === taskId ? { ...task, status: newStatus, updatedAt: new Date() } : task
    ));

    setColumns(prev => prev.map(col => {
      if (col.id === newStatus) {
        const movedTask = tasks.find(t => t.id === taskId);
        if (movedTask && !col.tasks.find(t => t.id === taskId)) {
          return { ...col, tasks: [...col.tasks, { ...movedTask, status: newStatus }] };
        }
      }
      return { ...col, tasks: col.tasks.filter(t => t.id !== taskId) };
    }));
  }, [tasks]);

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    setDraggedTaskId(taskId);
    e.dataTransfer.setData("taskId", taskId);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const handleSaveTask = (updatedTask: Task) => {
    setTasks(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t));
  };

  const handleToggleStar = (taskId: string) => {
    setTasks(prev => prev.map(t =>
      t.id === taskId ? { ...t, starred: !t.starred } : t
    ));
  };

  const handleTogglePin = (taskId: string) => {
    setTasks(prev => prev.map(t =>
      t.id === taskId ? { ...t, pinned: !t.pinned } : t
    ));
  };

  const handleCreateTask = () => {
    const newTask: Task = {
      id: generateTaskId(),
      title: "New Task",
      description: "",
      status: "TODO",
      priority: "MEDIUM",
      type: "TASK",
      complexity: "M",
      creatorId: MOCK_USERS[0].id,
      tags: [],
      estimatedHours: 8,
      actualHours: 0,
      progress: 0,
      subtasks: [],
      comments: [],
      timeEntries: [],
      timeTrackingStatus: "NOT_STARTED",
      dependencies: [],
      attachments: [],
      checklist: [],
      notes: "",
      links: [],
      customFields: {},
      createdAt: new Date(),
      updatedAt: new Date(),
      archived: false,
      pinned: false,
      starred: false,
      position: 0,
      storyPoints: 5,
      riskLevel: "LOW",
      blockers: [],
      labels: [],
      watchers: [],
      mentions: [],
    };
    setEditingTask(newTask);
    setIsModalOpen(true);
  };

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
            <Kanban className="w-8 h-8 text-purple-400" />
            <div>
              <h2 className="text-2xl font-black text-white tracking-wider">TASK MANAGER</h2>
              <p className="text-xs text-white/60">Drag & Drop • Kanban Board • Project Management</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleCreateTask}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg text-xs font-bold hover:from-purple-500 hover:to-blue-500 transition-all shadow-[0_0_20px_rgba(168,85,247,0.4)]"
            >
              <Plus className="w-4 h-4" />
              NEW TASK
            </button>
          </div>
        </div>

        {/* View Mode Toggle */}
        <div className="flex gap-2 mb-4">
          {(["kanban", "list", "stats"] as const).map(mode => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                viewMode === mode
                  ? "bg-purple-600/20 text-purple-400 border border-purple-500/50"
                  : "bg-white/5 text-white/60 hover:bg-white/10"
              }`}
            >
              {mode === "kanban" && <Kanban className="w-4 h-4 inline mr-2" />}
              {mode === "list" && <List className="w-4 h-4 inline mr-2" />}
              {mode === "stats" && <BarChart3 className="w-4 h-4 inline mr-2" />}
              {mode.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Search & Filters */}
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tasks..."
              className="w-full bg-black/50 border border-white/10 rounded-lg pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500/50"
            />
          </div>
          <button className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-xs text-white/60 hover:bg-white/10 flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Filters
          </button>
        </div>
      </motion.div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {viewMode === "kanban" && (
          <motion.div
            key="kanban"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex gap-6 overflow-x-auto pb-4"
          >
            {columns.map(column => (
              <TaskColumn
                key={column.id}
                column={column}
                onDrop={handleDrop}
                onEditTask={handleEditTask}
                onToggleStar={handleToggleStar}
                onTogglePin={handleTogglePin}
              />
            ))}
          </motion.div>
        )}

        {viewMode === "stats" && (
          <motion.div
            key="stats"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <TaskStatistics tasks={tasks} />
          </motion.div>
        )}

        {viewMode === "list" && (
          <motion.div
            key="list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="bg-black/40 border border-white/10 rounded-2xl overflow-hidden"
          >
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-black/60 border-b border-white/10">
                  <tr>
                    <th className="text-left text-xs text-white/60 font-semibold p-4">Title</th>
                    <th className="text-left text-xs text-white/60 font-semibold p-4">Status</th>
                    <th className="text-left text-xs text-white/60 font-semibold p-4">Priority</th>
                    <th className="text-left text-xs text-white/60 font-semibold p-4">Assignee</th>
                    <th className="text-left text-xs text-white/60 font-semibold p-4">Due Date</th>
                    <th className="text-left text-xs text-white/60 font-semibold p-4">Progress</th>
                  </tr>
                </thead>
                <tbody>
                  {tasks.slice(0, 20).map(task => {
                    const assignee = MOCK_USERS.find(u => u.id === task.assigneeId);
                    const overdue = isOverdue(task);
                    return (
                      <tr key={task.id} className="border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer" onClick={() => handleEditTask(task)}>
                        <td className="p-4">
                          <div className="text-sm text-white font-medium">{task.title}</div>
                          <div className="text-[10px] text-white/40 mt-1">{task.type} • {task.complexity}</div>
                        </td>
                        <td className="p-4">
                          <span className={`text-xs font-semibold ${getStatusColor(task.status)}`}>
                            {task.status.replace("_", " ")}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded text-[10px] font-bold border ${getPriorityColor(task.priority)}`}>
                            {task.priority}
                          </span>
                        </td>
                        <td className="p-4">
                          {assignee && (
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center text-[10px] font-bold text-white">
                                {assignee.name[0]}
                              </div>
                              <span className="text-xs text-white/80">{assignee.name}</span>
                            </div>
                          )}
                        </td>
                        <td className="p-4">
                          {task.dueDate && (
                            <span className={`text-xs ${overdue ? "text-red-400" : "text-white/60"}`}>
                              {formatRelativeTime(task.dueDate)}
                            </span>
                          )}
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-1.5 bg-black/50 rounded-full overflow-hidden">
                              <div className="h-full bg-gradient-to-r from-cyan-500 to-purple-500" style={{ width: `${calculateProgress(task)}%` }} />
                            </div>
                            <span className="text-xs text-white/60">{calculateProgress(task)}%</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Task Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <TaskModal
            task={editingTask}
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onSave={handleSaveTask}
          />
        )}
      </AnimatePresence>
    </div>
  );
}