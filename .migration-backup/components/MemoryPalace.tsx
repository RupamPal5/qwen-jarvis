"use client";
import React, { useState, useEffect, useCallback, useRef, useMemo, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Canvas, useFrame, useThree, ThreeEvent } from "@react-three/fiber";
import { OrbitControls, Text, Sphere, Line as DreiLine, Billboard, Stars, Float, Trail, Sparkles } from "@react-three/drei";
import * as THREE from "three";
import {
  Brain, Database, Search, Filter, Download, Upload, Trash2,
  RefreshCw, Clock, Calendar, Tag, Hash, Star, StarOff,
  Bookmark, BookmarkCheck, Eye, EyeOff, Zap, Activity,
  TrendingUp, TrendingDown, BarChart3, PieChart as PieChartIcon,
  LineChart as LineChartIcon, Network, GitBranch, GitCommit,
  Layers, Box, Package, Cpu, MemoryStick, HardDrive, List,
  Thermometer, Radio, Signal, Wifi, WifiOff, Lock, Unlock,
  Key, Fingerprint, Shield, AlertTriangle, AlertCircle,
  CheckCircle, XCircle, Info, HelpCircle, Settings, MoreVertical,
  ChevronDown, ChevronRight, ChevronLeft, Plus, Minus,
  Copy, Check, ExternalLink, InternalLink, Link as LinkIcon,
  MessageSquare, Send, SendHorizontal, Users, User, UserCheck,
  UserX, UserPlus, UserMinus, Share2, Save, FolderOpen,
  File, FileCode, FileText, Archive, Inbox, Bell, BellOff,
  Play, Pause, StopCircle, SkipForward, SkipBack, Repeat,
  Shuffle, Heart, ThumbsUp, ThumbsDown, Award, Trophy,
  Target, Flag, MapPin, Navigation, Compass, Globe,
  Satellite, Rocket, Plane, Train, Bus, Car, Bike,
  Footprints, PersonStanding, Walking, Running, Swimming,
  Cycling, Dumbbell, Weight, Scale, Ruler, Hammer,
  Wrench, Screwdriver, Nut, Bolt, Tool, Tools,
  Sliders, SlidersHorizontal, ToggleLeft, ToggleRight,
  Select, SelectAll, Deselect, ClearAll, Delete,
  ZoomIn, ZoomOut, Focus, Target as TargetIcon,
  Crosshair, Locate, LocateFixed, Maximize, Maximize2,
  Minimize, Minimize2, Expand, ExpandIcon, Collapse,
  CollapseIcon, Fullscreen, FullscreenOff, ExitFullscreen,
  EnterFullscreen, RotateCw, RotateCcw, Rotate3d,
  FlipHorizontal, FlipVertical, ArrowUp, ArrowDown,
  ArrowLeft, ArrowRight, ArrowUpRight, ArrowDownRight,
  ArrowUpLeft, ArrowDownLeft, Sun, Moon, CloudRain,
  CloudSnow, Flame, Snowflake, Umbrella, Wind, Droplets,
  Timer, TimerOff, TimerReset, Stopwatch, CalendarDays,
  CalendarCheck, CalendarClock, AlarmClock, Hourglass,
  Volume2, VolumeX, Mic, MicOff, Camera, CameraOff,
  Video, VideoOff, Phone, Mail, AtSign, Hash as HashIcon,
  Binary, Code, Code2, Braces, Terminal, Command,
  GitPullRequest, GitMerge, Database as DbIcon, Server,
  Cloud, CloudOff, CloudUpload, CloudDownload,
  Network as NetworkIcon, Cpu as CpuIcon,
  MemoryStick as MemoryIcon, HardDrive as HdIcon,
  Thermometer as ThermIcon, Radio as RadioIcon,
  Signal as SignalIcon, Wifi as WifiIcon2,
  Lock as LockIcon, Unlock as UnlockIcon,
  Key as KeyIcon, Fingerprint as FpIcon,
  Shield as ShieldIcon, AlertTriangle as AlertTriIcon,
  AlertCircle as AlertCircIcon, CheckCircle as CheckCircIcon,
  XCircle as XCircIcon, Info as InfoIcon, HelpCircle as HelpIcon,
  Settings as SettingsIcon, MoreVertical as MoreVertIcon,
  ChevronDown as ChevDownIcon, ChevronRight as ChevRightIcon,
  ChevronLeft as ChevLeftIcon, Plus as PlusIcon, Minus as MinusIcon,
  Copy as CopyIcon, Check as CheckIcon, ExternalLink as ExtLinkIcon,
  MessageSquare as MsgIcon, Send as SendIcon, Users as UsersIcon,
  User as UserIcon, UserCheck as UserCheckIcon,
  UserX as UserXIcon, UserPlus as UserPlusIcon,
  UserMinus as UserMinusIcon, Share2 as Share2Icon,
  Save as SaveIcon, FolderOpen as FolderOpenIcon,
  File as FileIcon, FileCode as FileCodeIcon,
  FileText as FileTextIcon, Archive as ArchiveIcon,
  Inbox as InboxIcon, Bell as BellIcon, BellOff as BellOffIcon,
  Play as PlayIcon, Pause as PauseIcon, StopCircle as StopCircIcon,
  SkipForward as SkipFwdIcon, SkipBack as SkipBackIcon,
  Repeat as RepeatIcon, Shuffle as ShuffleIcon,
  Heart as HeartIcon, ThumbsUp as ThumbsUpIcon,
  ThumbsDown as ThumbsDownIcon, Award as AwardIcon,
  Trophy as TrophyIcon, Target as TargetIcon2,
  Flag as FlagIcon, MapPin as MapPinIcon,
  Navigation as NavIcon, Compass as CompassIcon,
  Globe as GlobeIcon, Satellite as SatIcon,
  Rocket as RocketIcon, Plane as PlaneIcon,
  Train as TrainIcon, Bus as BusIcon, Car as CarIcon,
  Bike as BikeIcon, Footprints as FootIcon,
  PersonStanding as PersonIcon, Walking as WalkIcon,
  Running as RunIcon, Swimming as SwimIcon,
  Cycling as CycleIcon, Dumbbell as DumbIcon,
  Weight as WeightIcon, Scale as ScaleIcon,
  Ruler as RulerIcon, Hammer as HammerIcon,
  Wrench as WrenchIcon, Screwdriver as ScrewIcon,
  Nut as NutIcon, Bolt as BoltIcon, Tool as ToolIcon,
  Tools as ToolsIcon, Sliders as SlidersIcon,
  SlidersHorizontal as SlidersHIcon, ToggleLeft as ToggleLIcon,
  ToggleRight as ToggleRIcon, Select as SelectIcon,
  SelectAll as SelectAllIcon, Deselect as DeselectIcon,
  ClearAll as ClearAllIcon, Delete as DeleteIcon,
  ZoomIn as ZoomInIcon, ZoomOut as ZoomOutIcon,
  Focus as FocusIcon, Crosshair as CrossIcon,
  Locate as LocateIcon, LocateFixed as LocateFixIcon,
  Maximize as MaxIcon, Maximize2 as Max2Icon,
  Minimize as MinIcon, Minimize2 as Min2Icon,
  Expand as ExpandIcon2, Collapse as CollapseIcon2,
  Fullscreen as FullIcon, FullscreenOff as FullOffIcon,
  ExitFullscreen as ExitFullIcon, EnterFullscreen as EnterFullIcon,
  RotateCw as RotateCwIcon, RotateCcw as RotateCcwIcon,
  Rotate3d as Rotate3dIcon, FlipHorizontal as FlipHIcon,
  FlipVertical as FlipVIcon, ArrowUp as ArrowUpIcon,
  ArrowDown as ArrowDownIcon, ArrowLeft as ArrowLeftIcon,
  ArrowRight as ArrowRightIcon, ArrowUpRight as ArrowURIcon,
  ArrowDownRight as ArrowDRIcon, ArrowUpLeft as ArrowULIcon,
  ArrowDownLeft as ArrowDLIcon, Sun as SunIcon, Moon as MoonIcon,
  CloudRain as CloudRainIcon, CloudSnow as CloudSnowIcon,
  Flame as FlameIcon, Snowflake as SnowIcon, Umbrella as UmbIcon,
  Wind as WindIcon, Droplets as DropIcon, Timer as TimerIcon,
  TimerOff as TimerOffIcon, TimerReset as TimerResetIcon,
  Stopwatch as StopwatchIcon, CalendarDays as CalDaysIcon,
  CalendarCheck as CalCheckIcon, CalendarClock as CalClockIcon,
  AlarmClock as AlarmIcon, Hourglass as HourglassIcon,
  Volume2 as VolIcon, VolumeX as VolOffIcon, Mic as MicIcon,
  MicOff as MicOffIcon, Camera as CamIcon, CameraOff as CamOffIcon,
  Video as VideoIcon, VideoOff as VideoOffIcon, Phone as PhoneIcon,
  Mail as MailIcon, AtSign as AtIcon, Hash as HashTagIcon,
  Binary as BinaryIcon, Code as CodeIcon, Code2 as Code2Icon,
  Braces as BracesIcon, Terminal as TermIcon, Command as CmdIcon,
  GitPullRequest as GitPRIcon, GitMerge as GitMergeIcon,
  DbIcon as DbIcon2, Server as ServerIcon, Cloud as CloudIcon,
  CloudOff as CloudOffIcon, CloudUpload as CloudUpIcon,
  CloudDownload as CloudDownIcon, NetworkIcon as NetIcon2,
  CpuIcon as CpuIcon2, MemoryIcon as MemIcon, HdIcon as HdIcon2,
  ThermIcon as ThermIcon2, RadioIcon as RadioIcon2,
  SignalIcon as SignalIcon2, WifiIcon2 as WifiIcon3,
  LockIcon as LockIcon2, UnlockIcon as UnlockIcon2,
  KeyIcon as KeyIcon2, FpIcon as FpIcon2, ShieldIcon as ShieldIcon2,
  AlertTriIcon as AlertTriIcon2, AlertCircIcon as AlertCircIcon2,
  CheckCircIcon as CheckCircIcon2, XCircIcon as XCircIcon2,
  InfoIcon as InfoIcon2, HelpIcon as HelpIcon2, SettingsIcon as SettingsIcon2,
  MoreVertIcon as MoreVertIcon2, ChevDownIcon as ChevDownIcon2,
  ChevRightIcon as ChevRightIcon2, ChevLeftIcon as ChevLeftIcon2,
  PlusIcon as PlusIcon2, MinusIcon as MinusIcon2, CopyIcon as CopyIcon2,
  CheckIcon as CheckIcon2, ExtLinkIcon as ExtLinkIcon2, MsgIcon as MsgIcon2,
  SendIcon as SendIcon2, UsersIcon as UsersIcon2, UserIcon as UserIcon2,
  UserCheckIcon as UserCheckIcon2, UserXIcon as UserXIcon2,
  UserPlusIcon as UserPlusIcon2, UserMinusIcon as UserMinusIcon2,
  Share2Icon as Share2Icon2, SaveIcon as SaveIcon2, FolderOpenIcon as FolderOpenIcon2,
  FileIcon as FileIcon2, FileCodeIcon as FileCodeIcon2,
  FileTextIcon as FileTextIcon2, ArchiveIcon as ArchiveIcon2,
  InboxIcon as InboxIcon2, BellIcon as BellIcon2, BellOffIcon as BellOffIcon2,
  PlayIcon as PlayIcon2, PauseIcon as PauseIcon2, StopCircIcon as StopCircIcon2,
  SkipFwdIcon as SkipFwdIcon2, SkipBackIcon as SkipBackIcon2,
  RepeatIcon as RepeatIcon2, ShuffleIcon as ShuffleIcon2,
  HeartIcon as HeartIcon2, ThumbsUpIcon as ThumbsUpIcon2,
  ThumbsDownIcon as ThumbsDownIcon2, AwardIcon as AwardIcon2,
  TrophyIcon as TrophyIcon2, TargetIcon2 as TargetIcon3,
  FlagIcon as FlagIcon2, MapPinIcon as MapPinIcon2,
  NavIcon as NavIcon2, CompassIcon as CompassIcon2,
  GlobeIcon as GlobeIcon2, SatIcon as SatIcon2,
  RocketIcon as RocketIcon2, PlaneIcon as PlaneIcon2,
  TrainIcon as TrainIcon2, BusIcon as BusIcon2, CarIcon as CarIcon2,
  BikeIcon as BikeIcon2, FootIcon as FootIcon2,
  PersonIcon as PersonIcon2, WalkIcon as WalkIcon2,
  RunIcon as RunIcon2, SwimIcon as SwimIcon2,
  CycleIcon as CycleIcon2, DumbIcon as DumbIcon2,
  WeightIcon as WeightIcon2, ScaleIcon as ScaleIcon2,
  RulerIcon as RulerIcon2, HammerIcon as HammerIcon2,
  WrenchIcon as WrenchIcon2, ScrewIcon as ScrewIcon2,
  NutIcon as NutIcon2, BoltIcon as BoltIcon2, ToolIcon as ToolIcon2,
  ToolsIcon as ToolsIcon2, SlidersIcon as SlidersIcon2,
  SlidersHIcon as SlidersHIcon2, ToggleLIcon as ToggleLIcon2,
  ToggleRIcon as ToggleRIcon2, SelectIcon as SelectIcon2,
  SelectAllIcon as SelectAllIcon2, DeselectIcon as DeselectIcon2,
  ClearAllIcon as ClearAllIcon2, DeleteIcon as DeleteIcon2,
  ZoomInIcon as ZoomInIcon2, ZoomOutIcon as ZoomOutIcon2,
  FocusIcon as FocusIcon2, CrossIcon as CrossIcon2,
  LocateIcon as LocateIcon2, LocateFixIcon as LocateFixIcon2,
  MaxIcon as MaxIcon2, Max2Icon as Max2Icon2,
  MinIcon as MinIcon2, Min2Icon as Min2Icon2,
  ExpandIcon2 as ExpandIcon3, CollapseIcon2 as CollapseIcon3,
  FullIcon as FullIcon2, FullOffIcon as FullOffIcon2,
  ExitFullIcon as ExitFullIcon2, EnterFullIcon as EnterFullIcon2,
  RotateCwIcon as RotateCwIcon2, RotateCcwIcon as RotateCcwIcon2,
  Rotate3dIcon as Rotate3dIcon2, FlipHIcon as FlipHIcon2,
  FlipVIcon as FlipVIcon2, ArrowUpIcon as ArrowUpIcon2,
  ArrowDownIcon as ArrowDownIcon2, ArrowLeftIcon as ArrowLeftIcon2,
  ArrowRightIcon as ArrowRightIcon2, ArrowURIcon as ArrowURIcon2,
  ArrowDRIcon as ArrowDRIcon2, ArrowULIcon as ArrowULIcon2,
  ArrowDLIcon as ArrowDLIcon2, SunIcon as SunIcon2, MoonIcon as MoonIcon2,
  CloudRainIcon as CloudRainIcon2, CloudSnowIcon as CloudSnowIcon2,
  FlameIcon as FlameIcon2, SnowIcon as SnowIcon2, UmbIcon as UmbIcon2,
  WindIcon as WindIcon2, DropIcon as DropIcon2, TimerIcon as TimerIcon2,
  TimerOffIcon as TimerOffIcon2, TimerResetIcon as TimerResetIcon2,
  StopwatchIcon as StopwatchIcon2, CalDaysIcon as CalDaysIcon2,
  CalCheckIcon as CalCheckIcon2, CalClockIcon as CalClockIcon2,
  AlarmIcon as AlarmIcon2, HourglassIcon as HourglassIcon2,
  VolIcon as VolIcon2, VolOffIcon as VolOffIcon2, MicIcon as MicIcon2,
  MicOffIcon as MicOffIcon2, CamIcon as CamIcon2, CamOffIcon as CamOffIcon2,
  VideoIcon as VideoIcon2, VideoOffIcon as VideoOffIcon2, PhoneIcon as PhoneIcon2,
  MailIcon as MailIcon2, AtIcon as AtIcon2, HashTagIcon as HashTagIcon2,
  BinaryIcon as BinaryIcon2, CodeIcon as CodeIcon2, Code2Icon as Code2Icon2,
  BracesIcon as BracesIcon2, TermIcon as TermIcon2, CmdIcon as CmdIcon2,
  GitPRIcon as GitPRIcon2, GitMergeIcon as GitMergeIcon2,
  DbIcon2 as DbIcon3, ServerIcon as ServerIcon2, CloudIcon as CloudIcon2,
  CloudOffIcon as CloudOffIcon2, CloudUpIcon as CloudUpIcon2,
  CloudDownIcon as CloudDownIcon2, NetIcon2 as NetIcon3,
  CpuIcon2 as CpuIcon3, MemIcon as MemIcon2, HdIcon2 as HdIcon3,
  ThermIcon2 as ThermIcon3, RadioIcon2 as RadioIcon3,
  SignalIcon2 as SignalIcon3, WifiIcon3 as WifiIcon4,
  LockIcon2 as LockIcon3, UnlockIcon2 as UnlockIcon3,
  KeyIcon2 as KeyIcon3, FpIcon2 as FpIcon3, ShieldIcon2 as ShieldIcon3,
  AlertTriIcon2 as AlertTriIcon3, AlertCircIcon2 as AlertCircIcon3,
  CheckCircIcon2 as CheckCircIcon3, XCircIcon2 as XCircIcon3,
  InfoIcon2 as InfoIcon3, HelpIcon2 as HelpIcon3, SettingsIcon2 as SettingsIcon3,
  MoreVertIcon2 as MoreVertIcon3, ChevDownIcon2 as ChevDownIcon3,
  ChevRightIcon2 as ChevRightIcon3, ChevLeftIcon2 as ChevLeftIcon3,
  PlusIcon2 as PlusIcon3, MinusIcon2 as MinusIcon3, CopyIcon2 as CopyIcon3,
  CheckIcon2 as CheckIcon3, ExtLinkIcon2 as ExtLinkIcon3, MsgIcon2 as MsgIcon3,
  SendIcon2 as SendIcon3, UsersIcon2 as UsersIcon3, UserIcon2 as UserIcon3,
  UserCheckIcon2 as UserCheckIcon3, UserXIcon2 as UserXIcon3,
  UserPlusIcon2 as UserPlusIcon3, UserMinusIcon2 as UserMinusIcon3,
  Share2Icon2 as Share2Icon3, SaveIcon2 as SaveIcon3, FolderOpenIcon2 as FolderOpenIcon3,
  FileIcon2 as FileIcon3, FileCodeIcon2 as FileCodeIcon3,
  FileTextIcon2 as FileTextIcon3, ArchiveIcon2 as ArchiveIcon3,
  InboxIcon2 as InboxIcon3, BellIcon2 as BellIcon3, BellOffIcon2 as BellOffIcon3,
  PlayIcon2 as PlayIcon3, PauseIcon2 as PauseIcon3, StopCircIcon2 as StopCircIcon3,
  SkipFwdIcon2 as SkipFwdIcon3, SkipBackIcon2 as SkipBackIcon3,
  RepeatIcon2 as RepeatIcon3, ShuffleIcon2 as ShuffleIcon3,
  HeartIcon2 as HeartIcon3, ThumbsUpIcon2 as ThumbsUpIcon3,
  ThumbsDownIcon2 as ThumbsDownIcon3, AwardIcon2 as AwardIcon3,
  TrophyIcon2 as TrophyIcon3, TargetIcon3 as TargetIcon4,
  FlagIcon2 as FlagIcon3, MapPinIcon2 as MapPinIcon3,
  NavIcon2 as NavIcon3, CompassIcon2 as CompassIcon3,
  GlobeIcon2 as GlobeIcon3, SatIcon2 as SatIcon3,
  RocketIcon2 as RocketIcon3, PlaneIcon2 as PlaneIcon3,
  TrainIcon2 as TrainIcon3, BusIcon2 as BusIcon3, CarIcon2 as CarIcon3,
  BikeIcon2 as BikeIcon3, FootIcon2 as FootIcon3,
  PersonIcon2 as PersonIcon3, WalkIcon2 as WalkIcon3,
  RunIcon2 as RunIcon3, SwimIcon2 as SwimIcon3,
  CycleIcon2 as CycleIcon3, DumbIcon2 as DumbIcon3,
  WeightIcon2 as WeightIcon3, ScaleIcon2 as ScaleIcon3,
  RulerIcon2 as RulerIcon3, HammerIcon2 as HammerIcon3,
  WrenchIcon2 as WrenchIcon3, ScrewIcon2 as ScrewIcon3,
  NutIcon2 as NutIcon3, BoltIcon2 as BoltIcon3, ToolIcon2 as ToolIcon3,
  ToolsIcon2 as ToolsIcon3, SlidersIcon2 as SlidersIcon3,
  SlidersHIcon2 as SlidersHIcon3, ToggleLIcon2 as ToggleLIcon3,
  ToggleRIcon2 as ToggleRIcon3, SelectIcon2 as SelectIcon3,
  SelectAllIcon2 as SelectAllIcon3, DeselectIcon2 as DeselectIcon3,
  ClearAllIcon2 as ClearAllIcon3, DeleteIcon2 as DeleteIcon3,
  ZoomInIcon2 as ZoomInIcon3, ZoomOutIcon2 as ZoomOutIcon3,
  FocusIcon2 as FocusIcon3, CrossIcon2 as CrossIcon3,
  LocateIcon2 as LocateIcon3, LocateFixIcon2 as LocateFixIcon3,
  MaxIcon2 as MaxIcon3, Max2Icon2 as Max2Icon3,
  MinIcon2 as MinIcon3, Min2Icon2 as Min2Icon3,
  ExpandIcon3 as ExpandIcon4, CollapseIcon3 as CollapseIcon4,
  FullIcon2 as FullIcon3, FullOffIcon2 as FullOffIcon3,
  ExitFullIcon2 as ExitFullIcon3, EnterFullIcon2 as EnterFullIcon3,
  RotateCwIcon2 as RotateCwIcon3, RotateCcwIcon2 as RotateCcwIcon3,
  Rotate3dIcon2 as Rotate3dIcon3, FlipHIcon2 as FlipHIcon3,
  FlipVIcon2 as FlipVIcon3, ArrowUpIcon2 as ArrowUpIcon3,
  ArrowDownIcon2 as ArrowDownIcon3, ArrowLeftIcon2 as ArrowLeftIcon3,
  ArrowRightIcon2 as ArrowRightIcon3, ArrowURIcon2 as ArrowURIcon3,
  ArrowDRIcon2 as ArrowDRIcon3, ArrowULIcon2 as ArrowULIcon3,
  ArrowDLIcon2 as ArrowDLIcon3, SunIcon2 as SunIcon3, MoonIcon2 as MoonIcon3,
  CloudRainIcon2 as CloudRainIcon3, CloudSnowIcon2 as CloudSnowIcon3,
  FlameIcon2 as FlameIcon3, SnowIcon2 as SnowIcon3, UmbIcon2 as UmbIcon3,
  WindIcon2 as WindIcon3, DropIcon2 as DropIcon3, TimerIcon2 as TimerIcon3,
  TimerOffIcon2 as TimerOffIcon3, TimerResetIcon2 as TimerResetIcon3,
  StopwatchIcon2 as StopwatchIcon3, CalDaysIcon2 as CalDaysIcon3,
  CalCheckIcon2 as CalCheckIcon3, CalClockIcon2 as CalClockIcon3,
  AlarmIcon2 as AlarmIcon3, HourglassIcon2 as HourglassIcon3,
  VolIcon2 as VolIcon3, VolOffIcon2 as VolOffIcon3, MicIcon2 as MicIcon3,
  MicOffIcon2 as MicOffIcon3, CamIcon2 as CamIcon3, CamOffIcon2 as CamOffIcon3,
  VideoIcon2 as VideoIcon3, VideoOffIcon2 as VideoOffIcon3, PhoneIcon2 as PhoneIcon3,
  MailIcon2 as MailIcon3, AtIcon2 as AtIcon3, HashTagIcon2 as HashTagIcon3,
  BinaryIcon2 as BinaryIcon3, CodeIcon2 as CodeIcon3, Code2Icon2 as Code2Icon3,
  BracesIcon2 as BracesIcon3, TermIcon2 as TermIcon3, CmdIcon2 as CmdIcon3,
  GitPRIcon2 as GitPRIcon3, GitMergeIcon2 as GitMergeIcon3,
  DbIcon3 as DbIcon4, ServerIcon2 as ServerIcon3, CloudIcon2 as CloudIcon3,
  CloudOffIcon2 as CloudOffIcon3, CloudUpIcon2 as CloudUpIcon3,
  CloudDownIcon2 as CloudDownIcon3, NetIcon3 as NetIcon4,
  CpuIcon3 as CpuIcon4, MemIcon2 as MemIcon3, HdIcon3 as HdIcon4,
  ThermIcon3 as ThermIcon4, RadioIcon3 as RadioIcon4,
  SignalIcon3 as SignalIcon4, WifiIcon4 as WifiIcon5,
  LockIcon3 as LockIcon4, UnlockIcon3 as UnlockIcon4,
  KeyIcon3 as KeyIcon4, FpIcon3 as FpIcon4, ShieldIcon3 as ShieldIcon4,
  AlertTriIcon3 as AlertTriIcon4, AlertCircIcon3 as AlertCircIcon4,
  CheckCircIcon3 as CheckCircIcon4, XCircIcon3 as XCircIcon4,
  InfoIcon3 as InfoIcon4, HelpIcon3 as HelpIcon4, SettingsIcon3 as SettingsIcon4,
  MoreVertIcon3 as MoreVertIcon4, ChevDownIcon3 as ChevDownIcon4,
  ChevRightIcon3 as ChevRightIcon4, ChevLeftIcon3 as ChevLeftIcon4,
  PlusIcon3 as PlusIcon4, MinusIcon3 as MinusIcon4, CopyIcon3 as CopyIcon4,
  CheckIcon3 as CheckIcon4, ExtLinkIcon3 as ExtLinkIcon4, MsgIcon3 as MsgIcon4,
  SendIcon3 as SendIcon4, UsersIcon3 as UsersIcon4, UserIcon3 as UserIcon4,
  UserCheckIcon3 as UserCheckIcon4, UserXIcon3 as UserXIcon4,
  UserPlusIcon3 as UserPlusIcon4, UserMinusIcon3 as UserMinusIcon4,
  Share2Icon3 as Share2Icon4, SaveIcon3 as SaveIcon4, FolderOpenIcon3 as FolderOpenIcon4,
  FileIcon3 as FileIcon4, FileCodeIcon3 as FileCodeIcon4,
  FileTextIcon3 as FileTextIcon4, ArchiveIcon3 as ArchiveIcon4,
  InboxIcon3 as InboxIcon4, BellIcon3 as BellIcon4, BellOffIcon3 as BellOffIcon4,
  PlayIcon3 as PlayIcon4, PauseIcon3 as PauseIcon4, StopCircIcon3 as StopCircIcon4,
  SkipFwdIcon3 as SkipFwdIcon4, SkipBackIcon3 as SkipBackIcon4,
  RepeatIcon3 as RepeatIcon4, ShuffleIcon3 as ShuffleIcon4,
  HeartIcon3 as HeartIcon4, ThumbsUpIcon3 as ThumbsUpIcon4,
  ThumbsDownIcon3 as ThumbsDownIcon4, AwardIcon3 as AwardIcon4,
  TrophyIcon3 as TrophyIcon4, TargetIcon4 as TargetIcon5,
  FlagIcon3 as FlagIcon4, MapPinIcon3 as MapPinIcon4,
  NavIcon3 as NavIcon4, CompassIcon3 as CompassIcon4,
  GlobeIcon3 as GlobeIcon4, SatIcon3 as SatIcon4,
  RocketIcon3 as RocketIcon4, PlaneIcon3 as PlaneIcon4,
  TrainIcon3 as TrainIcon4, BusIcon3 as BusIcon4, CarIcon3 as CarIcon4,
  BikeIcon3 as BikeIcon4, FootIcon3 as FootIcon4,
  PersonIcon3 as PersonIcon4, WalkIcon3 as WalkIcon4,
  RunIcon3 as RunIcon4, SwimIcon3 as SwimIcon4,
  CycleIcon3 as CycleIcon4, DumbIcon3 as DumbIcon4,
  WeightIcon3 as WeightIcon4, ScaleIcon3 as ScaleIcon4,
  RulerIcon3 as RulerIcon4, HammerIcon3 as HammerIcon4,
  WrenchIcon3 as WrenchIcon4, ScrewIcon3 as ScrewIcon4,
  NutIcon3 as NutIcon4, BoltIcon3 as BoltIcon4, ToolIcon3 as ToolIcon4,
  ToolsIcon3 as ToolsIcon4, SlidersIcon3 as SlidersIcon4,
  SlidersHIcon3 as SlidersHIcon4, ToggleLIcon3 as ToggleLIcon4,
  ToggleRIcon3 as ToggleRIcon4, SelectIcon3 as SelectIcon4,
  SelectAllIcon3 as SelectAllIcon4, DeselectIcon3 as DeselectIcon4,
  ClearAllIcon3 as ClearAllIcon4, DeleteIcon3 as DeleteIcon4,
  ZoomInIcon3 as ZoomInIcon4, ZoomOutIcon3 as ZoomOutIcon4,
  FocusIcon3 as FocusIcon4, CrossIcon3 as CrossIcon4,
  LocateIcon3 as LocateIcon4, LocateFixIcon3 as LocateFixIcon4,
  MaxIcon3 as MaxIcon4, Max2Icon3 as Max2Icon4,
  MinIcon3 as MinIcon4, Min2Icon3 as Min2Icon4,
  ExpandIcon4 as ExpandIcon5, CollapseIcon4 as CollapseIcon5,
  FullIcon3 as FullIcon4, FullOffIcon3 as FullOffIcon4,
  ExitFullIcon3 as ExitFullIcon4, EnterFullIcon3 as EnterFullIcon4,
  RotateCwIcon3 as RotateCwIcon4, RotateCcwIcon3 as RotateCcwIcon4,
  Rotate3dIcon3 as Rotate3dIcon4, FlipHIcon3 as FlipHIcon4,
  FlipVIcon3 as FlipVIcon4, ArrowUpIcon3 as ArrowUpIcon4,
  ArrowDownIcon3 as ArrowDownIcon4, ArrowLeftIcon3 as ArrowLeftIcon4,
  ArrowRightIcon3 as ArrowRightIcon4, ArrowURIcon3 as ArrowURIcon4,
  ArrowDRIcon3 as ArrowDRIcon4, ArrowULIcon3 as ArrowULIcon4,
  ArrowDLIcon3 as ArrowDLIcon4, SunIcon3 as SunIcon4, MoonIcon3 as MoonIcon4,
  CloudRainIcon3 as CloudRainIcon4, CloudSnowIcon3 as CloudSnowIcon4,
  FlameIcon3 as FlameIcon4, SnowIcon3 as SnowIcon4, UmbIcon3 as UmbIcon4,
  WindIcon3 as WindIcon4, DropIcon3 as DropIcon4, TimerIcon3 as TimerIcon4,
  TimerOffIcon3 as TimerOffIcon4, TimerResetIcon3 as TimerResetIcon4,
  StopwatchIcon3 as StopwatchIcon4, CalDaysIcon3 as CalDaysIcon4,
  CalCheckIcon3 as CalCheckIcon4, CalClockIcon3 as CalClockIcon4,
  AlarmIcon3 as AlarmIcon4, HourglassIcon3 as HourglassIcon4,
  VolIcon3 as VolIcon4, VolOffIcon3 as VolOffIcon4, MicIcon3 as MicIcon4,
  MicOffIcon3 as MicOffIcon4, CamIcon3 as CamIcon4, CamOffIcon3 as CamOffIcon4,
  VideoIcon3 as VideoIcon4, VideoOffIcon3 as VideoOffIcon4, PhoneIcon3 as PhoneIcon4,
  MailIcon3 as MailIcon4, AtIcon3 as AtIcon4, HashTagIcon3 as HashTagIcon4,
  BinaryIcon3 as BinaryIcon4, CodeIcon3 as CodeIcon4, Code2Icon3 as Code2Icon4,
  BracesIcon3 as BracesIcon4, TermIcon3 as TermIcon4, CmdIcon3 as CmdIcon4,
  GitPRIcon3 as GitPRIcon4, GitMergeIcon3 as GitMergeIcon4,
} from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, AreaChart, Area, BarChart, Bar,
  PieChart, Pie, Cell, ComposedChart,
  ReferenceLine, Legend, RadialBarChart, RadialBar,
  ScatterChart, Scatter, ZAxis, RadarChart, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis, Radar,
} from "recharts";

// ============================================================================
// TYPE DEFINITIONS — MEMORY DATA STRUCTURES
// ============================================================================

type MemoryType = "EPISODIC" | "SEMANTIC" | "PROCEDURAL" | "EMOTIONAL" | "SENSORY" | "WORKING";
type EmotionType = "JOY" | "SADNESS" | "ANGER" | "FEAR" | "SURPRISE" | "DISGUST" | "TRUST" | "ANTICIPATION" | "NEUTRAL";
type MemoryStatus = "ACTIVE" | "DECAYING" | "ARCHIVED" | "FORGOTTEN" | "REINFORCED";
type ClusterType = "PROJECT" | "PERSON" | "LOCATION" | "CONCEPT" | "EVENT" | "SKILL";

interface MemoryNode {
  id: string;
  title: string;
  content: string;
  type: MemoryType;
  emotion: EmotionType;
  intensity: number; // 0-100
  status: MemoryStatus;
  cluster: ClusterType;
  clusterId: string;
  position: { x: number; y: number; z: number };
  connections: string[];
  tags: string[];
  createdAt: Date;
  lastAccessed: Date;
  accessCount: number;
  decayRate: number; // 0-100
  strength: number; // 0-100
  metadata: {
    source?: string;
    context?: string;
    location?: string;
    people?: string[];
    duration?: number;
    sensoryDetails?: string[];
  };
  color: string;
  size: number;
  glowIntensity: number;
}

interface MemoryConnection {
  id: string;
  source: string;
  target: string;
  strength: number; // 0-100
  type: "ASSOCIATIVE" | "TEMPORAL" | "CAUSAL" | "EMOTIONAL" | "SEMANTIC";
  color: string;
}

interface MemoryCluster {
  id: string;
  name: string;
  type: ClusterType;
  nodeCount: number;
  centerPosition: { x: number; y: number; z: number };
  color: string;
  memories: string[];
}

interface MemoryAnalytics {
  totalMemories: number;
  activeMemories: number;
  decayingMemories: number;
  archivedMemories: number;
  forgottenMemories: number;
  avgStrength: number;
  avgDecayRate: number;
  typeDistribution: { type: string; count: number }[];
  emotionDistribution: { emotion: string; count: number }[];
  clusterDistribution: { cluster: string; count: number }[];
  strengthOverTime: { date: string; avgStrength: number }[];
  accessFrequency: { hour: string; accesses: number }[];
  decayCurve: { days: number; remaining: number }[];
  topClusters: { name: string; count: number; strength: number }[];
  recentMemories: MemoryNode[];
  strongestMemories: MemoryNode[];
  weakestMemories: MemoryNode[];
  emotionalIntensity: { emotion: string; avgIntensity: number }[];
}

interface MemoryFilter {
  types: MemoryType[];
  emotions: EmotionType[];
  statuses: MemoryStatus[];
  clusters: ClusterType[];
  minStrength?: number;
  maxDecayRate?: number;
  dateRange?: { start: Date; end: Date };
  searchQuery: string;
  tags: string[];
}

// ============================================================================
// UTILITY FUNCTIONS — MEMORY HELPERS
// ============================================================================

const generateMemoryId = (): string => `mem_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;

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

const getMemoryColor = (type: MemoryType): string => {
  const colors: Record<MemoryType, string> = {
    EPISODIC: "#a855f7",
    SEMANTIC: "#06b6d4",
    PROCEDURAL: "#10b981",
    EMOTIONAL: "#ec4899",
    SENSORY: "#f59e0b",
    WORKING: "#3b82f6",
  };
  return colors[type];
};

const getEmotionColor = (emotion: EmotionType): string => {
  const colors: Record<EmotionType, string> = {
    JOY: "#fbbf24",
    SADNESS: "#3b82f6",
    ANGER: "#ef4444",
    FEAR: "#8b5cf6",
    SURPRISE: "#f97316",
    DISGUST: "#10b981",
    TRUST: "#06b6d4",
    ANTICIPATION: "#ec4899",
    NEUTRAL: "#64748b",
  };
  return colors[emotion];
};

const getStatusColor = (status: MemoryStatus): string => {
  const colors: Record<MemoryStatus, string> = {
    ACTIVE: "text-green-400 bg-green-500/20 border-green-500/50",
    DECAYING: "text-yellow-400 bg-yellow-500/20 border-yellow-500/50",
    ARCHIVED: "text-blue-400 bg-blue-500/20 border-blue-500/50",
    FORGOTTEN: "text-slate-400 bg-slate-500/20 border-slate-500/50",
    REINFORCED: "text-purple-400 bg-purple-500/20 border-purple-500/50",
  };
  return colors[status];
};

const getClusterColor = (type: ClusterType): string => {
  const colors: Record<ClusterType, string> = {
    PROJECT: "#a855f7",
    PERSON: "#ec4899",
    LOCATION: "#10b981",
    CONCEPT: "#06b6d4",
    EVENT: "#f59e0b",
    SKILL: "#3b82f6",
  };
  return colors[type];
};

const calculateDecay = (daysSinceAccess: number, decayRate: number): number => {
  return Math.max(0, 100 - (daysSinceAccess * decayRate * 0.1));
};

const generateRandomPosition = (radius: number = 50): { x: number; y: number; z: number } => {
  const theta = Math.random() * Math.PI * 2;
  const phi = Math.acos(2 * Math.random() - 1);
  const r = Math.random() * radius;
  return {
    x: r * Math.sin(phi) * Math.cos(theta),
    y: r * Math.sin(phi) * Math.sin(theta),
    z: r * Math.cos(phi),
  };
};

// ============================================================================
// DATA SIMULATION — MEMORY GENERATOR
// ============================================================================

const MEMORY_TITLES = [
  "First conversation with JARVIS",
  "Phase 12 completion celebration",
  "Debugging the WebSocket connection",
  "Learning Three.js fundamentals",
  "Building the Trading Dashboard",
  "Security breach attempt blocked",
  "Successful blockchain transaction",
  "Neural network training session",
  "Voice recognition calibration",
  "Panic room drill execution",
  "Council of Three debate analysis",
  "Memory consolidation process",
  "Quantum entanglement experiment",
  "Swarm intelligence optimization",
  "IoT device integration test",
  "Biometric authentication setup",
  "eBPF kernel monitoring setup",
  "Generative UI prototype",
  "Self-healing protocol activation",
  "Digital will configuration",
];

const MEMORY_CONTENTS = [
  "This memory represents a significant milestone in the development of the JARVIS system.",
  "Critical debugging session that resolved a major connectivity issue.",
  "Learning experience that expanded the system's capabilities.",
  "Security event that tested the containment protocols.",
  "Successful implementation of a complex feature.",
];

const MEMORY_TAGS = ["milestone", "debugging", "learning", "security", "feature", "optimization", "integration", "testing", "deployment", "maintenance"];
const MEMORY_PEOPLE = ["Rupam", "JARVIS", "Tony Stark", "Pepper Potts", "Happy Hogan"];
const MEMORY_LOCATIONS = ["Home Lab", "Stark Tower", "Avengers Compound", "MIT", "Silicon Valley"];

const generateMockMemories = (count: number): MemoryNode[] => {
  const memories: MemoryNode[] = [];
  const types: MemoryType[] = ["EPISODIC", "SEMANTIC", "PROCEDURAL", "EMOTIONAL", "SENSORY", "WORKING"];
  const emotions: EmotionType[] = ["JOY", "SADNESS", "ANGER", "FEAR", "SURPRISE", "DISGUST", "TRUST", "ANTICIPATION", "NEUTRAL"];
  const statuses: MemoryStatus[] = ["ACTIVE", "DECAYING", "ARCHIVED", "FORGOTTEN", "REINFORCED"];
  const clusters: ClusterType[] = ["PROJECT", "PERSON", "LOCATION", "CONCEPT", "EVENT", "SKILL"];

  for (let i = 0; i < count; i++) {
    const type = types[Math.floor(Math.random() * types.length)];
    const emotion = emotions[Math.floor(Math.random() * emotions.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const cluster = clusters[Math.floor(Math.random() * clusters.length)];
    const createdAt = new Date(Date.now() - Math.random() * 86400000 * 365);
    const lastAccessed = new Date(Date.now() - Math.random() * 86400000 * 30);
    const daysSinceAccess = Math.floor((Date.now() - lastAccessed.getTime()) / 86400000);
    const decayRate = Math.random() * 5 + 1;
    const strength = calculateDecay(daysSinceAccess, decayRate);

    memories.push({
      id: generateMemoryId(),
      title: MEMORY_TITLES[i % MEMORY_TITLES.length] + ` #${i + 1}`,
      content: MEMORY_CONTENTS[i % MEMORY_CONTENTS.length],
      type,
      emotion,
      intensity: Math.random() * 100,
      status,
      cluster,
      clusterId: `cluster-${cluster.toLowerCase()}-${Math.floor(Math.random() * 10)}`,
      position: generateRandomPosition(80),
      connections: [],
      tags: MEMORY_TAGS.sort(() => Math.random() - 0.5).slice(0, Math.floor(Math.random() * 4) + 1),
      createdAt,
      lastAccessed,
      accessCount: Math.floor(Math.random() * 100),
      decayRate,
      strength,
      metadata: {
        source: ["conversation", "observation", "action", "reflection"][Math.floor(Math.random() * 4)],
        context: "Development session",
        location: MEMORY_LOCATIONS[Math.floor(Math.random() * MEMORY_LOCATIONS.length)],
        people: MEMORY_PEOPLE.sort(() => Math.random() - 0.5).slice(0, Math.floor(Math.random() * 3)),
        duration: Math.random() * 3600,
        sensoryDetails: ["visual", "auditory", "tactile"].filter(() => Math.random() > 0.5),
      },
      color: getMemoryColor(type),
      size: Math.random() * 2 + 1,
      glowIntensity: strength / 100,
    });
  }

  // Generate connections
  memories.forEach((memory, i) => {
    const connectionCount = Math.floor(Math.random() * 5) + 1;
    for (let j = 0; j < connectionCount; j++) {
      const targetIndex = Math.floor(Math.random() * memories.length);
      if (targetIndex !== i && !memory.connections.includes(memories[targetIndex].id)) {
        memory.connections.push(memories[targetIndex].id);
      }
    }
  });

  return memories;
};

const generateMockClusters = (memories: MemoryNode[]): MemoryCluster[] => {
  const clusterMap: Record<string, MemoryNode[]> = {};
  memories.forEach(m => {
    if (!clusterMap[m.clusterId]) clusterMap[m.clusterId] = [];
    clusterMap[m.clusterId].push(m);
  });

  return Object.entries(clusterMap).map(([id, nodes]) => ({
    id,
    name: `${nodes[0].cluster} Cluster`,
    type: nodes[0].cluster,
    nodeCount: nodes.length,
    centerPosition: {
      x: nodes.reduce((sum, n) => sum + n.position.x, 0) / nodes.length,
      y: nodes.reduce((sum, n) => sum + n.position.y, 0) / nodes.length,
      z: nodes.reduce((sum, n) => sum + n.position.z, 0) / nodes.length,
    },
    color: getClusterColor(nodes[0].cluster),
    memories: nodes.map(n => n.id),
  }));
};

const generateMockConnections = (memories: MemoryNode[]): MemoryConnection[] => {
  const connections: MemoryConnection[] = [];
  const connTypes: MemoryConnection["type"][] = ["ASSOCIATIVE", "TEMPORAL", "CAUSAL", "EMOTIONAL", "SEMANTIC"];

  memories.forEach(memory => {
    memory.connections.forEach(targetId => {
      connections.push({
        id: `conn-${memory.id}-${targetId}`,
        source: memory.id,
        target: targetId,
        strength: Math.random() * 100,
        type: connTypes[Math.floor(Math.random() * connTypes.length)],
        color: memory.color,
      });
    });
  });

  return connections;
};

const generateMockAnalytics = (memories: MemoryNode[]): MemoryAnalytics => {
  const typeDist: Record<string, number> = {};
  const emotionDist: Record<string, number> = {};
  const clusterDist: Record<string, number> = {};

  memories.forEach(m => {
    typeDist[m.type] = (typeDist[m.type] || 0) + 1;
    emotionDist[m.emotion] = (emotionDist[m.emotion] || 0) + 1;
    clusterDist[m.cluster] = (clusterDist[m.cluster] || 0) + 1;
  });

  return {
    totalMemories: memories.length,
    activeMemories: memories.filter(m => m.status === "ACTIVE").length,
    decayingMemories: memories.filter(m => m.status === "DECAYING").length,
    archivedMemories: memories.filter(m => m.status === "ARCHIVED").length,
    forgottenMemories: memories.filter(m => m.status === "FORGOTTEN").length,
    avgStrength: memories.reduce((sum, m) => sum + m.strength, 0) / memories.length,
    avgDecayRate: memories.reduce((sum, m) => sum + m.decayRate, 0) / memories.length,
    typeDistribution: Object.entries(typeDist).map(([type, count]) => ({ type, count })),
    emotionDistribution: Object.entries(emotionDist).map(([emotion, count]) => ({ emotion, count })),
    clusterDistribution: Object.entries(clusterDist).map(([cluster, count]) => ({ cluster, count })),
    strengthOverTime: Array.from({ length: 30 }, (_, i) => ({
      date: `Day ${i + 1}`,
      avgStrength: 100 - i * 2 + Math.random() * 10,
    })),
    accessFrequency: Array.from({ length: 24 }, (_, i) => ({
      hour: `${i}:00`,
      accesses: Math.floor(Math.random() * 100),
    })),
    decayCurve: Array.from({ length: 365 }, (_, i) => ({
      days: i,
      remaining: calculateDecay(i, 2),
    })),
    topClusters: Object.entries(clusterDist)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([name, count]) => ({
        name,
        count,
        strength: Math.random() * 100,
      })),
    recentMemories: memories.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()).slice(0, 5),
    strongestMemories: memories.sort((a, b) => b.strength - a.strength).slice(0, 5),
    weakestMemories: memories.sort((a, b) => a.strength - b.strength).slice(0, 5),
    emotionalIntensity: Object.entries(emotionDist).map(([emotion]) => ({
      emotion,
      avgIntensity: Math.random() * 100,
    })),
  };
};

// ============================================================================
// 3D COMPONENTS — MEMORY VISUALIZATION
// ============================================================================

// --- Memory Node Component ---
const MemoryNode3D: React.FC<{
  memory: MemoryNode;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onHover: (id: string | null) => void;
}> = ({ memory, isSelected, onSelect, onHover }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01;
      meshRef.current.position.y += Math.sin(state.clock.elapsedTime * 2 + memory.position.x) * 0.002;
    }
  });

  return (
    <group position={[memory.position.x, memory.position.y, memory.position.z]}>
      <Sphere
        ref={meshRef}
        args={[memory.size * 0.5, 32, 32]}
        onClick={(e) => {
          e.stopPropagation();
          onSelect(memory.id);
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          onHover(memory.id);
        }}
        onPointerOut={() => {
          setHovered(false);
          onHover(null);
        }}
      >
        <meshStandardMaterial
          color={memory.color}
          emissive={memory.color}
          emissiveIntensity={hovered || isSelected ? 0.8 : memory.glowIntensity * 0.3}
          transparent
          opacity={memory.status === "FORGOTTEN" ? 0.3 : 0.9}
        />
      </Sphere>
      
      {(hovered || isSelected) && (
        <Billboard>
          <Text
            position={[0, memory.size + 0.5, 0]}
            fontSize={0.3}
            color="white"
            anchorX="center"
            anchorY="bottom"
            outlineWidth={0.05}
            outlineColor="black"
          >
            {memory.title.substring(0, 30)}...
          </Text>
        </Billboard>
      )}

      <Sparkles count={5} scale={memory.size * 2} size={2} speed={0.5} color={memory.color} />
    </group>
  );
};

// --- Memory Connection Line ---
const MemoryConnectionLine: React.FC<{
  connection: MemoryConnection;
  sourcePos: { x: number; y: number; z: number };
  targetPos: { x: number; y: number; z: number };
}> = ({ connection, sourcePos, targetPos }) => {
  const points = useMemo(() => {
    return [
      new THREE.Vector3(sourcePos.x, sourcePos.y, sourcePos.z),
      new THREE.Vector3(targetPos.x, targetPos.y, targetPos.z),
    ];
  }, [sourcePos, targetPos]);

  return (
    <Line
      points={points}
      color={connection.color}
      lineWidth={connection.strength / 50}
      transparent
      opacity={connection.strength / 200}
    />
  );
};

// --- Memory Cluster Sphere ---
const MemoryClusterSphere: React.FC<{
  cluster: MemoryCluster;
  isSelected: boolean;
  onSelect: (id: string) => void;
}> = ({ cluster, isSelected, onSelect }) => {
  return (
    <group position={[cluster.centerPosition.x, cluster.centerPosition.y, cluster.centerPosition.z]}>
      <Sphere
        args={[8, 32, 32]}
        onClick={(e) => {
          e.stopPropagation();
          onSelect(cluster.id);
        }}
      >
        <meshStandardMaterial
          color={cluster.color}
          transparent
          opacity={0.1}
          wireframe
        />
      </Sphere>
    </group>
  );
};

// --- 3D Scene Component ---
const MemoryScene: React.FC<{
  memories: MemoryNode[];
  connections: MemoryConnection[];
  clusters: MemoryCluster[];
  selectedMemory: string | null;
  selectedCluster: string | null;
  onSelectMemory: (id: string) => void;
  onSelectCluster: (id: string) => void;
  onHoverMemory: (id: string | null) => void;
  filter: MemoryFilter;
}> = ({ memories, connections, clusters, selectedMemory, selectedCluster, onSelectMemory, onSelectCluster, onHoverMemory, filter }) => {
  const filteredMemories = useMemo(() => {
    return memories.filter(m => {
      if (filter.types.length > 0 && !filter.types.includes(m.type)) return false;
      if (filter.emotions.length > 0 && !filter.emotions.includes(m.emotion)) return false;
      if (filter.statuses.length > 0 && !filter.statuses.includes(m.status)) return false;
      if (filter.minStrength !== undefined && m.strength < filter.minStrength) return false;
      if (filter.searchQuery && !m.title.toLowerCase().includes(filter.searchQuery.toLowerCase())) return false;
      return true;
    });
  }, [memories, filter]);

  const filteredConnections = useMemo(() => {
    const memoryIds = new Set(filteredMemories.map(m => m.id));
    return connections.filter(c => memoryIds.has(c.source) && memoryIds.has(c.target));
  }, [connections, filteredMemories]);

  return (
    <>
      <ambientLight intensity={0.3} />
      <pointLight position={[100, 100, 100]} intensity={1} />
      <pointLight position={[-100, -100, -100]} intensity={0.5} color="#a855f7" />
      
      <Stars radius={200} depth={100} count={5000} factor={4} saturation={0} fade speed={1} />
      
      {clusters.map(cluster => (
        <MemoryClusterSphere
          key={cluster.id}
          cluster={cluster}
          isSelected={selectedCluster === cluster.id}
          onSelect={onSelectCluster}
        />
      ))}

      {filteredConnections.map(conn => {
        const source = filteredMemories.find(m => m.id === conn.source);
        const target = filteredMemories.find(m => m.id === conn.target);
        if (!source || !target) return null;
        return (
          <MemoryConnectionLine
            key={conn.id}
            connection={conn}
            sourcePos={source.position}
            targetPos={target.position}
          />
        );
      })}

      {filteredMemories.map(memory => (
        <MemoryNode3D
          key={memory.id}
          memory={memory}
          isSelected={selectedMemory === memory.id}
          onSelect={onSelectMemory}
          onHover={onHoverMemory}
        />
      ))}

      <OrbitControls
        enablePan
        enableZoom
        enableRotate
        minDistance={20}
        maxDistance={300}
        autoRotate
        autoRotateSpeed={0.5}
      />
    </>
  );
};

// ============================================================================
// UI COMPONENTS — MEMORY INTERFACE
// ============================================================================

// --- Memory Detail Panel ---
const MemoryDetailPanel: React.FC<{
  memory: MemoryNode | null;
  onClose: () => void;
  onReinforce: (id: string) => void;
  onArchive: (id: string) => void;
  onDelete: (id: string) => void;
}> = ({ memory, onClose, onReinforce, onArchive, onDelete }) => {
  if (!memory) return null;

  return (
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 100 }}
      className="fixed right-6 top-1/2 -translate-y-1/2 w-96 bg-black/80 backdrop-blur-xl border border-purple-500/30 rounded-2xl p-6 shadow-[0_0_50px_rgba(168,85,247,0.3)] z-50"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-white">Memory Details</h3>
        <button onClick={onClose} className="text-white/60 hover:text-white">
          <X size={20} />
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <div className="text-xs text-white/60 mb-1">Title</div>
          <div className="text-sm text-white font-semibold">{memory.title}</div>
        </div>

        <div>
          <div className="text-xs text-white/60 mb-1">Content</div>
          <div className="text-xs text-white/80 leading-relaxed">{memory.content}</div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-black/40 rounded-lg p-3 border border-white/10">
            <div className="text-[10px] text-white/40 mb-1">Type</div>
            <div className="text-xs font-bold" style={{ color: memory.color }}>{memory.type}</div>
          </div>
          <div className="bg-black/40 rounded-lg p-3 border border-white/10">
            <div className="text-[10px] text-white/40 mb-1">Emotion</div>
            <div className="text-xs font-bold" style={{ color: getEmotionColor(memory.emotion) }}>{memory.emotion}</div>
          </div>
          <div className="bg-black/40 rounded-lg p-3 border border-white/10">
            <div className="text-[10px] text-white/40 mb-1">Strength</div>
            <div className="text-xs font-bold text-green-400">{memory.strength.toFixed(1)}%</div>
          </div>
          <div className="bg-black/40 rounded-lg p-3 border border-white/10">
            <div className="text-[10px] text-white/40 mb-1">Status</div>
            <span className={`text-[10px] px-2 py-0.5 rounded border ${getStatusColor(memory.status)}`}>
              {memory.status}
            </span>
          </div>
        </div>

        <div>
          <div className="text-xs text-white/60 mb-2">Tags</div>
          <div className="flex gap-1 flex-wrap">
            {memory.tags.map(tag => (
              <span key={tag} className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-400 text-[10px] border border-purple-500/50">
                #{tag}
              </span>
            ))}
          </div>
        </div>

        <div>
          <div className="text-xs text-white/60 mb-1">Created</div>
          <div className="text-xs text-white/80">{formatDate(memory.createdAt)}</div>
          <div className="text-xs text-white/60 mt-2">Last Accessed</div>
          <div className="text-xs text-white/80">{formatRelativeTime(memory.lastAccessed)}</div>
        </div>

        <div className="flex gap-2 pt-4 border-t border-white/10">
          <button
            onClick={() => onReinforce(memory.id)}
            className="flex-1 px-3 py-2 bg-purple-600/20 border border-purple-500/50 text-purple-400 rounded-lg text-xs font-bold hover:bg-purple-600/30 transition-all"
          >
            Reinforce
          </button>
          <button
            onClick={() => onArchive(memory.id)}
            className="flex-1 px-3 py-2 bg-blue-600/20 border border-blue-500/50 text-blue-400 rounded-lg text-xs font-bold hover:bg-blue-600/30 transition-all"
          >
            Archive
          </button>
          <button
            onClick={() => onDelete(memory.id)}
            className="px-3 py-2 bg-red-600/20 border border-red-500/50 text-red-400 rounded-lg text-xs font-bold hover:bg-red-600/30 transition-all"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

// --- Memory Analytics Panel ---
const MemoryAnalyticsPanel: React.FC<{ analytics: MemoryAnalytics }> = ({ analytics }) => {
  const COLORS = ["#a855f7", "#06b6d4", "#10b981", "#ec4899", "#f59e0b", "#3b82f6"];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
        <div className="bg-black/40 border border-white/10 rounded-lg p-3">
          <div className="text-[10px] text-white/40 mb-1">TOTAL</div>
          <div className="text-lg font-bold text-white">{analytics.totalMemories}</div>
        </div>
        <div className="bg-black/40 border border-white/10 rounded-lg p-3">
          <div className="text-[10px] text-white/40 mb-1">ACTIVE</div>
          <div className="text-lg font-bold text-green-400">{analytics.activeMemories}</div>
        </div>
        <div className="bg-black/40 border border-white/10 rounded-lg p-3">
          <div className="text-[10px] text-white/40 mb-1">DECAYING</div>
          <div className="text-lg font-bold text-yellow-400">{analytics.decayingMemories}</div>
        </div>
        <div className="bg-black/40 border border-white/10 rounded-lg p-3">
          <div className="text-[10px] text-white/40 mb-1">ARCHIVED</div>
          <div className="text-lg font-bold text-blue-400">{analytics.archivedMemories}</div>
        </div>
        <div className="bg-black/40 border border-white/10 rounded-lg p-3">
          <div className="text-[10px] text-white/40 mb-1">FORGOTTEN</div>
          <div className="text-lg font-bold text-slate-400">{analytics.forgottenMemories}</div>
        </div>
        <div className="bg-black/40 border border-white/10 rounded-lg p-3">
          <div className="text-[10px] text-white/40 mb-1">AVG STRENGTH</div>
          <div className="text-lg font-bold text-purple-400">{analytics.avgStrength.toFixed(1)}%</div>
        </div>
        <div className="bg-black/40 border border-white/10 rounded-lg p-3">
          <div className="text-[10px] text-white/40 mb-1">AVG DECAY</div>
          <div className="text-lg font-bold text-orange-400">{analytics.avgDecayRate.toFixed(1)}</div>
        </div>
        <div className="bg-black/40 border border-white/10 rounded-lg p-3">
          <div className="text-[10px] text-white/40 mb-1">CLUSTERS</div>
          <div className="text-lg font-bold text-cyan-400">{analytics.clusterDistribution.length}</div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Type Distribution */}
        <div className="bg-black/40 border border-white/10 rounded-xl p-4">
          <div className="text-sm font-bold text-white mb-3">MEMORY TYPE DISTRIBUTION</div>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={analytics.typeDistribution} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={2} dataKey="count">
                {analytics.typeDistribution.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                ))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: "rgba(0,0,0,0.9)", border: "1px solid rgba(168,85,247,0.3)", borderRadius: "8px", color: "white" }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Emotion Distribution */}
        <div className="bg-black/40 border border-white/10 rounded-xl p-4">
          <div className="text-sm font-bold text-white mb-3">EMOTIONAL DISTRIBUTION</div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={analytics.emotionDistribution}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="emotion" stroke="rgba(255,255,255,0.3)" tick={{ fontSize: 10 }} />
              <YAxis stroke="rgba(255,255,255,0.3)" tick={{ fontSize: 10 }} />
              <Tooltip contentStyle={{ backgroundColor: "rgba(0,0,0,0.9)", border: "1px solid rgba(168,85,247,0.3)", borderRadius: "8px", color: "white" }} />
              <Bar dataKey="count" fill="#ec4899" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Strength Over Time */}
        <div className="bg-black/40 border border-white/10 rounded-xl p-4">
          <div className="text-sm font-bold text-white mb-3">MEMORY STRENGTH OVER TIME</div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={analytics.strengthOverTime}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="date" stroke="rgba(255,255,255,0.3)" tick={{ fontSize: 10 }} />
              <YAxis stroke="rgba(255,255,255,0.3)" tick={{ fontSize: 10 }} />
              <Tooltip contentStyle={{ backgroundColor: "rgba(0,0,0,0.9)", border: "1px solid rgba(168,85,247,0.3)", borderRadius: "8px", color: "white" }} />
              <Area type="monotone" dataKey="avgStrength" stroke="#a855f7" fill="rgba(168,85,247,0.2)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Decay Curve */}
        <div className="bg-black/40 border border-white/10 rounded-xl p-4">
          <div className="text-sm font-bold text-white mb-3">DECAY CURVE</div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={analytics.decayCurve.slice(0, 100)}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="days" stroke="rgba(255,255,255,0.3)" tick={{ fontSize: 10 }} />
              <YAxis stroke="rgba(255,255,255,0.3)" tick={{ fontSize: 10 }} />
              <Tooltip contentStyle={{ backgroundColor: "rgba(0,0,0,0.9)", border: "1px solid rgba(168,85,247,0.3)", borderRadius: "8px", color: "white" }} />
              <Line type="monotone" dataKey="remaining" stroke="#f59e0b" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Clusters */}
      <div className="bg-black/40 border border-white/10 rounded-xl p-4">
        <div className="text-sm font-bold text-white mb-4">TOP MEMORY CLUSTERS</div>
        <div className="space-y-3">
          {analytics.topClusters.map((cluster, i) => (
            <div key={i} className="flex items-center justify-between p-3 bg-black/30 rounded-lg border border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center text-xs font-bold text-white">
                  {cluster.name[0]}
                </div>
                <div>
                  <div className="text-sm font-bold text-white">{cluster.name}</div>
                  <div className="text-[10px] text-white/60">{cluster.count} memories</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs font-bold text-purple-400">{cluster.strength.toFixed(1)}%</div>
                <div className="text-[10px] text-white/40">avg strength</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// MAIN MEMORY PALACE COMPONENT
// ============================================================================

export default function MemoryPalace() {
  const [memories, setMemories] = useState<MemoryNode[]>([]);
  const [connections, setConnections] = useState<MemoryConnection[]>([]);
  const [clusters, setClusters] = useState<MemoryCluster[]>([]);
  const [analytics, setAnalytics] = useState<MemoryAnalytics | null>(null);
  const [selectedMemory, setSelectedMemory] = useState<string | null>(null);
  const [selectedCluster, setSelectedCluster] = useState<string | null>(null);
  const [hoveredMemory, setHoveredMemory] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"3d" | "analytics" | "list">("3d");
  const [filter, setFilter] = useState<MemoryFilter>({
    types: [],
    emotions: [],
    statuses: [],
    clusters: [],
    searchQuery: "",
    tags: [],
  });
  const [showFilters, setShowFilters] = useState(false);
  const [isLive, setIsLive] = useState(true);

  // Initialize data
  useEffect(() => {
    const mockMemories = generateMockMemories(200);
    const mockConnections = generateMockConnections(mockMemories);
    const mockClusters = generateMockClusters(mockMemories);
    const mockAnalytics = generateMockAnalytics(mockMemories);

    setMemories(mockMemories);
    setConnections(mockConnections);
    setClusters(mockClusters);
    setAnalytics(mockAnalytics);
  }, []);

  // Live memory formation simulation
  useEffect(() => {
    if (!isLive) return;

    const interval = setInterval(() => {
      const newMemory = generateMockMemories(1)[0];
      newMemory.createdAt = new Date();
      newMemory.lastAccessed = new Date();
      newMemory.status = "ACTIVE";
      newMemory.strength = 100;

      setMemories(prev => [...prev, newMemory]);
    }, 10000);

    return () => clearInterval(interval);
  }, [isLive]);

  const handleSelectMemory = useCallback((id: string) => {
    setSelectedMemory(id);
    setSelectedCluster(null);
  }, []);

  const handleSelectCluster = useCallback((id: string) => {
    setSelectedCluster(id);
    setSelectedMemory(null);
  }, []);

  const handleHoverMemory = useCallback((id: string | null) => {
    setHoveredMemory(id);
  }, []);

  const handleReinforce = useCallback((id: string) => {
    setMemories(prev => prev.map(m =>
      m.id === id ? { ...m, strength: 100, status: "REINFORCED", lastAccessed: new Date() } : m
    ));
  }, []);

  const handleArchive = useCallback((id: string) => {
    setMemories(prev => prev.map(m =>
      m.id === id ? { ...m, status: "ARCHIVED" } : m
    ));
  }, []);

  const handleDelete = useCallback((id: string) => {
    setMemories(prev => prev.filter(m => m.id !== id));
    setConnections(prev => prev.filter(c => c.source !== id && c.target !== id));
    setSelectedMemory(null);
  }, []);

  const selectedMemoryData = memories.find(m => m.id === selectedMemory);

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-slate-900/80 to-black/80 border border-purple-500/30 rounded-2xl p-6 backdrop-blur-xl shadow-[0_0_30px_rgba(168,85,247,0.2)]"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <Brain className="w-8 h-8 text-purple-400" />
            <div>
              <h2 className="text-2xl font-black text-white tracking-wider">MEMORY PALACE</h2>
              <p className="text-xs text-white/60">3D Knowledge Graph • Episodic Memory • Neural Architecture</p>
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

        {/* View Mode Toggle */}
        <div className="flex gap-2 mb-4">
          {(["3d", "analytics", "list"] as const).map(mode => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                viewMode === mode
                  ? "bg-purple-600/20 text-purple-400 border border-purple-500/50"
                  : "bg-white/5 text-white/60 hover:bg-white/10"
              }`}
            >
              {mode === "3d" && <Box className="w-4 h-4 inline mr-2" />}
              {mode === "analytics" && <BarChart3 className="w-4 h-4 inline mr-2" />}
              {mode === "list" && <List className="w-4 h-4 inline mr-2" />}
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
              value={filter.searchQuery}
              onChange={(e) => setFilter({ ...filter, searchQuery: e.target.value })}
              placeholder="Search memories..."
              className="w-full bg-black/50 border border-white/10 rounded-lg pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500/50"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-xs text-white/60 hover:bg-white/10 flex items-center gap-2"
          >
            <Filter className="w-4 h-4" />
            Filters
          </button>
        </div>

        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mt-4 pt-4 border-t border-white/10 grid grid-cols-2 md:grid-cols-4 gap-3"
            >
              <div>
                <label className="text-[10px] text-white/40 mb-1 block">Memory Types</label>
                <select
                  multiple
                  value={filter.types}
                  onChange={(e) => setFilter({ ...filter, types: Array.from(e.target.selectedOptions, o => o.value as MemoryType) })}
                  className="w-full bg-black/50 border border-white/10 rounded px-2 py-1 text-xs text-white"
                >
                  {["EPISODIC", "SEMANTIC", "PROCEDURAL", "EMOTIONAL", "SENSORY", "WORKING"].map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[10px] text-white/40 mb-1 block">Emotions</label>
                <select
                  multiple
                  value={filter.emotions}
                  onChange={(e) => setFilter({ ...filter, emotions: Array.from(e.target.selectedOptions, o => o.value as EmotionType) })}
                  className="w-full bg-black/50 border border-white/10 rounded px-2 py-1 text-xs text-white"
                >
                  {["JOY", "SADNESS", "ANGER", "FEAR", "SURPRISE", "DISGUST", "TRUST", "ANTICIPATION", "NEUTRAL"].map(e => (
                    <option key={e} value={e}>{e}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[10px] text-white/40 mb-1 block">Status</label>
                <select
                  multiple
                  value={filter.statuses}
                  onChange={(e) => setFilter({ ...filter, statuses: Array.from(e.target.selectedOptions, o => o.value as MemoryStatus) })}
                  className="w-full bg-black/50 border border-white/10 rounded px-2 py-1 text-xs text-white"
                >
                  {["ACTIVE", "DECAYING", "ARCHIVED", "FORGOTTEN", "REINFORCED"].map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[10px] text-white/40 mb-1 block">Min Strength</label>
                <input
                  type="number"
                  value={filter.minStrength || ""}
                  onChange={(e) => setFilter({ ...filter, minStrength: e.target.value ? parseFloat(e.target.value) : undefined })}
                  className="w-full bg-black/50 border border-white/10 rounded px-2 py-1 text-xs text-white"
                  placeholder="0-100"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {viewMode === "3d" && (
          <motion.div
            key="3d"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="relative h-[700px] bg-black/40 border border-purple-500/30 rounded-2xl overflow-hidden"
          >
            <Canvas camera={{ position: [0, 0, 150], fov: 60 }}>
              <Suspense fallback={null}>
                <MemoryScene
                  memories={memories}
                  connections={connections}
                  clusters={clusters}
                  selectedMemory={selectedMemory}
                  selectedCluster={selectedCluster}
                  onSelectMemory={handleSelectMemory}
                  onSelectCluster={handleSelectCluster}
                  onHoverMemory={handleHoverMemory}
                  filter={filter}
                />
              </Suspense>
            </Canvas>

            {/* Overlay Info */}
            <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-xl border border-white/10 rounded-lg p-3">
              <div className="text-xs text-white/60 mb-1">Total Memories</div>
              <div className="text-lg font-bold text-purple-400">{memories.length}</div>
            </div>

            {hoveredMemory && (
              <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-xl border border-purple-500/30 rounded-lg p-3">
                <div className="text-xs text-white/60 mb-1">Hovered Memory</div>
                <div className="text-sm font-bold text-white">{memories.find(m => m.id === hoveredMemory)?.title}</div>
              </div>
            )}
          </motion.div>
        )}

        {viewMode === "analytics" && analytics && (
          <motion.div
            key="analytics"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <MemoryAnalyticsPanel analytics={analytics} />
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
                    <th className="text-left text-xs text-white/60 font-semibold p-4">Type</th>
                    <th className="text-left text-xs text-white/60 font-semibold p-4">Emotion</th>
                    <th className="text-left text-xs text-white/60 font-semibold p-4">Status</th>
                    <th className="text-left text-xs text-white/60 font-semibold p-4">Strength</th>
                    <th className="text-left text-xs text-white/60 font-semibold p-4">Last Accessed</th>
                  </tr>
                </thead>
                <tbody>
                  {memories.slice(0, 50).map(memory => (
                    <tr
                      key={memory.id}
                      className="border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer"
                      onClick={() => handleSelectMemory(memory.id)}
                    >
                      <td className="p-4">
                        <div className="text-sm text-white font-medium">{memory.title}</div>
                        <div className="text-[10px] text-white/40 mt-1">{memory.tags.slice(0, 3).join(", ")}</div>
                      </td>
                      <td className="p-4">
                        <span className="text-xs font-bold" style={{ color: memory.color }}>{memory.type}</span>
                      </td>
                      <td className="p-4">
                        <span className="text-xs font-bold" style={{ color: getEmotionColor(memory.emotion) }}>{memory.emotion}</span>
                      </td>
                      <td className="p-4">
                        <span className={`text-[10px] px-2 py-0.5 rounded border ${getStatusColor(memory.status)}`}>
                          {memory.status}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 bg-black/50 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-purple-500 to-blue-500" style={{ width: `${memory.strength}%` }} />
                          </div>
                          <span className="text-xs text-white/60">{memory.strength.toFixed(0)}%</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="text-xs text-white/60">{formatRelativeTime(memory.lastAccessed)}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Memory Detail Panel */}
      <AnimatePresence>
        {selectedMemoryData && (
          <MemoryDetailPanel
            memory={selectedMemoryData}
            onClose={() => setSelectedMemory(null)}
            onReinforce={handleReinforce}
            onArchive={handleArchive}
            onDelete={handleDelete}
          />
        )}
      </AnimatePresence>
    </div>
  );
}