"use client";
import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import {
  motion, AnimatePresence, useAnimation, useMotionValue, useTransform
} from "framer-motion";
import {
  Brain, Shield, Scale, Zap, AlertTriangle, CheckCircle, XCircle, Activity, TrendingUp, TrendingDown, BarChart3, Play, Pause, SkipForward, SkipBack, RotateCcw as RotateCcwIcon, FastForward, MessageSquare, Send, Eye, EyeOff, Lock, Unlock, Key, Cpu, Network, Database, Terminal, Code, Bug, BugOff, Search, Filter, Download, Upload, Trash2, RefreshCw, ChevronDown, ChevronRight, ChevronLeft, MoreVertical, Settings, Bell, BellOff, BellRing, X, Circle, Square as SquareIcon, Triangle, Hexagon, Octagon, Star, StarOff, Heart, ThumbsUp, ThumbsDown, Award, Trophy, Target, Flag, MapPin, Navigation, Compass, Globe, Satellite, Rocket, Plane, Train, Bus, Car, Bike, Footprints, PersonStanding, Dumbbell, Weight, Ruler, Hammer, Wrench, Nut, Bolt, Sliders, SlidersHorizontal, ToggleLeft, ToggleRight, Delete, Archive, ArchiveRestore, Inbox, View, Inspect, SortAsc, SortDesc, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, ArrowUpLeft, ArrowUpRight, ArrowDownLeft, ArrowDownRight, ArrowUpDown, ArrowLeftRight, ArrowLeftFromLine, ArrowLeftToLine, ArrowRightFromLine, ArrowRightToLine, ArrowUpFromLine, ArrowUpToLine, ArrowDownFromLine, ArrowDownToLine, ArrowBigUp, ArrowBigDown, ArrowBigLeft, ArrowBigRight, ArrowBigUpDash, ArrowBigDownDash, ArrowBigLeftDash, ArrowBigRightDash, CornerUpLeft, CornerUpRight, CornerDownLeft, CornerDownRight, RotateCw, Rotate3d, FlipHorizontal, FlipVertical, Crop, Maximize, Minimize, Expand, Fullscreen, ZoomIn, ZoomOut, Focus, Crosshair, Locate, LocateOff, LocateFixed, MapPinCheck, MapPinX, MapPinPlus, MapPinMinus, MapPinHouse, Building, Building2, Hospital, School, University, Church, Castle, Tent, TreePalm, TreeDeciduous, Flower, Flower2, Leaf, Sprout, Wheat, Carrot, Apple, Banana, Grape, Cherry, Radar
} from "lucide-react";
import {
  LineChart as RechartsLineChart, Line as RechartsLine, XAxis as RechartsXAxis, YAxis as RechartsYAxis, CartesianGrid as RechartsCartesianGrid, Tooltip as RechartsTooltip, AreaChart as RechartsAreaChart, Area as RechartsArea, BarChart as RechartsBarChart, Bar as RechartsBar, PieChart as RechartsPieChart, Pie as RechartsPie, Cell as RechartsCell, ComposedChart as RechartsComposedChart, ReferenceLine as RechartsReferenceLine, Legend as RechartsLegend, RadialBarChart, RadialBar, ScatterChart as RechartsScatterChart, Scatter as RechartsScatter, ZAxis as RechartsZAxis, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer as RechartsResponsiveContainer, RadarChart as RechartsRadarChart
, Radar as RechartsRadar} from "recharts";

// ============================================================================
// TYPE DEFINITIONS — COUNCIL DEBATE DATA STRUCTURES
// ============================================================================

type PersonaRole = "ARCHITECT" | "ADVERSARY" | "ARBITER";
type DebatePhase = "IDLE" | "PROPOSAL" | "CRITIQUE" | "REBUTTAL" | "JUDGMENT" | "VERDICT";
type ArgumentSentiment = "CONSTRUCTIVE" | "DESTRUCTIVE" | "NEUTRAL" | "DECISIVE";
type VerdictType = "APPROVE" | "REJECT" | "MODIFY" | "RECURSE";

interface Persona {
  id: PersonaRole;
  name: string;
  title: string;
  color: string;
  glowColor: string;
  icon: React.ReactNode;
  description: string;
  baseConfidence: number;
  aggressionLevel: number;
}

interface Argument {
  id: string;
  personaId: PersonaRole;
  content: string;
  sentiment: ArgumentSentiment;
  confidence: number;
  timestamp: Date;
  duration: number; // ms
  emotionalIntensity: number; // 0-100
  keywords: string[];
  rebuttalTo?: string;
}

interface DebateMetrics {
  architectInfluence: number;
  adversaryInfluence: number;
  arbiterInfluence: number;
  totalConfidence: number;
  consensusLevel: number;
  heatLevel: number; // 0-100
  processingLoad: number; // 0-100
}

interface DebateSession {
  id: string;
  topic: string;
  phase: DebatePhase;
  arguments: Argument[];
  metrics: DebateMetrics;
  verdict?: {
    type: VerdictType;
    reasoning: string;
    confidence: number;
    timestamp: Date;
  };
  startedAt: Date;
  completedAt?: Date;
  isCinematicMode: boolean;
}

interface DebateScenario {
  id: string;
  topic: string;
  architectProposal: string;
  adversaryCritique: string;
  arbiterVerdict: string;
  verdictType: VerdictType;
  difficulty: number; // 1-10
}

// ============================================================================
// CONSTANTS & MOCK DATA
// ============================================================================

const PERSONAS: Persona[] = [
  {
    id: "ARCHITECT",
    name: "ARCHITECT",
    title: "The Visionary",
    color: "#06b6d4", // Cyan
    glowColor: "rgba(6, 182, 212, 0.5)",
    icon: <Brain className="w-6 h-6" />,
    description: "Proposes optimal solutions based on long-term goals and system efficiency.",
    baseConfidence: 85,
    aggressionLevel: 20,
  },
  {
    id: "ADVERSARY",
    name: "ADVERSARY",
    title: "The Critic",
    color: "#ef4444", // Red
    glowColor: "rgba(239, 68, 68, 0.5)",
    icon: <AlertTriangle className="w-6 h-6" />,
    description: "Identifies flaws, risks, and edge cases. Challenges assumptions ruthlessly.",
    baseConfidence: 75,
    aggressionLevel: 90,
  },
  {
    id: "ARBITER",
    name: "ARBITER",
    title: "The Judge",
    color: "#a855f7", // Purple
    glowColor: "rgba(168, 85, 247, 0.5)",
    icon: <Scale className="w-6 h-6" />,
    description: "Synthesizes arguments, weighs evidence, and delivers the final binding verdict.",
    baseConfidence: 95,
    aggressionLevel: 10,
  },
];

const DEBATE_SCENARIOS: DebateScenario[] = [
  {
    id: "scenario-1",
    topic: "Deploy v5.0 to Production",
    architectProposal: "The system is stable. Telemetry shows 99.9% uptime. We should deploy immediately to capitalize on the current market window.",
    adversaryCritique: "Memory leak detected in the neural net module. Load testing at 80% capacity caused a 400ms latency spike. Deployment is premature.",
    arbiterVerdict: "Reject deployment. Patch the memory leak first. Re-evaluate in 24 hours.",
    verdictType: "REJECT",
    difficulty: 8,
  },
  {
    id: "scenario-2",
    topic: "Execute High-Frequency Trade (BTC)",
    architectProposal: "Market momentum is bullish. RSI indicates oversold conditions. Execute a 2% portfolio allocation.",
    adversaryCritique: "Whale wallet movements detected. Potential pump-and-dump scheme. Risk of 15% drawdown within the hour.",
    arbiterVerdict: "Modify order. Reduce allocation to 0.5% and set a tight stop-loss at 2%.",
    verdictType: "MODIFY",
    difficulty: 9,
  },
  {
    id: "scenario-3",
    topic: "Grant External API Access",
    architectProposal: "The partner API requires read-access to the memory DB. It will enhance our data synthesis capabilities.",
    adversaryCritique: "Zero-trust protocol violation. External access creates a vector for data exfiltration. Unacceptable risk.",
    arbiterVerdict: "Reject. Implement a localized proxy with strict rate-limiting and data masking instead.",
    verdictType: "REJECT",
    difficulty: 7,
  },
];

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

const generateId = () => Math.random().toString(36).substring(2, 15);

const formatTime = (date: Date) => {
  return date.toLocaleTimeString("en-US", { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" });
};

const getSentimentColor = (sentiment: ArgumentSentiment) => {
  switch (sentiment) {
    case "CONSTRUCTIVE": return "text-cyan-400 border-cyan-500/50 bg-cyan-500/10";
    case "DESTRUCTIVE": return "text-red-400 border-red-500/50 bg-red-500/10";
    case "NEUTRAL": return "text-slate-400 border-slate-500/50 bg-slate-500/10";
    case "DECISIVE": return "text-purple-400 border-purple-500/50 bg-purple-500/10";
  }
};

const getPersonaById = (id: PersonaRole) => PERSONAS.find(p => p.id === id)!;

// ============================================================================
// SUB-COMPONENTS — CINEMATIC UI ELEMENTS
// ============================================================================

// --- Holographic Avatar Component ---
const HolographicAvatar: React.FC<{
  persona: Persona;
  isActive: boolean;
  isSpeaking: boolean;
  confidence: number;
}> = ({ persona, isActive, isSpeaking, confidence }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative flex flex-col items-center"
    >
      {/* Outer Glow Ring */}
      <motion.div
        className="absolute inset-0 rounded-full"
        animate={{
          boxShadow: isSpeaking
            ? [`0 0 20px ${persona.glowColor}`, `0 0 60px ${persona.glowColor}`, `0 0 20px ${persona.glowColor}`]
            : [`0 0 10px ${persona.glowColor}`, `0 0 20px ${persona.glowColor}`, `0 0 10px ${persona.glowColor}`]
        }}
        transition={{ duration: isSpeaking ? 0.5 : 2, repeat: Infinity }}
        style={{ borderRadius: "50%" }}
      />
      
      {/* Rotating Tech Ring */}
      <motion.div
        className="absolute w-32 h-32 border border-dashed rounded-full"
        style={{ borderColor: persona.color + "60" }}
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      />
      
      {/* Core Avatar Circle */}
      <motion.div
        className="relative w-24 h-24 rounded-full flex items-center justify-center backdrop-blur-xl border-2"
        style={{
          backgroundColor: "rgba(0,0,0,0.6)",
          borderColor: persona.color,
          boxShadow: `inset 0 0 20px ${persona.glowColor}`
        }}
        animate={{
          scale: isSpeaking ? [1, 1.05, 1] : 1,
        }}
        transition={{ duration: 0.5, repeat: isSpeaking ? Infinity : 0 }}
      >
        <div style={{ color: persona.color }}>
          {persona.icon}
        </div>
        
        {/* Status Indicator */}
        <div className="absolute -bottom-2 px-3 py-1 rounded-full text-[10px] font-black tracking-widest border backdrop-blur-md"
             style={{ backgroundColor: "rgba(0,0,0,0.8)", borderColor: persona.color, color: persona.color }}>
          {isSpeaking ? "SPEAKING" : isActive ? "STANDBY" : "IDLE"}
        </div>
      </motion.div>

      {/* Name & Title */}
      <div className="mt-6 text-center">
        <div className="text-lg font-black tracking-[0.2em]" style={{ color: persona.color }}>
          {persona.name}
        </div>
        <div className="text-[10px] text-white/50 tracking-widest uppercase">
          {persona.title}
        </div>
      </div>

      {/* Confidence Meter */}
      <div className="mt-4 w-32">
        <div className="flex justify-between text-[10px] text-white/40 mb-1">
          <span>INFLUENCE</span>
          <span style={{ color: persona.color }}>{confidence.toFixed(0)}%</span>
        </div>
        <div className="h-1.5 bg-black/50 rounded-full overflow-hidden border border-white/10">
          <motion.div
            className="h-full rounded-full"
            style={{ backgroundColor: persona.color }}
            initial={{ width: 0 }}
            animate={{ width: `${confidence}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        </div>
      </div>
    </motion.div>
  );
};

// --- Typewriter Argument Stream ---
const ArgumentStream: React.FC<{
  argument: Argument;
  isTyping: boolean;
}> = ({ argument, isTyping }) => {
  const [displayedText, setDisplayedText] = useState("");
  const persona = getPersonaById(argument.personaId);

  useEffect(() => {
    if (!isTyping) {
      setDisplayedText(argument.content);
      return;
    }
    
    setDisplayedText("");
    let i = 0;
    const interval = setInterval(() => {
      if (i < argument.content.length) {
        setDisplayedText(argument.content.substring(0, i + 1));
        i++;
      } else {
        clearInterval(interval);
      }
    }, 15); // Typing speed

    return () => clearInterval(interval);
  }, [argument, isTyping]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20 }}
      className="w-full max-w-4xl mx-auto"
    >
      <div className="relative p-6 rounded-2xl border backdrop-blur-xl overflow-hidden"
           style={{
             backgroundColor: "rgba(0,0,0,0.4)",
             borderColor: persona.color + "40",
             boxShadow: `0 0 30px ${persona.glowColor}`
           }}>
        
        {/* Header */}
        <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center border"
                 style={{ borderColor: persona.color, color: persona.color, backgroundColor: persona.color + "20" }}>
              {persona.icon}
            </div>
            <div>
              <div className="text-sm font-bold tracking-widest" style={{ color: persona.color }}>
                {persona.name}
              </div>
              <div className="text-[10px] text-white/40">
                {formatTime(argument.timestamp)} • {argument.sentiment}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <span className={`px-2 py-1 rounded text-[10px] font-bold border ${getSentimentColor(argument.sentiment)}`}>
              {argument.sentiment}
            </span>
            <span className="text-[10px] text-white/40">
              CONF: {argument.confidence}%
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="text-base leading-relaxed font-mono text-white/90 min-h-[80px]">
          {displayedText}
          {isTyping && (
            <motion.span
              className="inline-block w-2 h-4 ml-1 align-middle"
              style={{ backgroundColor: persona.color }}
              animate={{ opacity: [1, 0] }}
              transition={{ duration: 0.5, repeat: Infinity }}
            />
          )}
        </div>

        {/* Keywords */}
        <div className="mt-4 flex flex-wrap gap-2">
          {argument.keywords.map((kw, i) => (
            <span key={i} className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[10px] text-white/60">
              #{kw}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

// --- Debate Metrics Radar Chart ---
const DebateRadarChart: React.FC<{ metrics: DebateMetrics }> = ({ metrics }) => {
  const data = [
    { subject: "Architect", A: metrics.architectInfluence, fullMark: 100 },
    { subject: "Adversary", A: metrics.adversaryInfluence, fullMark: 100 },
    { subject: "Arbiter", A: metrics.arbiterInfluence, fullMark: 100 },
    { subject: "Consensus", A: metrics.consensusLevel, fullMark: 100 },
    { subject: "Heat", A: metrics.heatLevel, fullMark: 100 },
    { subject: "Load", A: metrics.processingLoad, fullMark: 100 },
  ];

  return (
    <div className="w-full h-64 bg-black/40 border border-white/10 rounded-xl p-4 backdrop-blur-xl">
      <div className="text-xs font-bold text-white/60 tracking-widest mb-2">DEBATE METRICS</div>
      <RechartsResponsiveContainer width="100%" height="100%">
        <RechartsRadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
          <PolarGrid stroke="rgba(255,255,255,0.1)" />
          <PolarAngleAxis dataKey="subject" tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 10 }} />
          <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
          <RechartsRadar name="Influence" dataKey="A" stroke="#a855f7" fill="#a855f7" fillOpacity={0.3} />
        </RechartsRadarChart>
      </RechartsResponsiveContainer>
    </div>
  );
};

// --- Verdict Terminal ---
const VerdictTerminal: React.FC<{
  verdict: DebateSession["verdict"];
  isVisible: boolean;
}> = ({ verdict, isVisible }) => {
  if (!verdict || !isVisible) return null;

  const getVerdictColor = (type: VerdictType) => {
    switch (type) {
      case "APPROVE": return "text-green-400 border-green-500/50 bg-green-500/10";
      case "REJECT": return "text-red-400 border-red-500/50 bg-red-500/10";
      case "MODIFY": return "text-yellow-400 border-yellow-500/50 bg-yellow-500/10";
      case "RECURSE": return "text-blue-400 border-blue-500/50 bg-blue-500/10";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 50 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 100, damping: 15 }}
      className="w-full max-w-4xl mx-auto mt-8"
    >
      <div className={`p-8 rounded-2xl border-2 backdrop-blur-xl ${getVerdictColor(verdict.type)}`}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Scale className="w-10 h-10" />
            <div>
              <div className="text-3xl font-black tracking-[0.3em]">FINAL VERDICT</div>
              <div className="text-sm opacity-80">{formatTime(verdict.timestamp)}</div>
            </div>
          </div>
          <div className={`px-6 py-3 rounded-xl text-xl font-black tracking-widest border-2 ${getVerdictColor(verdict.type)}`}>
            {verdict.type}
          </div>
        </div>
        
        <div className="text-lg leading-relaxed font-mono border-t border-white/10 pt-6">
          {verdict.reasoning}
        </div>

        <div className="mt-6 flex items-center gap-4">
          <div className="flex-1 h-2 bg-black/50 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-current"
              initial={{ width: 0 }}
              animate={{ width: `${verdict.confidence}%` }}
              transition={{ duration: 2, delay: 0.5 }}
            />
          </div>
          <div className="text-sm font-bold">CONFIDENCE: {verdict.confidence}%</div>
        </div>
      </div>
    </motion.div>
  );
};

// ============================================================================
// MAIN COMPONENT — COUNCIL OF THREE
// ============================================================================

export default function CouncilOfThree() {
  const [currentScenario, setCurrentScenario] = useState<DebateScenario>(DEBATE_SCENARIOS[0]);
  const [session, setSession] = useState<DebateSession | null>(null);
  const [activePersona, setActivePersona] = useState<PersonaRole | null>(null);
  const [isAutoPlay, setIsAutoPlay] = useState(false);
  const [cinematicMode, setCinematicMode] = useState(false);
  const [debateHistory, setDebateHistory] = useState<DebateSession[]>([]);
  
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null);
  const nextPersonaRef = useRef<PersonaRole | null>(null);

  // Initialize a new debate session
  const startDebate = useCallback((scenario: DebateScenario) => {
    const newSession: DebateSession = {
      id: generateId(),
      topic: scenario.topic,
      phase: "PROPOSAL",
      arguments: [],
      metrics: {
        architectInfluence: 10,
        adversaryInfluence: 10,
        arbiterInfluence: 10,
        totalConfidence: 50,
        consensusLevel: 20,
        heatLevel: 10,
        processingLoad: 30,
      },
      startedAt: new Date(),
      isCinematicMode: cinematicMode,
    };
    setSession(newSession);
    setCurrentScenario(scenario);
    setIsAutoPlay(false);
  }, [cinematicMode]);

  // Simulate the debate progression
  useEffect(() => {
    if (!session || !isAutoPlay) return;

    const advanceDebate = () => {
      setSession(prev => {
        if (!prev) return null;
        
        const newArgs = [...prev.arguments];
        const newMetrics = { ...prev.metrics };
        let nextPhase = prev.phase;
        let nextPersona: PersonaRole | null = activePersona;

        // Phase Machine
        if (prev.phase === "PROPOSAL" && newArgs.length === 0) {
          // Architect speaks
          nextPersona = "ARCHITECT";
          newArgs.push({
            id: generateId(),
            personaId: "ARCHITECT",
            content: currentScenario.architectProposal,
            sentiment: "CONSTRUCTIVE",
            confidence: 85 + Math.random() * 10,
            timestamp: new Date(),
            duration: 3000,
            emotionalIntensity: 40,
            keywords: ["optimization", "efficiency", "growth", "stability"],
          });
          newMetrics.architectInfluence = 60;
          newMetrics.heatLevel = 30;
          nextPhase = "CRITIQUE";
        } 
        else if (prev.phase === "CRITIQUE" && newArgs.length === 1) {
          // Adversary speaks
          nextPersona = "ADVERSARY";
          newArgs.push({
            id: generateId(),
            personaId: "ADVERSARY",
            content: currentScenario.adversaryCritique,
            sentiment: "DESTRUCTIVE",
            confidence: 75 + Math.random() * 15,
            timestamp: new Date(),
            duration: 4000,
            emotionalIntensity: 80,
            keywords: ["risk", "vulnerability", "failure", "premature"],
            rebuttalTo: newArgs[0].id,
          });
          newMetrics.adversaryInfluence = 70;
          newMetrics.heatLevel = 80;
          newMetrics.consensusLevel = 10;
          nextPhase = "JUDGMENT";
        }
        else if (prev.phase === "JUDGMENT" && newArgs.length === 2) {
          // Arbiter speaks
          nextPersona = "ARBITER";
          newArgs.push({
            id: generateId(),
            personaId: "ARBITER",
            content: "Analyzing vectors... Weighing evidence... The Adversary raises valid concerns regarding system stability. However, the Architect's proposal aligns with core directives.",
            sentiment: "NEUTRAL",
            confidence: 95,
            timestamp: new Date(),
            duration: 5000,
            emotionalIntensity: 20,
            keywords: ["analysis", "synthesis", "balance", "directive"],
          });
          newMetrics.arbiterInfluence = 90;
          newMetrics.heatLevel = 40;
          newMetrics.consensusLevel = 60;
          nextPhase = "VERDICT";
        }
        else if (prev.phase === "VERDICT" && newArgs.length === 3) {
          // Final Verdict
          nextPersona = null;
          nextPhase = "IDLE";
          setIsAutoPlay(false);
          
          const completedSession: DebateSession = {
            ...prev,
            arguments: newArgs,
            metrics: newMetrics,
            phase: "IDLE",
            completedAt: new Date(),
            verdict: {
              type: currentScenario.verdictType,
              reasoning: currentScenario.arbiterVerdict,
              confidence: 90 + Math.random() * 10,
              timestamp: new Date(),
            }
          };
          
          nextPersonaRef.current = nextPersona;
          setDebateHistory(h => [completedSession, ...h]);
          return completedSession;
        }

        nextPersonaRef.current = nextPersona;
        return {
          ...prev,
          phase: nextPhase,
          arguments: newArgs,
          metrics: newMetrics,
        };
      });
      
      setActivePersona(nextPersonaRef.current);
    };

    // Timing for auto-play
    const delay = session.phase === "VERDICT" ? 2000 : 3000;
    autoPlayRef.current = setTimeout(advanceDebate, delay);

    return () => {
      if (autoPlayRef.current) clearTimeout(autoPlayRef.current);
    };
  }, [session, isAutoPlay, activePersona, currentScenario]);

  // Manual step through
  const handleNextStep = () => {
    setIsAutoPlay(false);
    // Trigger the same logic as auto-play but immediately
    // (Simplified for brevity, in production would extract the advanceDebate function)
  };

  return (
    <div className={`min-h-screen bg-black text-white font-mono overflow-hidden relative transition-all duration-1000 ${cinematicMode ? "scale-105" : ""}`}>
      
      {/* Cinematic Letterbox Bars */}
      <AnimatePresence>
        {cinematicMode && (
          <>
            <motion.div initial={{ height: 0 }} animate={{ height: "10vh" }} exit={{ height: 0 }} className="absolute top-0 left-0 right-0 bg-black z-50" />
            <motion.div initial={{ height: 0 }} animate={{ height: "10vh" }} exit={{ height: 0 }} className="absolute bottom-0 left-0 right-0 bg-black z-50" />
          </>
        )}
      </AnimatePresence>

      {/* Background Grid & Particles */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(168,85,247,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(168,85,247,0.03)_1px,transparent_1px)] bg-[size:60px_60px]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,black_100%)]" />

      <div className="relative z-10 p-8 max-w-7xl mx-auto">
        
        {/* Header Controls */}
        <motion.header 
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex items-center justify-between mb-12"
        >
          <div className="flex items-center gap-4">
            <Scale className="w-8 h-8 text-purple-500" />
            <div>
              <h1 className="text-3xl font-black tracking-[0.3em] text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-500 to-red-500">
                COUNCIL OF THREE
              </h1>
              <p className="text-xs text-white/40 tracking-widest">ADVERSARIAL INTELLIGENCE PROTOCOL • PHASE 8</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setCinematicMode(!cinematicMode)}
              className={`px-4 py-2 rounded-lg text-xs font-bold tracking-widest border transition-all ${
                cinematicMode ? "bg-purple-600/20 border-purple-500/50 text-purple-400" : "bg-white/5 border-white/10 text-white/60"
              }`}
            >
              {cinematicMode ? "EXIT CINEMATIC" : "CINEMATIC MODE"}
            </button>
            <button
              onClick={() => setIsAutoPlay(!isAutoPlay)}
              className={`px-6 py-2 rounded-lg text-xs font-bold tracking-widest border transition-all flex items-center gap-2 ${
                isAutoPlay ? "bg-red-600/20 border-red-500/50 text-red-400" : "bg-green-600/20 border-green-500/50 text-green-400"
              }`}
            >
              {isAutoPlay ? <><Pause className="w-4 h-4" /> PAUSE DEBATE</> : <><Play className="w-4 h-4" /> AUTO-PLAY DEBATE</>}
            </button>
          </div>
        </motion.header>

        {/* Scenario Selector */}
        <div className="mb-12">
          <div className="text-xs text-white/40 tracking-widest mb-4">SELECT DEBATE SCENARIO</div>
          <div className="grid grid-cols-3 gap-4">
            {DEBATE_SCENARIOS.map((scenario) => (
              <motion.button
                key={scenario.id}
                onClick={() => startDebate(scenario)}
                whileHover={{ scale: 1.02, y: -5 }}
                whileTap={{ scale: 0.98 }}
                className={`p-6 rounded-xl border backdrop-blur-xl text-left transition-all ${
                  currentScenario.id === scenario.id
                    ? "bg-purple-600/10 border-purple-500/50 shadow-[0_0_30px_rgba(168,85,247,0.2)]"
                    : "bg-black/40 border-white/10 hover:border-white/30"
                }`}
              >
                <div className="text-sm font-bold text-white mb-2">{scenario.topic}</div>
                <div className="text-[10px] text-white/40">Difficulty: {scenario.difficulty}/10</div>
              </motion.button>
            ))}
          </div>
        </div>

        {/* The Stage */}
        <div className="relative mb-12">
          {/* Connecting Lines (SVG) */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
            <motion.line
              x1="20%" y1="50%" x2="80%" y2="50%"
              stroke="rgba(168,85,247,0.2)" strokeWidth="2" strokeDasharray="10 10"
              animate={{ strokeDashoffset: [0, 20] }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
            <motion.line
              x1="50%" y1="10%" x2="20%" y2="80%"
              stroke="rgba(6,182,212,0.2)" strokeWidth="2" strokeDasharray="10 10"
              animate={{ strokeDashoffset: [0, 20] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            />
            <motion.line
              x1="50%" y1="10%" x2="80%" y2="80%"
              stroke="rgba(239,68,68,0.2)" strokeWidth="2" strokeDasharray="10 10"
              animate={{ strokeDashoffset: [0, 20] }}
              transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
            />
          </svg>

          {/* Avatars */}
          <div className="grid grid-cols-3 gap-8 relative z-10">
            {PERSONAS.map((persona) => (
              <HolographicAvatar
                key={persona.id}
                persona={persona}
                isActive={activePersona === persona.id}
                isSpeaking={activePersona === persona.id && isAutoPlay}
                confidence={session?.metrics[`${persona.id.toLowerCase()}Influence` as keyof DebateMetrics] as number || 10}
              />
            ))}
          </div>
        </div>

        {/* Argument Stream */}
        <div className="relative min-h-[300px] mb-12">
          <AnimatePresence mode="popLayout">
            {session?.arguments.map((arg, index) => (
              <ArgumentStream
                key={arg.id}
                argument={arg}
                isTyping={isAutoPlay && index === session.arguments.length - 1}
              />
            ))}
          </AnimatePresence>
          
          {session?.arguments.length === 0 && (
            <div className="flex flex-col items-center justify-center h-64 text-white/20">
              <Scale className="w-16 h-16 mb-4 opacity-50" />
              <p className="tracking-widest">AWAITING DEBATE INITIATION</p>
            </div>
          )}
        </div>

        {/* Verdict & Metrics */}
        <div className="grid grid-cols-2 gap-8">
          <DebateRadarChart metrics={session?.metrics || {
            architectInfluence: 10, adversaryInfluence: 10, arbiterInfluence: 10,
            totalConfidence: 50, consensusLevel: 20, heatLevel: 10, processingLoad: 30
          }} />
          
          <div className="bg-black/40 border border-white/10 rounded-xl p-6 backdrop-blur-xl">
            <div className="text-xs font-bold text-white/60 tracking-widest mb-4">SESSION LOG</div>
            <div className="space-y-2 max-h-64 overflow-y-auto font-mono text-xs">
              {debateHistory.map((hist) => (
                <div key={hist.id} className="p-3 bg-white/5 rounded border border-white/10">
                  <div className="flex justify-between mb-1">
                    <span className="text-white/80">{hist.topic}</span>
                    <span className={`font-bold ${
                      hist.verdict?.type === "APPROVE" ? "text-green-400" :
                      hist.verdict?.type === "REJECT" ? "text-red-400" :
                      hist.verdict?.type === "MODIFY" ? "text-yellow-400" : "text-blue-400"
                    }`}>{hist.verdict?.type}</span>
                  </div>
                  <div className="text-white/40 text-[10px]">{formatTime(hist.completedAt || hist.startedAt)}</div>
                </div>
              ))}
              {debateHistory.length === 0 && (
                <div className="text-white/20 text-center py-8">NO COMPLETED SESSIONS</div>
              )}
            </div>
          </div>
        </div>

        {/* Final Verdict Display */}
        <VerdictTerminal verdict={session?.verdict} isVisible={session?.phase === "IDLE" && !!session?.verdict} />

      </div>
    </div>
  );
}