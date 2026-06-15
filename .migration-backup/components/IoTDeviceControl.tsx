"use client";
import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Smartphone, Laptop, Monitor, Tv, Watch, Tablet,
  Lightbulb, Thermometer, Droplets, Wind, Sun, Cloud,
  CloudRain, CloudSnow, CloudLightning, Snowflake, Flame,
  Power, Plug, Battery, BatteryCharging, BatteryFull,
  Wifi, WifiOff, Signal, Radio, Bluetooth, Ethernet,
  Lock, Unlock, Shield, ShieldAlert, ShieldCheck,
  Eye, EyeOff, Camera, Video, Mic, MicOff,
  Volume2, VolumeX, Music, Play, Pause, SkipForward,
  SkipBack, Repeat, Shuffle, Heart, Star, Bookmark,
  Home, Building, Factory, Warehouse, Store, Hospital,
  School, University, Church, Mosque, Synagogue, Temple,
  Car, Bike, Train, Plane, Bus, Truck, Ship,
  MapPin, Navigation, Compass, Globe, Satellite,
  Activity, ActivityIcon, Zap, Cpu, MemoryStick, HardDrive,
  Server, Database, Network, Router, Switch, Hub,
  Search, Filter, SortAsc, SortDesc, Grid, List,
  Columns, Rows, Table, LayoutDashboard, LayoutGrid,
  LayoutList, LayoutTemplate, Layout, Box, Package,
  Layers, Stack, Folder, FolderOpen, File, FileText,
  FileCode, FileJson, FileImage, FileVideo, FileAudio,
  FileArchive, FileSpreadsheet, FilePresentation, FileDocument,
  Download, Upload, CloudUpload, CloudDownload, Share2,
  ExternalLink, InternalLink, Link as LinkIcon, Unlink,
  Copy, Clipboard, Scissors, Paste, Save, SaveAll,
  Edit, Edit2, Edit3, Pencil, Pen, PenTool,
  Trash, Trash2, Delete, X, Plus, Minus,
  MoreVertical, MoreHorizontal, Menu, ChevronRight, ChevronLeft,
  ChevronDown, ChevronUp, ArrowRight, ArrowLeft, ArrowDown, ArrowUp,
  RefreshCw, RotateCw, RotateCcw, Undo, Redo,
  Settings, Settings2, Sliders, SlidersHorizontal, SlidersVertical,
  ToggleLeft, ToggleRight, Check, CheckCircle, CheckSquare,
  AlertCircle, AlertTriangle, AlertOctagon, AlertOctagon,
  Info, HelpCircle, HelpSquare, QuestionMark,
  Clock, Calendar, CalendarDays, CalendarCheck, CalendarClock,
  CalendarHeart, CalendarPlus, CalendarRange, CalendarSearch, CalendarX,
  Timer, TimerOff, TimerReset, Stopwatch, Hourglass,
  Bell, BellRing, BellOff, BellDot, BellMinus, BellPlus,
  Notification, NotificationOff, Notifications, NotificationsOff,
  MessageSquare, MessageCircle, MessageCircleMore, MessageCircleHeart,
  MessageCircleOff, MessageCirclePlus, MessageCircleQuestion,
  MessageCircleText, MessageCircleX, MessagesSquare, MessagesSquareMore,
  MessagesSquareHeart, MessagesSquareOff, MessagesSquarePlus,
  MessagesSquareQuestion, MessagesSquareText, MessagesSquareX,
  Send, SendHorizontal, SendToBack, BringToFront,
  User, Users, UserCheck, UserX, UserPlus, UserMinus,
  UserCircle, UserSquare, UserCog, UserLock, UserSearch,
  Award, Trophy, Medal, Crown, Gem, Diamond,
  Target, Flag, Bookmark, Tag, Hash, AtSign,
  Phone, Mail, AtSign, Hash, Binary, Code,
  Code2, Braces, Terminal, Command, GitBranch, GitCommit,
  GitPullRequest, GitMerge, Github, Gitlab, Bitbucket,
  BarChart3, BarChart, BarChart2, BarChart4, BarChartHorizontal,
  PieChart, PieChart2, LineChart, LineChart2, AreaChart,
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer, Cell, Tooltip, Legend, Area, AreaChart,
  Line, XAxis, YAxis, CartesianGrid, ScatterChart, Scatter, ZAxis,
  Sun as SunIcon, Moon, Cloud as CloudIcon, CloudRain as CloudRainIcon,
  CloudSnow as CloudSnowIcon, CloudLightning as CloudLightningIcon,
  Wind as WindIcon, Droplets as DropletsIcon, Flame as FlameIcon,
  Snowflake as SnowflakeIcon, Thermometer as ThermometerIcon,
  Lightbulb as LightbulbIcon, Power as PowerIcon, Plug as PlugIcon,
  Battery as BatteryIcon, BatteryCharging as BatteryChargingIcon,
  BatteryFull as BatteryFullIcon, Wifi as WifiIcon, WifiOff as WifiOffIcon,
  Signal as SignalIcon, Radio as RadioIcon, Bluetooth as BluetoothIcon,
  Ethernet as EthernetIcon, Lock as LockIcon, Unlock as UnlockIcon,
  Shield as ShieldIcon, ShieldAlert as ShieldAlertIcon, ShieldCheck as ShieldCheckIcon,
  Eye as EyeIcon, EyeOff as EyeOffIcon, Camera as CameraIcon,
  Video as VideoIcon, Mic as MicIcon, MicOff as MicOffIcon,
  Volume2 as Volume2Icon, VolumeX as VolumeXIcon, Music as MusicIcon,
  Play as PlayIcon, Pause as PauseIcon, SkipForward as SkipForwardIcon,
  SkipBack as SkipBackIcon, Repeat as RepeatIcon, Shuffle as ShuffleIcon,
  Heart as HeartIcon, Star as StarIcon, Bookmark as BookmarkIcon,
  Home as HomeIcon, Building as BuildingIcon, Factory as FactoryIcon,
  Warehouse as WarehouseIcon, Store as StoreIcon, Hospital as HospitalIcon,
  School as SchoolIcon, University as UniversityIcon, Church as ChurchIcon,
  Mosque as MosqueIcon, Synagogue as SynagogueIcon, Temple as TempleIcon,
  Car as CarIcon, Bike as BikeIcon, Train as TrainIcon,
  Plane as PlaneIcon, Bus as BusIcon, Truck as TruckIcon, Ship as ShipIcon,
  MapPin as MapPinIcon, Navigation as NavigationIcon, Compass as CompassIcon,
  Globe as GlobeIcon, Satellite as SatelliteIcon, Activity as ActivityIcon2,
  Zap as ZapIcon, Cpu as CpuIcon, MemoryStick as MemoryStickIcon,
  HardDrive as HardDriveIcon, Server as ServerIcon, Database as DatabaseIcon,
  Network as NetworkIcon, Router as RouterIcon, Switch as SwitchIcon,
  Hub as HubIcon, Search as SearchIcon, Filter as FilterIcon,
  SortAsc as SortAscIcon, SortDesc as SortDescIcon, Grid as GridIcon,
  List as ListIcon, Columns as ColumnsIcon, Rows as RowsIcon,
  Table as TableIcon, LayoutDashboard as LayoutDashboardIcon,
  LayoutGrid as LayoutGridIcon, LayoutList as LayoutListIcon,
  LayoutTemplate as LayoutTemplateIcon, Layout as LayoutIcon,
  Box as BoxIcon, Package as PackageIcon, Layers as LayersIcon,
  Stack as StackIcon, Folder as FolderIcon, FolderOpen as FolderOpenIcon,
  File as FileIcon, FileText as FileTextIcon, FileCode as FileCodeIcon,
  FileJson as FileJsonIcon, FileImage as FileImageIcon, FileVideo as FileVideoIcon,
  FileAudio as FileAudioIcon, FileArchive as FileArchiveIcon,
  FileSpreadsheet as FileSpreadsheetIcon, FilePresentation as FilePresentationIcon,
  FileDocument as FileDocumentIcon, Download as DownloadIcon, Upload as UploadIcon,
  CloudUpload as CloudUploadIcon, CloudDownload as CloudDownloadIcon,
  Share2 as Share2Icon, ExternalLink as ExternalLinkIcon,
  InternalLink as InternalLinkIcon, Link as LinkIcon2, Unlink as UnlinkIcon,
  Copy as CopyIcon, Clipboard as ClipboardIcon, Scissors as ScissorsIcon,
  Paste as PasteIcon, Save as SaveIcon, SaveAll as SaveAllIcon,
  Edit as EditIcon, Edit2 as Edit2Icon, Edit3 as Edit3Icon,
  Pencil as PencilIcon, Pen as PenIcon, PenTool as PenToolIcon,
  Trash as TrashIcon, Trash2 as Trash2Icon, Delete as DeleteIcon,
  X as XIcon, Plus as PlusIcon, Minus as MinusIcon,
  MoreVertical as MoreVerticalIcon, MoreHorizontal as MoreHorizontalIcon,
  Menu as MenuIcon, ChevronRight as ChevronRightIcon,
  ChevronLeft as ChevronLeftIcon, ChevronDown as ChevronDownIcon,
  ChevronUp as ChevronUpIcon, ArrowRight as ArrowRightIcon,
  ArrowLeft as ArrowLeftIcon, ArrowDown as ArrowDownIcon, ArrowUp as ArrowUpIcon,
  RefreshCw as RefreshCwIcon, RotateCw as RotateCwIcon,
  RotateCcw as RotateCcwIcon, Undo as UndoIcon, Redo as RedoIcon,
  Settings as SettingsIcon, Settings2 as Settings2Icon,
  Sliders as SlidersIcon, SlidersHorizontal as SlidersHorizontalIcon,
  SlidersVertical as SlidersVerticalIcon, ToggleLeft as ToggleLeftIcon,
  ToggleRight as ToggleRightIcon, Check as CheckIcon,
  CheckCircle as CheckCircleIcon, CheckSquare as CheckSquareIcon,
  AlertCircle as AlertCircleIcon, AlertTriangle as AlertTriangleIcon,
  AlertOctagon as AlertOctagonIcon, Info as InfoIcon,
  HelpCircle as HelpCircleIcon, HelpSquare as HelpSquareIcon,
  QuestionMark as QuestionMarkIcon, Clock as ClockIcon,
  Calendar as CalendarIcon, CalendarDays as CalendarDaysIcon,
  CalendarCheck as CalendarCheckIcon, CalendarClock as CalendarClockIcon,
  CalendarHeart as CalendarHeartIcon, CalendarPlus as CalendarPlusIcon,
  CalendarRange as CalendarRangeIcon, CalendarSearch as CalendarSearchIcon,
  CalendarX as CalendarXIcon, Timer as TimerIcon, TimerOff as TimerOffIcon,
  TimerReset as TimerResetIcon, Stopwatch as StopwatchIcon,
  Hourglass as HourglassIcon, Bell as BellIcon, BellRing as BellRingIcon,
  BellOff as BellOffIcon, BellDot as BellDotIcon, BellMinus as BellMinusIcon,
  BellPlus as BellPlusIcon, Notification as NotificationIcon,
  NotificationOff as NotificationOffIcon, Notifications as NotificationsIcon,
  NotificationsOff as NotificationsOffIcon, MessageSquare as MessageSquareIcon,
  MessageCircle as MessageCircleIcon, MessageCircleMore as MessageCircleMoreIcon,
  MessageCircleHeart as MessageCircleHeartIcon, MessageCircleOff as MessageCircleOffIcon,
  MessageCirclePlus as MessageCirclePlusIcon, MessageCircleQuestion as MessageCircleQuestionIcon,
  MessageCircleText as MessageCircleTextIcon, MessageCircleX as MessageCircleXIcon,
  MessagesSquare as MessagesSquareIcon, MessagesSquareMore as MessagesSquareMoreIcon,
  MessagesSquareHeart as MessagesSquareHeartIcon, MessagesSquareOff as MessagesSquareOffIcon,
  MessagesSquarePlus as MessagesSquarePlusIcon, MessagesSquareQuestion as MessagesSquareQuestionIcon,
  MessagesSquareText as MessagesSquareTextIcon, MessagesSquareX as MessagesSquareXIcon,
  Send as SendIcon, SendHorizontal as SendHorizontalIcon,
  SendToBack as SendToBackIcon, BringToFront as BringToFrontIcon,
  User as UserIcon, Users as UsersIcon, UserCheck as UserCheckIcon,
  UserX as UserXIcon, UserPlus as UserPlusIcon, UserMinus as UserMinusIcon,
  UserCircle as UserCircleIcon, UserSquare as UserSquareIcon,
  UserCog as UserCogIcon, UserLock as UserLockIcon, UserSearch as UserSearchIcon,
  Award as AwardIcon, Trophy as TrophyIcon, Medal as MedalIcon,
  Crown as CrownIcon, Gem as GemIcon, Diamond as DiamondIcon,
  Target as TargetIcon, Flag as FlagIcon, Bookmark as BookmarkIcon2,
  Tag as TagIcon, Hash as HashIcon, AtSign as AtSignIcon,
  Phone as PhoneIcon, Mail as MailIcon, AtSign as AtSignIcon2,
  Hash as HashIcon2, Binary as BinaryIcon, Code as CodeIcon,
  Code2 as Code2Icon, Braces as BracesIcon, Terminal as TerminalIcon,
  Command as CommandIcon, GitBranch as GitBranchIcon, GitCommit as GitCommitIcon,
  GitPullRequest as GitPullRequestIcon, GitMerge as GitMergeIcon,
  Github as GithubIcon, Gitlab as GitlabIcon, Bitbucket as BitbucketIcon,
  BarChart3 as BarChart3Icon, BarChart as BarChartIcon,
  BarChart2 as BarChart2Icon, BarChart4 as BarChart4Icon,
  BarChartHorizontal as BarChartHorizontalIcon, PieChart as PieChartIcon,
  PieChart2 as PieChart2Icon, LineChart as LineChartIcon,
  LineChart2 as LineChart2Icon, AreaChart as AreaChartIcon,
  Radar as RadarIcon, RadarChart as RadarChartIcon,
  PolarGrid as PolarGridIcon, PolarAngleAxis as PolarAngleAxisIcon,
  PolarRadiusAxis as PolarRadiusAxisIcon, ResponsiveContainer as ResponsiveContainerIcon,
  Cell as CellIcon, Tooltip as TooltipIcon, Legend as LegendIcon,
  Area as AreaIcon, AreaChart as AreaChartIcon2, Line as LineIcon,
  XAxis as XAxisIcon, YAxis as YAxisIcon, CartesianGrid as CartesianGridIcon,
  ScatterChart as ScatterChartIcon, Scatter as ScatterIcon, ZAxis as ZAxisIcon,
} from "lucide-react";
import {
  PieChart as RechartsPie, Pie as RechartsPieSlice, Cell as RechartsCell,
  ResponsiveContainer as RechartsResponsiveContainer, Tooltip as RechartsTooltip,
  Legend as RechartsLegend, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  AreaChart, Area, LineChart, Line,
} from "recharts";

// ============================================================================
// TYPE DEFINITIONS - IOT ARCHITECTURE
// ============================================================================

type DeviceCategory = "LIGHTING" | "CLIMATE" | "SECURITY" | "ENTERTAINMENT" | "APPLIANCE" | "SENSOR" | "NETWORK" | "ENERGY" | "OTHER";
type DeviceStatus = "ONLINE" | "OFFLINE" | "ERROR" | "MAINTENANCE" | "UPDATING";
type DeviceType = "SMART_LIGHT" | "SMART_PLUG" | "THERMOSTAT" | "CAMERA" | "SENSOR" | "SPEAKER" | "TV" | "LOCK" | "ROUTER" | "SWITCH" | "OUTLET" | "BLIND" | "GARAGE" | "SPRINKLER" | "SMOKE_DETECTOR" | "CO_DETECTOR" | "MOTION_SENSOR" | "DOOR_SENSOR" | "WINDOW_SENSOR" | "TEMP_SENSOR" | "HUMIDITY_SENSOR" | "LIGHT_SENSOR" | "AIR_QUALITY" | "ENERGY_MONITOR" | "WATER_SENSOR" | "LEAK_DETECTOR";
type ConnectionType = "WIFI" | "BLUETOOTH" | "ZIGBEE" | "Z-WAVE" | "ETHERNET" | "THREAD" | "MATTER" | "LORA" | "NB-IOT";
type AutomationTrigger = "TIME" | "SUNRISE" | "SUNSET" | "DEVICE_STATE" | "SENSOR_VALUE" | "LOCATION" | "VOICE_COMMAND" | "BUTTON_PRESS";
type AutomationAction = "TURN_ON" | "TURN_OFF" | "SET_VALUE" | "TOGGLE" | "SCENE" | "NOTIFICATION" | "DELAY" | "CONDITION";

interface IoTDevice {
  id: string;
  name: string;
  type: DeviceType;
  category: DeviceCategory;
  status: DeviceStatus;
  connectionType: ConnectionType;
  ipAddress?: string;
  macAddress?: string;
  firmwareVersion: string;
  manufacturer: string;
  model: string;
  location: {
    room: string;
    floor: number;
    building: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  capabilities: string[];
  state: Record<string, any>;
  batteryLevel?: number;
  signalStrength: number; // dBm
  lastSeen: Date;
  createdAt: Date;
  updatedAt: Date;
  energyConsumption?: {
    current: number; // Watts
    daily: number; // kWh
    monthly: number; // kWh
    yearly: number; // kWh
  };
  isFavorite: boolean;
  isHidden: boolean;
  tags: string[];
  notes?: string;
  icon?: string;
  color?: string;
}

interface Scene {
  id: string;
  name: string;
  description?: string;
  icon: string;
  color: string;
  devices: {
    deviceId: string;
    state: Record<string, any>;
  }[];
  createdAt: Date;
  updatedAt: Date;
  lastActivated?: Date;
  activationCount: number;
  isFavorite: boolean;
}

interface AutomationRule {
  id: string;
  name: string;
  description?: string;
  enabled: boolean;
  trigger: {
    type: AutomationTrigger;
    config: Record<string, any>;
  };
  conditions?: {
    deviceId: string;
    property: string;
    operator: "==" | "!=" | ">" | "<" | ">=" | "<=" | "contains";
    value: any;
  }[];
  actions: {
    type: AutomationAction;
    config: Record<string, any>;
  }[];
  schedule?: {
    days: number[]; // 0-6 (Sun-Sat)
    startTime?: string;
    endTime?: string;
  };
  createdAt: Date;
  updatedAt: Date;
  lastTriggered?: Date;
  triggerCount: number;
  isFavorite: boolean;
}

interface EnergyData {
  timestamp: string;
  consumption: number; // kWh
  cost: number; // currency
  solar?: number; // kWh generated
  grid?: number; // kWh from grid
  battery?: number; // kWh stored/used
}

interface NetworkTopology {
  devices: {
    id: string;
    type: string;
    x: number;
    y: number;
    status: DeviceStatus;
  }[];
  connections: {
    from: string;
    to: string;
    type: ConnectionType;
    strength: number;
  }[];
}

interface IoTMetrics {
  totalDevices: number;
  onlineDevices: number;
  offlineDevices: number;
  totalEnergyConsumption: number; // kWh
  totalEnergyCost: number; // currency
  avgSignalStrength: number; // dBm
  avgBatteryLevel: number; // percentage
  activeAutomations: number;
  scenesCount: number;
  alertsCount: number;
  networkHealth: number; // percentage
}

// ============================================================================
// MOCK DATA GENERATORS
// ============================================================================

const DEVICE_TYPES: DeviceType[] = [
  "SMART_LIGHT", "SMART_PLUG", "THERMOSTAT", "CAMERA", "SENSOR",
  "SPEAKER", "TV", "LOCK", "ROUTER", "SWITCH", "OUTLET", "BLIND",
  "GARAGE", "SPRINKLER", "SMOKE_DETECTOR", "CO_DETECTOR",
  "MOTION_SENSOR", "DOOR_SENSOR", "WINDOW_SENSOR", "TEMP_SENSOR",
  "HUMIDITY_SENSOR", "LIGHT_SENSOR", "AIR_QUALITY", "ENERGY_MONITOR",
  "WATER_SENSOR", "LEAK_DETECTOR"
];

const CONNECTION_TYPES: ConnectionType[] = ["WIFI", "BLUETOOTH", "ZIGBEE", "Z-WAVE", "ETHERNET", "THREAD", "MATTER"];

const ROOMS = ["Living Room", "Kitchen", "Bedroom", "Bathroom", "Office", "Garage", "Garden", "Hallway", "Dining Room", "Basement"];

const MANUFACTURERS = ["Philips", "TP-Link", "Amazon", "Google", "Apple", "Samsung", "LIFX", "Nanoleaf", "Ecobee", "Nest", "Ring", "Arlo", "Wyze", "Aqara", "Sonoff"];

const generateMockDevices = (count: number): IoTDevice[] => {
  return Array.from({ length: count }, (_, i) => {
    const type = DEVICE_TYPES[Math.floor(Math.random() * DEVICE_TYPES.length)];
    const category = type.includes("LIGHT") ? "LIGHTING" : 
                     type.includes("THERMOSTAT") || type.includes("TEMP") ? "CLIMATE" :
                     type.includes("CAMERA") || type.includes("LOCK") || type.includes("SENSOR") ? "SECURITY" :
                     type.includes("SPEAKER") || type.includes("TV") ? "ENTERTAINMENT" :
                     type.includes("PLUG") || type.includes("OUTLET") ? "APPLIANCE" :
                     type.includes("ROUTER") || type.includes("SWITCH") ? "NETWORK" :
                     type.includes("ENERGY") ? "ENERGY" : "OTHER";
    
    const statusRoll = Math.random();
    const status: DeviceStatus = statusRoll > 0.9 ? "OFFLINE" : statusRoll > 0.85 ? "ERROR" : "ONLINE";
    
    const connectionType = CONNECTION_TYPES[Math.floor(Math.random() * CONNECTION_TYPES.length)];
    
    return {
      id: `device_${i + 1}`,
      name: `${type.replace(/_/g, " ")} ${i + 1}`,
      type,
      category,
      status,
      connectionType,
      ipAddress: `192.168.1.${100 + i}`,
      macAddress: generateMAC(),
      firmwareVersion: `${Math.floor(Math.random() * 5)}.${Math.floor(Math.random() * 10)}.${Math.floor(Math.random() * 100)}`,
      manufacturer: MANUFACTURERS[Math.floor(Math.random() * MANUFACTURERS.length)],
      model: `Model-${Math.floor(Math.random() * 1000)}`,
      location: {
        room: ROOMS[Math.floor(Math.random() * ROOMS.length)],
        floor: Math.floor(Math.random() * 3) + 1,
        building: "Main Building",
        coordinates: {
          lat: 37.7749 + (Math.random() - 0.5) * 0.01,
          lng: -122.4194 + (Math.random() - 0.5) * 0.01,
        },
      },
      capabilities: generateCapabilities(type),
      state: generateDeviceState(type),
      batteryLevel: type.includes("SENSOR") || type.includes("LOCK") ? Math.floor(Math.random() * 100) : undefined,
      signalStrength: -30 - Math.floor(Math.random() * 70), // -30 to -100 dBm
      lastSeen: new Date(Date.now() - Math.floor(Math.random() * 86400000)),
      createdAt: new Date(Date.now() - Math.floor(Math.random() * 31536000000)),
      updatedAt: new Date(),
      energyConsumption: type.includes("LIGHT") || type.includes("PLUG") || type.includes("OUTLET") ? {
        current: Math.floor(Math.random() * 100),
        daily: parseFloat((Math.random() * 5).toFixed(2)),
        monthly: parseFloat((Math.random() * 150).toFixed(2)),
        yearly: parseFloat((Math.random() * 1800).toFixed(2)),
      } : undefined,
      isFavorite: Math.random() > 0.7,
      isHidden: false,
      tags: [category.toLowerCase(), connectionType.toLowerCase()],
      icon: getDeviceIcon(type),
      color: getDeviceColor(category),
    };
  });
};

const generateMAC = (): string => {
  return Array.from({ length: 6 }, () => Math.floor(Math.random() * 256).toString(16).padStart(2, "0").toUpperCase()).join(":");
};

const generateCapabilities = (type: DeviceType): string[] => {
  const caps: string[] = [];
  if (type.includes("LIGHT")) caps.push("brightness", "color", "temperature");
  if (type.includes("PLUG") || type.includes("OUTLET")) caps.push("power_monitoring", "scheduling");
  if (type.includes("THERMOSTAT")) caps.push("heating", "cooling", "humidity");
  if (type.includes("CAMERA")) caps.push("motion_detection", "night_vision", "two_way_audio");
  if (type.includes("LOCK")) caps.push("auto_lock", "remote_unlock", "access_log");
  if (type.includes("SENSOR")) caps.push("motion", "temperature", "humidity");
  return caps.length > 0 ? caps : ["basic_control"];
};

const generateDeviceState = (type: DeviceType): Record<string, any> => {
  const state: Record<string, any> = {};
  if (type.includes("LIGHT") || type.includes("PLUG") || type.includes("OUTLET")) {
    state.isOn = Math.random() > 0.5;
    if (type.includes("LIGHT")) {
      state.brightness = Math.floor(Math.random() * 100);
      state.color = `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, "0")}`;
      state.temperature = Math.floor(Math.random() * 4000) + 2000; // Kelvin
    }
  }
  if (type.includes("THERMOSTAT")) {
    state.temperature = Math.floor(Math.random() * 30) + 15; // Celsius
    state.targetTemp = Math.floor(Math.random() * 30) + 15;
    state.mode = ["heat", "cool", "auto", "off"][Math.floor(Math.random() * 4)];
    state.humidity = Math.floor(Math.random() * 60) + 30;
  }
  if (type.includes("CAMERA")) {
    state.isRecording = Math.random() > 0.7;
    state.motionDetected = Math.random() > 0.9;
    state.nightVision = Math.random() > 0.5;
  }
  if (type.includes("LOCK")) {
    state.isLocked = Math.random() > 0.3;
    state.batteryLevel = Math.floor(Math.random() * 100);
  }
  if (type.includes("SENSOR")) {
    state.temperature = Math.floor(Math.random() * 30) + 15;
    state.humidity = Math.floor(Math.random() * 60) + 30;
    state.motion = Math.random() > 0.8;
    state.light = Math.floor(Math.random() * 1000);
  }
  if (type.includes("SPEAKER") || type.includes("TV")) {
    state.volume = Math.floor(Math.random() * 100);
    state.isOn = Math.random() > 0.5;
    state.muted = Math.random() > 0.8;
  }
  return state;
};

const getDeviceIcon = (type: DeviceType): string => {
  const icons: Record<DeviceType, string> = {
    SMART_LIGHT: "Lightbulb",
    SMART_PLUG: "Plug",
    THERMOSTAT: "Thermometer",
    CAMERA: "Camera",
    SENSOR: "Activity",
    SPEAKER: "Volume2",
    TV: "Tv",
    LOCK: "Lock",
    ROUTER: "Router",
    SWITCH: "Switch",
    OUTLET: "Outlet",
    BLIND: "Blind",
    GARAGE: "Garage",
    SPRINKLER: "Sprinkler",
    SMOKE_DETECTOR: "Smoke",
    CO_DETECTOR: "Wind",
    MOTION_SENSOR: "Activity",
    DOOR_SENSOR: "Door",
    WINDOW_SENSOR: "Window",
    TEMP_SENSOR: "Thermometer",
    HUMIDITY_SENSOR: "Droplets",
    LIGHT_SENSOR: "Sun",
    AIR_QUALITY: "Wind",
    ENERGY_MONITOR: "Zap",
    WATER_SENSOR: "Droplets",
    LEAK_DETECTOR: "Droplets",
  };
  return icons[type] || "Device";
};

const getDeviceColor = (category: DeviceCategory): string => {
  const colors: Record<DeviceCategory, string> = {
    LIGHTING: "#fbbf24", // Amber
    CLIMATE: "#3b82f6", // Blue
    SECURITY: "#ef4444", // Red
    ENTERTAINMENT: "#a855f7", // Purple
    APPLIANCE: "#10b981", // Green
    SENSOR: "#06b6d4", // Cyan
    NETWORK: "#8b5cf6", // Violet
    ENERGY: "#f59e0b", // Amber
    OTHER: "#64748b", // Slate
  };
  return colors[category] || "#64748b";
};

const generateScenes = (): Scene[] => [
  {
    id: "scene_1",
    name: "Good Morning",
    description: "Wake up routine",
    icon: "Sun",
    color: "#fbbf24",
    devices: [
      { deviceId: "device_1", state: { isOn: true, brightness: 80 } },
      { deviceId: "device_5", state: { temperature: 22, mode: "heat" } },
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
    lastActivated: new Date(Date.now() - 86400000),
    activationCount: 42,
    isFavorite: true,
  },
  {
    id: "scene_2",
    name: "Movie Night",
    description: "Cinema mode",
    icon: "Tv",
    color: "#a855f7",
    devices: [
      { deviceId: "device_1", state: { isOn: false } },
      { deviceId: "device_8", state: { isOn: true, volume: 60 } },
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
    lastActivated: new Date(Date.now() - 172800000),
    activationCount: 28,
    isFavorite: true,
  },
  {
    id: "scene_3",
    name: "Away Mode",
    description: "Leave home",
    icon: "Home",
    color: "#ef4444",
    devices: [
      { deviceId: "device_1", state: { isOn: false } },
      { deviceId: "device_10", state: { isLocked: true } },
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
    lastActivated: new Date(Date.now() - 259200000),
    activationCount: 156,
    isFavorite: false,
  },
];

const generateAutomationRules = (): AutomationRule[] => [
  {
    id: "auto_1",
    name: "Turn on lights at sunset",
    description: "Automatically turn on living room lights",
    enabled: true,
    trigger: {
      type: "SUNSET",
      config: { offset: 0 },
    },
    conditions: [],
    actions: [
      {
        type: "TURN_ON",
        config: { deviceId: "device_1", brightness: 70 },
      },
    ],
    schedule: {
      days: [0, 1, 2, 3, 4, 5, 6],
    },
    createdAt: new Date(),
    updatedAt: new Date(),
    lastTriggered: new Date(Date.now() - 86400000),
    triggerCount: 89,
    isFavorite: true,
  },
  {
    id: "auto_2",
    name: "Motion detected - turn on lights",
    description: "Turn on hallway lights when motion detected",
    enabled: true,
    trigger: {
      type: "DEVICE_STATE",
      config: { deviceId: "device_15", property: "motion", value: true },
    },
    conditions: [
      {
        deviceId: "device_1",
        property: "isOn",
        operator: "==",
        value: false,
      },
    ],
    actions: [
      {
        type: "TURN_ON",
        config: { deviceId: "device_1", brightness: 50 },
      },
      {
        type: "DELAY",
        config: { seconds: 300 },
      },
      {
        type: "TURN_OFF",
        config: { deviceId: "device_1" },
      },
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
    lastTriggered: new Date(Date.now() - 3600000),
    triggerCount: 234,
    isFavorite: false,
  },
];

const generateEnergyData = (): EnergyData[] => {
  const data: EnergyData[] = [];
  const now = new Date();
  for (let i = 23; i >= 0; i--) {
    const timestamp = new Date(now.getTime() - i * 3600000);
    data.push({
      timestamp: timestamp.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
      consumption: parseFloat((Math.random() * 5 + 1).toFixed(2)),
      cost: parseFloat((Math.random() * 2 + 0.5).toFixed(2)),
      solar: Math.random() > 0.5 ? parseFloat((Math.random() * 3).toFixed(2)) : 0,
      grid: parseFloat((Math.random() * 4).toFixed(2)),
      battery: parseFloat((Math.random() * 2 - 1).toFixed(2)),
    });
  }
  return data;
};

// ============================================================================
// SUB-COMPONENTS - IOT VISUALIZATION
// ============================================================================

// --- Device Card Component ---
const DeviceCard: React.FC<{
  device: IoTDevice;
  onToggle: (id: string) => void;
  onEdit: (device: IoTDevice) => void;
  onDelete: (id: string) => void;
}> = ({ device, onToggle, onEdit, onDelete }) => {
  const Icon = getIconComponent(device.icon);
  const isOn = device.state.isOn ?? false;
  
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -4 }}
      className={`relative p-6 rounded-2xl border backdrop-blur-xl transition-all group ${
        device.status === "OFFLINE" 
          ? "bg-black/20 border-white/5 opacity-60" 
          : isOn 
            ? "bg-gradient-to-br from-cyan-500/10 to-purple-500/10 border-cyan-500/30 shadow-[0_0_30px_rgba(6,182,212,0.2)]" 
            : "bg-black/40 border-white/10 hover:border-white/30"
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-xl ${isOn ? "bg-cyan-500/20" : "bg-white/5"}`}>
          <Icon className={`w-6 h-6 ${isOn ? "text-cyan-400" : "text-white/60"}`} />
        </div>
        <div className="flex gap-2">
          {device.isFavorite && <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />}
          <button
            onClick={() => onEdit(device)}
            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-white/10 rounded"
          >
            <Edit className="w-4 h-4 text-white/60" />
          </button>
        </div>
      </div>

      {/* Device Info */}
      <div className="mb-4">
        <h3 className="text-sm font-bold text-white mb-1">{device.name}</h3>
        <div className="flex items-center gap-2 text-xs text-white/60">
          <span>{device.location.room}</span>
          <span>•</span>
          <span>{device.manufacturer}</span>
        </div>
      </div>

      {/* Status Indicators */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${
            device.status === "ONLINE" ? "bg-green-400 animate-pulse" :
            device.status === "OFFLINE" ? "bg-red-400" :
            "bg-yellow-400"
          }`} />
          <span className="text-[10px] text-white/60">{device.status}</span>
        </div>
        {device.batteryLevel !== undefined && (
          <div className="flex items-center gap-1 text-[10px] text-white/60">
            <Battery className="w-3 h-3" />
            <span>{device.batteryLevel}%</span>
          </div>
        )}
      </div>

      {/* State Display */}
      {device.type.includes("LIGHT") && (
        <div className="mb-4">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="text-white/60">Brightness</span>
            <span className="text-cyan-400">{device.state.brightness}%</span>
          </div>
          <div className="h-1.5 bg-black/50 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-cyan-500 to-purple-500"
              initial={{ width: 0 }}
              animate={{ width: `${device.state.brightness}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>
      )}

      {device.type.includes("THERMOSTAT") && (
        <div className="mb-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[10px] text-white/60">Current</div>
              <div className="text-lg font-bold text-white">{device.state.temperature}°C</div>
            </div>
            <div className="text-right">
              <div className="text-[10px] text-white/60">Target</div>
              <div className="text-lg font-bold text-cyan-400">{device.state.targetTemp}°C</div>
            </div>
          </div>
        </div>
      )}

      {/* Toggle Switch */}
      {device.capabilities.includes("basic_control") && (
        <button
          onClick={() => onToggle(device.id)}
          disabled={device.status === "OFFLINE"}
          className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all ${
            isOn
              ? "bg-gradient-to-r from-cyan-500 to-purple-500 text-white shadow-[0_0_20px_rgba(6,182,212,0.4)]"
              : "bg-white/5 text-white/60 border border-white/10 hover:bg-white/10"
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {isOn ? "ON" : "OFF"}
        </button>
      )}

      {/* Connection Type Badge */}
      <div className="absolute top-4 right-4">
        <div className="px-2 py-1 rounded bg-black/40 border border-white/10 text-[9px] text-white/60">
          {device.connectionType}
        </div>
      </div>
    </motion.div>
  );
};

// --- Device List Row ---
const DeviceListRow: React.FC<{
  device: IoTDevice;
  onToggle: (id: string) => void;
  onEdit: (device: IoTDevice) => void;
}> = ({ device, onToggle, onEdit }) => {
  const Icon = getIconComponent(device.icon);
  const isOn = device.state.isOn ?? false;
  
  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${
        device.status === "OFFLINE"
          ? "bg-black/20 border-white/5 opacity-60"
          : "bg-black/40 border-white/10 hover:bg-white/5 hover:border-white/20"
      }`}
    >
      <div className={`p-2 rounded-lg ${isOn ? "bg-cyan-500/20" : "bg-white/5"}`}>
        <Icon className={`w-5 h-5 ${isOn ? "text-cyan-400" : "text-white/60"}`} />
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-medium text-white truncate">{device.name}</span>
          {device.isFavorite && <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />}
        </div>
        <div className="flex items-center gap-2 text-xs text-white/60">
          <span>{device.location.room}</span>
          <span>•</span>
          <span>{device.type.replace(/_/g, " ")}</span>
          <span>•</span>
          <span className={device.status === "ONLINE" ? "text-green-400" : "text-red-400"}>
            {device.status}
          </span>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        {device.batteryLevel !== undefined && (
          <div className="flex items-center gap-1 text-xs text-white/60">
            <Battery className="w-4 h-4" />
            <span>{device.batteryLevel}%</span>
          </div>
        )}
        
        {device.energyConsumption && (
          <div className="text-xs text-white/60">
            {device.energyConsumption.current}W
          </div>
        )}
        
        <button
          onClick={() => onToggle(device.id)}
          disabled={device.status === "OFFLINE"}
          className={`relative w-12 h-6 rounded-full transition-colors ${
            isOn ? "bg-cyan-500" : "bg-white/10"
          } disabled:opacity-50`}
        >
          <motion.div
            className="absolute top-1 w-4 h-4 rounded-full bg-white"
            animate={{ left: isOn ? "28px" : "4px" }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
          />
        </button>
        
        <button
          onClick={() => onEdit(device)}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
        >
          <MoreVertical className="w-4 h-4 text-white/60" />
        </button>
      </div>
    </motion.div>
  );
};

// --- Network Topology Visualization ---
const NetworkTopology: React.FC<{ devices: IoTDevice[] }> = ({ devices }) => {
  const nodes = useMemo(() => {
    return devices.map((device, i) => ({
      id: device.id,
      type: device.category,
      x: 20 + (i % 8) * 10,
      y: 20 + Math.floor(i / 8) * 15,
      status: device.status,
    }));
  }, [devices]);

  const connections = useMemo(() => {
    const conns: { from: string; to: string; type: ConnectionType; strength: number }[] = [];
    const routers = devices.filter(d => d.type === "ROUTER");
    const otherDevices = devices.filter(d => d.type !== "ROUTER");
    
    otherDevices.forEach(device => {
      const router = routers[Math.floor(Math.random() * routers.length)] || devices[0];
      if (router) {
        conns.push({
          from: router.id,
          to: device.id,
          type: device.connectionType,
          strength: Math.random(),
        });
      }
    });
    
    return conns;
  }, [devices]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-black/40 border border-purple-500/30 rounded-2xl p-6 backdrop-blur-xl shadow-[0_0_30px_rgba(168,85,247,0.2)]"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Network className="w-5 h-5 text-purple-400" />
          <h3 className="text-sm font-bold text-white tracking-wider">NETWORK TOPOLOGY</h3>
        </div>
        <div className="flex gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-400" />
            <span className="text-white/60">Online</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-red-400" />
            <span className="text-white/60">Offline</span>
          </div>
        </div>
      </div>

      <div className="relative h-96 bg-black/40 rounded-xl border border-white/5 overflow-hidden">
        <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
          {/* Connections */}
          {connections.map((conn, i) => {
            const fromNode = nodes.find(n => n.id === conn.from);
            const toNode = nodes.find(n => n.id === conn.to);
            if (!fromNode || !toNode) return null;
            
            return (
              <motion.line
                key={i}
                x1={fromNode.x}
                y1={fromNode.y}
                x2={toNode.x}
                y2={toNode.y}
                stroke={conn.type === "WIFI" ? "#06b6d4" : conn.type === "ZIGBEE" ? "#a855f7" : "#10b981"}
                strokeWidth="0.3"
                strokeOpacity={conn.strength * 0.5}
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1, delay: i * 0.05 }}
              />
            );
          })}
          
          {/* Nodes */}
          {nodes.map((node) => (
            <g key={node.id}>
              <motion.circle
                cx={node.x}
                cy={node.y}
                r={node.type === "NETWORK" ? 3 : 2}
                fill={node.status === "ONLINE" ? "#10b981" : node.status === "OFFLINE" ? "#ef4444" : "#f59e0b"}
                stroke="white"
                strokeWidth="0.2"
                animate={{
                  r: node.status === "ONLINE" ? [2, 2.5, 2] : 2,
                }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <text
                x={node.x}
                y={node.y + 5}
                fill="rgba(255,255,255,0.6)"
                fontSize="1.5"
                textAnchor="middle"
              >
                {node.id.replace("device_", "D")}
              </text>
            </g>
          ))}
        </svg>
      </div>

      <div className="grid grid-cols-4 gap-2 mt-4 text-[10px]">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-cyan-400" />
          <span className="text-white/60">WiFi</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-purple-400" />
          <span className="text-white/60">Zigbee</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-400" />
          <span className="text-white/60">Z-Wave</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-blue-400" />
          <span className="text-white/60">Ethernet</span>
        </div>
      </div>
    </motion.div>
  );
};

// --- Energy Consumption Chart ---
const EnergyChart: React.FC<{ data: EnergyData[] }> = ({ data }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-black/40 border border-green-500/30 rounded-2xl p-6 backdrop-blur-xl shadow-[0_0_30px_rgba(34,197,94,0.2)]"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Zap className="w-5 h-5 text-green-400" />
          <h3 className="text-sm font-bold text-white tracking-wider">ENERGY CONSUMPTION</h3>
        </div>
        <div className="flex gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-cyan-400" />
            <span className="text-white/60">Grid</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-yellow-400" />
            <span className="text-white/60">Solar</span>
          </div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={250}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorGrid" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorSolar" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#fbbf24" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#fbbf24" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis dataKey="timestamp" stroke="rgba(255,255,255,0.3)" tick={{ fontSize: 10 }} />
          <YAxis stroke="rgba(255,255,255,0.3)" tick={{ fontSize: 10 }} />
          <RechartsTooltip
            contentStyle={{ backgroundColor: "rgba(0,0,0,0.9)", border: "1px solid rgba(34,197,94,0.3)", borderRadius: "8px", color: "white" }}
          />
          <Area type="monotone" dataKey="grid" stroke="#06b6d4" fillOpacity={1} fill="url(#colorGrid)" name="Grid" />
          <Area type="monotone" dataKey="solar" stroke="#fbbf24" fillOpacity={1} fill="url(#colorSolar)" name="Solar" />
        </AreaChart>
      </ResponsiveContainer>

      <div className="grid grid-cols-3 gap-4 mt-4">
        <div className="bg-black/30 rounded-lg p-3 border border-white/5">
          <div className="text-[10px] text-white/40 mb-1">TODAY</div>
          <div className="text-lg font-bold text-cyan-400">
            {data.reduce((sum, d) => sum + d.consumption, 0).toFixed(1)} kWh
          </div>
        </div>
        <div className="bg-black/30 rounded-lg p-3 border border-white/5">
          <div className="text-[10px] text-white/40 mb-1">COST</div>
          <div className="text-lg font-bold text-green-400">
            ${data.reduce((sum, d) => sum + d.cost, 0).toFixed(2)}
          </div>
        </div>
        <div className="bg-black/30 rounded-lg p-3 border border-white/5">
          <div className="text-[10px] text-white/40 mb-1">SOLAR</div>
          <div className="text-lg font-bold text-yellow-400">
            {data.reduce((sum, d) => sum + (d.solar || 0), 0).toFixed(1)} kWh
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// --- Scene Card ---
const SceneCard: React.FC<{
  scene: Scene;
  onActivate: (id: string) => void;
  onEdit: (scene: Scene) => void;
}> = ({ scene, onActivate, onEdit }) => {
  const Icon = getIconComponent(scene.icon);
  
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onActivate(scene.id)}
      className="p-6 rounded-2xl border border-white/10 bg-black/40 backdrop-blur-xl cursor-pointer hover:border-white/30 transition-all group"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="p-3 rounded-xl" style={{ backgroundColor: `${scene.color}20` }}>
          <Icon className="w-6 h-6" style={{ color: scene.color }} />
        </div>
        {scene.isFavorite && <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />}
      </div>
      
      <h3 className="text-sm font-bold text-white mb-1">{scene.name}</h3>
      <p className="text-xs text-white/60 mb-4">{scene.description}</p>
      
      <div className="flex items-center justify-between text-[10px] text-white/40">
        <span>{scene.devices.length} devices</span>
        <span>{scene.activationCount} activations</span>
      </div>
    </motion.div>
  );
};

// --- Automation Rule Card ---
const AutomationCard: React.FC<{
  rule: AutomationRule;
  onToggle: (id: string) => void;
  onEdit: (rule: AutomationRule) => void;
}> = ({ rule, onToggle, onEdit }) => {
  return (
    <motion.div
      layout
      className={`p-6 rounded-2xl border backdrop-blur-xl ${
        rule.enabled
          ? "bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/30"
          : "bg-black/20 border-white/5 opacity-60"
      }`}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-white mb-1">{rule.name}</h3>
          <p className="text-xs text-white/60">{rule.description}</p>
        </div>
        <button
          onClick={() => onToggle(rule.id)}
          className={`relative w-12 h-6 rounded-full transition-colors ${
            rule.enabled ? "bg-purple-500" : "bg-white/10"
          }`}
        >
          <motion.div
            className="absolute top-1 w-4 h-4 rounded-full bg-white"
            animate={{ left: rule.enabled ? "28px" : "4px" }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
          />
        </button>
      </div>
      
      <div className="space-y-2 text-xs">
        <div className="flex items-center gap-2">
          <span className="text-white/40">Trigger:</span>
          <span className="text-cyan-400">{rule.trigger.type.replace(/_/g, " ")}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-white/40">Actions:</span>
          <span className="text-purple-400">{rule.actions.length}</span>
        </div>
        {rule.lastTriggered && (
          <div className="flex items-center gap-2">
            <span className="text-white/40">Last:</span>
            <span className="text-white/60">{formatTime(rule.lastTriggered)}</span>
          </div>
        )}
      </div>
      
      <button
        onClick={() => onEdit(rule)}
        className="mt-4 w-full py-2 rounded-lg bg-white/5 border border-white/10 text-xs text-white/60 hover:bg-white/10 transition-colors"
      >
        Edit Rule
      </button>
    </motion.div>
  );
};

// Helper function to get icon component
const getIconComponent = (iconName: string) => {
  const icons: Record<string, React.ComponentType<any>> = {
    Lightbulb, Plug, Thermometer, Camera, Activity, Volume2, Tv, Lock,
    Router, Switch, Outlet, Blind, Garage, Sprinkler, Smoke, Wind,
    Sun, Droplets, Smartphone, Laptop, Monitor, Watch, Tablet,
    Battery, BatteryCharging, BatteryFull, Wifi, WifiOff, Signal,
    Radio, Bluetooth, Ethernet, Shield, ShieldAlert, ShieldCheck,
    Eye, EyeOff, Video, Mic, MicOff, Music, Play, Pause,
    SkipForward, SkipBack, Repeat, Shuffle, Heart, Star, Bookmark,
    Home, Building, Factory, Warehouse, Store, Hospital, School,
    University, Church, Mosque, Synagogue, Temple, Car, Bike,
    Train, Plane, Bus, Truck, Ship, MapPin, Navigation, Compass,
    Globe, Satellite, Zap, Cpu, MemoryStick, HardDrive, Server,
    Database, Network, Search, Filter, SortAsc, SortDesc, Grid,
    List, Columns, Rows, Table, LayoutDashboard, LayoutGrid,
    LayoutList, LayoutTemplate, Layout, Box, Package, Layers,
    Stack, Folder, FolderOpen, File, FileText, FileCode, FileJson,
    FileImage, FileVideo, FileAudio, FileArchive, FileSpreadsheet,
    FilePresentation, FileDocument, Download, Upload, CloudUpload,
    CloudDownload, Share2, ExternalLink, InternalLink, Link, Unlink,
    Copy, Clipboard, Scissors, Paste, Save, SaveAll, Edit, Edit2,
    Edit3, Pencil, Pen, PenTool, Trash, Trash2, Delete, X, Plus,
    Minus, MoreVertical, MoreHorizontal, Menu, ChevronRight, ChevronLeft,
    ChevronDown, ChevronUp, ArrowRight, ArrowLeft, ArrowDown, ArrowUp,
    RefreshCw, RotateCw, RotateCcw, Undo, Redo, Settings, Settings2,
    Sliders, SlidersHorizontal, SlidersVertical, ToggleLeft, ToggleRight,
    Check, CheckCircle, CheckSquare, AlertCircle, AlertTriangle,
    AlertOctagon, Info, HelpCircle, HelpSquare, QuestionMark, Clock,
    Calendar, CalendarDays, CalendarCheck, CalendarClock, CalendarHeart,
    CalendarPlus, CalendarRange, CalendarSearch, CalendarX, Timer,
    TimerOff, TimerReset, Stopwatch, Hourglass, Bell, BellRing, BellOff,
    BellDot, BellMinus, BellPlus, Notification, NotificationOff,
    Notifications, NotificationsOff, MessageSquare, MessageCircle,
    MessageCircleMore, MessageCircleHeart, MessageCircleOff, MessageCirclePlus,
    MessageCircleQuestion, MessageCircleText, MessageCircleX, MessagesSquare,
    MessagesSquareMore, MessagesSquareHeart, MessagesSquareOff, MessagesSquarePlus,
    MessagesSquareQuestion, MessagesSquareText, MessagesSquareX, Send,
    SendHorizontal, SendToBack, BringToFront, User, Users, UserCheck,
    UserX, UserPlus, UserMinus, UserCircle, UserSquare, UserCog,
    UserLock, UserSearch, Award, Trophy, Medal, Crown, Gem, Diamond,
    Target, Flag, Tag, Hash, AtSign, Phone, Mail, Binary, Code,
    Code2, Braces, Terminal, Command, GitBranch, GitCommit, GitPullRequest,
    GitMerge, Github, Gitlab, Bitbucket, BarChart3, BarChart, BarChart2,
    BarChart4, BarChartHorizontal, PieChart, PieChart2, LineChart, LineChart2,
    AreaChart, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
    ResponsiveContainer, Cell, Tooltip, Legend, Area, Line, XAxis, YAxis,
    CartesianGrid, ScatterChart, Scatter, ZAxis,
  };
  return icons[iconName] || Activity;
};

const formatTime = (date: Date): string => {
  return date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
};

// ============================================================================
// MAIN IOT DEVICE CONTROL COMPONENT
// ============================================================================

export default function IoTDeviceControl() {
  const [devices, setDevices] = useState<IoTDevice[]>([]);
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [automations, setAutomations] = useState<AutomationRule[]>([]);
  const [energyData, setEnergyData] = useState<EnergyData[]>([]);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedCategory, setSelectedCategory] = useState<DeviceCategory | "ALL">("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddDevice, setShowAddDevice] = useState(false);
  const [showAddScene, setShowAddScene] = useState(false);
  const [showAddAutomation, setShowAddAutomation] = useState(false);
  const [metrics, setMetrics] = useState<IoTMetrics>({
    totalDevices: 0,
    onlineDevices: 0,
    offlineDevices: 0,
    totalEnergyConsumption: 0,
    totalEnergyCost: 0,
    avgSignalStrength: 0,
    avgBatteryLevel: 0,
    activeAutomations: 0,
    scenesCount: 0,
    alertsCount: 0,
    networkHealth: 0,
  });

  // Initialize data
  useEffect(() => {
    const mockDevices = generateMockDevices(24);
    const mockScenes = generateScenes();
    const mockAutomations = generateAutomationRules();
    const mockEnergyData = generateEnergyData();
    
    setDevices(mockDevices);
    setScenes(mockScenes);
    setAutomations(mockAutomations);
    setEnergyData(mockEnergyData);
    
    // Calculate metrics
    setMetrics({
      totalDevices: mockDevices.length,
      onlineDevices: mockDevices.filter(d => d.status === "ONLINE").length,
      offlineDevices: mockDevices.filter(d => d.status === "OFFLINE").length,
      totalEnergyConsumption: mockDevices.reduce((sum, d) => sum + (d.energyConsumption?.daily || 0), 0),
      totalEnergyCost: parseFloat((Math.random() * 100).toFixed(2)),
      avgSignalStrength: Math.floor(mockDevices.reduce((sum, d) => sum + d.signalStrength, 0) / mockDevices.length),
      avgBatteryLevel: Math.floor(mockDevices.filter(d => d.batteryLevel).reduce((sum, d) => sum + (d.batteryLevel || 0), 0) / mockDevices.filter(d => d.batteryLevel).length),
      activeAutomations: mockAutomations.filter(a => a.enabled).length,
      scenesCount: mockScenes.length,
      alertsCount: Math.floor(Math.random() * 5),
      networkHealth: Math.floor(85 + Math.random() * 15),
    });
  }, []);

  const handleToggleDevice = useCallback((deviceId: string) => {
    setDevices(prev => prev.map(device => {
      if (device.id === deviceId) {
        const isOn = device.state.isOn ?? false;
        return {
          ...device,
          state: { ...device.state, isOn: !isOn },
          updatedAt: new Date(),
        };
      }
      return device;
    }));
  }, []);

  const handleActivateScene = useCallback((sceneId: string) => {
    setScenes(prev => prev.map(scene => {
      if (scene.id === sceneId) {
        return {
          ...scene,
          lastActivated: new Date(),
          activationCount: scene.activationCount + 1,
        };
      }
      return scene;
    }));
  }, []);

  const handleToggleAutomation = useCallback((ruleId: string) => {
    setAutomations(prev => prev.map(rule => {
      if (rule.id === ruleId) {
        return {
          ...rule,
          enabled: !rule.enabled,
          updatedAt: new Date(),
        };
      }
      return rule;
    }));
  }, []);

  const filteredDevices = useMemo(() => {
    return devices.filter(device => {
      const matchesCategory = selectedCategory === "ALL" || device.category === selectedCategory;
      const matchesSearch = device.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          device.location.room.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [devices, selectedCategory, searchQuery]);

  const categories: { id: DeviceCategory | "ALL"; label: string; icon: React.ReactNode; count: number }[] = [
    { id: "ALL", label: "All Devices", icon: <Grid className="w-4 h-4" />, count: devices.length },
    { id: "LIGHTING", label: "Lighting", icon: <Lightbulb className="w-4 h-4" />, count: devices.filter(d => d.category === "LIGHTING").length },
    { id: "CLIMATE", label: "Climate", icon: <Thermometer className="w-4 h-4" />, count: devices.filter(d => d.category === "CLIMATE").length },
    { id: "SECURITY", label: "Security", icon: <Shield className="w-4 h-4" />, count: devices.filter(d => d.category === "SECURITY").length },
    { id: "ENTERTAINMENT", label: "Entertainment", icon: <Tv className="w-4 h-4" />, count: devices.filter(d => d.category === "ENTERTAINMENT").length },
    { id: "APPLIANCE", label: "Appliances", icon: <Plug className="w-4 h-4" />, count: devices.filter(d => d.category === "APPLIANCE").length },
  ];

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
            <Smartphone className="w-8 h-8 text-cyan-400" />
            <div>
              <h2 className="text-2xl font-black text-white tracking-wider">IOT COMMAND CENTER</h2>
              <p className="text-xs text-white/60">Smart Home • Enterprise IoT • Part 15</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowAddDevice(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-lg text-xs font-bold hover:from-cyan-500 hover:to-blue-500 transition-all shadow-[0_0_20px_rgba(6,182,212,0.4)]"
            >
              <Plus className="w-4 h-4" />
              ADD DEVICE
            </button>
          </div>
        </div>

        {/* Quick Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
          <div className="bg-black/30 rounded-lg p-3 border border-white/5">
            <div className="text-[10px] text-white/40 mb-1">TOTAL DEVICES</div>
            <div className="text-lg font-bold text-white">{metrics.totalDevices}</div>
          </div>
          <div className="bg-black/30 rounded-lg p-3 border border-white/5">
            <div className="text-[10px] text-white/40 mb-1">ONLINE</div>
            <div className="text-lg font-bold text-green-400">{metrics.onlineDevices}</div>
          </div>
          <div className="bg-black/30 rounded-lg p-3 border border-white/5">
            <div className="text-[10px] text-white/40 mb-1">OFFLINE</div>
            <div className="text-lg font-bold text-red-400">{metrics.offlineDevices}</div>
          </div>
          <div className="bg-black/30 rounded-lg p-3 border border-white/5">
            <div className="text-[10px] text-white/40 mb-1">ENERGY</div>
            <div className="text-lg font-bold text-cyan-400">{metrics.totalEnergyConsumption.toFixed(1)} kWh</div>
          </div>
          <div className="bg-black/30 rounded-lg p-3 border border-white/5">
            <div className="text-[10px] text-white/40 mb-1">COST</div>
            <div className="text-lg font-bold text-green-400">${metrics.totalEnergyCost}</div>
          </div>
          <div className="bg-black/30 rounded-lg p-3 border border-white/5">
            <div className="text-[10px] text-white/40 mb-1">SIGNAL</div>
            <div className="text-lg font-bold text-purple-400">{metrics.avgSignalStrength} dBm</div>
          </div>
          <div className="bg-black/30 rounded-lg p-3 border border-white/5">
            <div className="text-[10px] text-white/40 mb-1">AUTOMATIONS</div>
            <div className="text-lg font-bold text-yellow-400">{metrics.activeAutomations}</div>
          </div>
          <div className="bg-black/30 rounded-lg p-3 border border-white/5">
            <div className="text-[10px] text-white/40 mb-1">HEALTH</div>
            <div className="text-lg font-bold text-green-400">{metrics.networkHealth}%</div>
          </div>
        </div>
      </motion.div>

      {/* Category Filter */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              selectedCategory === cat.id
                ? "bg-cyan-500/20 border border-cyan-500/50 text-cyan-400"
                : "bg-black/40 border border-white/10 text-white/60 hover:border-white/30"
            }`}
          >
            {cat.icon}
            {cat.label}
            <span className="px-2 py-0.5 rounded-full bg-white/10 text-[10px]">{cat.count}</span>
          </button>
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-12 gap-6">
        {/* Left Column - Devices */}
        <div className="col-span-12 lg:col-span-8 space-y-6">
          {/* Toolbar */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <input
                  type="text"
                  placeholder="Search devices..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-64 bg-black/40 border border-white/10 rounded-lg pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500/50"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-lg transition-all ${
                  viewMode === "grid" ? "bg-cyan-500/20 text-cyan-400" : "bg-white/5 text-white/60"
                }`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-lg transition-all ${
                  viewMode === "list" ? "bg-cyan-500/20 text-cyan-400" : "bg-white/5 text-white/60"
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Devices Grid/List */}
          {viewMode === "grid" ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {filteredDevices.map(device => (
                <DeviceCard
                  key={device.id}
                  device={device}
                  onToggle={handleToggleDevice}
                  onEdit={() => {}}
                  onDelete={() => {}}
                />
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredDevices.map(device => (
                <DeviceListRow
                  key={device.id}
                  device={device}
                  onToggle={handleToggleDevice}
                  onEdit={() => {}}
                />
              ))}
            </div>
          )}
        </div>

        {/* Right Column - Scenes, Automations, Energy */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
          {/* Scenes */}
          <div className="bg-black/40 border border-white/10 rounded-2xl p-6 backdrop-blur-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Star className="w-5 h-5 text-yellow-400" />
                <h3 className="text-sm font-bold text-white tracking-wider">SCENES</h3>
              </div>
              <button
                onClick={() => setShowAddScene(true)}
                className="p-1 hover:bg-white/10 rounded transition-colors"
              >
                <Plus className="w-4 h-4 text-white/60" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {scenes.map(scene => (
                <SceneCard
                  key={scene.id}
                  scene={scene}
                  onActivate={handleActivateScene}
                  onEdit={() => {}}
                />
              ))}
            </div>
          </div>

          {/* Automations */}
          <div className="bg-black/40 border border-white/10 rounded-2xl p-6 backdrop-blur-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Zap className="w-5 h-5 text-purple-400" />
                <h3 className="text-sm font-bold text-white tracking-wider">AUTOMATIONS</h3>
              </div>
              <button
                onClick={() => setShowAddAutomation(true)}
                className="p-1 hover:bg-white/10 rounded transition-colors"
              >
                <Plus className="w-4 h-4 text-white/60" />
              </button>
            </div>
            <div className="space-y-3">
              {automations.map(rule => (
                <AutomationCard
                  key={rule.id}
                  rule={rule}
                  onToggle={handleToggleAutomation}
                  onEdit={() => {}}
                />
              ))}
            </div>
          </div>

          {/* Energy Chart */}
          <EnergyChart data={energyData} />
        </div>
      </div>

      {/* Network Topology */}
      <NetworkTopology devices={devices} />
    </div>
  );
}