"use client";
import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { motion, AnimatePresence, useAnimation, useMotionValue, useTransform } from "framer-motion";
import {
  Mic, MicOff, Volume2, VolumeX, Waveform, AudioWaveform,
  Play, Pause, StopCircle, SkipForward, SkipBack,
  Repeat, Shuffle, Headphones, Radio, Podcast,
  Activity, Zap, Cpu, Brain, Network, Signal,
  Settings, Filter, Sliders, Equalizer,
  ChevronDown, ChevronUp, Maximize2, Minimize2,
  AlertCircle, CheckCircle, XCircle, Info,
  Clock, Timer, History, TrendingUp,
  Download, Upload, Save, Share2,
  Brain as BrainIcon, Cpu as CpuIcon,
  Activity as ActivityIcon, Zap as ZapIcon,
} from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, AreaChart, Area, BarChart, Bar,
  ComposedChart, ReferenceLine, Legend,
} from "recharts";

// ============================================================================
// TYPE DEFINITIONS — VOICE INTERFACE DATA STRUCTURES
// ============================================================================

type VoiceState = "IDLE" | "LISTENING" | "PROCESSING" | "SPEAKING" | "ERROR";
type VisualizationMode = "TACET" | "WAVEFORM" | "SPECTRUM" | "CIRCULAR" | "PARTICLES";
type VoiceCommandCategory = "SYSTEM" | "NAVIGATION" | "QUERY" | "CONTROL" | "CREATIVE";

interface AudioData {
  timestamp: number;
  amplitude: number;
  frequency: number;
  energy: number;
  zeroCrossingRate: number;
  spectralCentroid: number;
  rms: number;
}

interface VoiceCommand {
  id: string;
  text: string;
  category: VoiceCommandCategory;
  confidence: number;
  timestamp: Date;
  executed: boolean;
  response?: string;
}

interface TacetPoint {
  x: number;
  y: number;
  intensity: number;
  phase: number;
  frequency: number;
}

interface VoiceMetrics {
  averageAmplitude: number;
  peakAmplitude: number;
  totalListeningTime: number;
  commandsExecuted: number;
  recognitionAccuracy: number;
  responseTime: number;
  activeSessionDuration: number;
}

interface VoiceProfile {
  id: string;
  name: string;
  voiceId: string;
  language: string;
  accent: string;
  pitch: number;
  speed: number;
  volume: number;
  wakeWord: string;
  sensitivity: number;
}

// ============================================================================
// CONSTANTS & CONFIGURATION
// ============================================================================

const TACET_COLORS = {
  primary: "#06b6d4",
  secondary: "#a855f7",
  accent: "#ec4899",
  glow: "rgba(6, 182, 212, 0.6)",
  secondaryGlow: "rgba(168, 85, 247, 0.4)",
};

const VOICE_COMMANDS: Record<string, { category: VoiceCommandCategory; action: string }> = {
  "jarvis activate": { category: "SYSTEM", action: "ACTIVATE" },
  "jarvis deactivate": { category: "SYSTEM", action: "DEACTIVATE" },
  "show dashboard": { category: "NAVIGATION", action: "NAVIGATE_DASHBOARD" },
  "open trading": { category: "NAVIGATION", action: "NAVIGATE_TRADING" },
  "show security": { category: "NAVIGATION", action: "NAVIGATE_SECURITY" },
  "what is the time": { category: "QUERY", action: "QUERY_TIME" },
  "system status": { category: "QUERY", action: "QUERY_STATUS" },
  "increase volume": { category: "CONTROL", action: "CONTROL_VOLUME_UP" },
  "decrease volume": { category: "CONTROL", action: "CONTROL_VOLUME_DOWN" },
  "mute": { category: "CONTROL", action: "CONTROL_MUTE" },
  "unmute": { category: "CONTROL", action: "CONTROL_UNMUTE" },
  "start recording": { category: "CONTROL", action: "CONTROL_RECORD_START" },
  "stop recording": { category: "CONTROL", action: "CONTROL_RECORD_STOP" },
  "create new task": { category: "CREATIVE", action: "CREATE_TASK" },
  "generate report": { category: "CREATIVE", action: "GENERATE_REPORT" },
};

// ============================================================================
// UTILITY FUNCTIONS — AUDIO PROCESSING
// ============================================================================

const generateTacetPoints = (audioData: AudioData[], width: number, height: number): TacetPoint[] => {
  const points: TacetPoint[] = [];
  const centerX = width / 2;
  const centerY = height / 2;
  
  audioData.forEach((data, index) => {
    const angle = (index / audioData.length) * Math.PI * 2;
    const radius = 50 + (data.amplitude * 150);
    const x = centerX + Math.cos(angle) * radius;
    const y = centerY + Math.sin(angle) * radius * 0.6;
    
    points.push({
      x,
      y,
      intensity: data.amplitude,
      phase: angle,
      frequency: data.frequency,
    });
  });
  
  return points;
};

const calculateAudioMetrics = (data: AudioData[]): VoiceMetrics => {
  if (data.length === 0) {
    return {
      averageAmplitude: 0,
      peakAmplitude: 0,
      totalListeningTime: 0,
      commandsExecuted: 0,
      recognitionAccuracy: 0,
      responseTime: 0,
      activeSessionDuration: 0,
    };
  }
  
  const amplitudes = data.map(d => d.amplitude);
  const averageAmplitude = amplitudes.reduce((a, b) => a + b, 0) / amplitudes.length;
  const peakAmplitude = Math.max(...amplitudes);
  
  return {
    averageAmplitude,
    peakAmplitude,
    totalListeningTime: data.length * 0.1,
    commandsExecuted: Math.floor(data.length / 100),
    recognitionAccuracy: 85 + Math.random() * 15,
    responseTime: 200 + Math.random() * 300,
    activeSessionDuration: data.length * 0.1,
  };
};

const processVoiceCommand = (text: string): VoiceCommand => {
  const lowerText = text.toLowerCase().trim();
  let matchedCommand = VOICE_COMMANDS[lowerText];
  
  if (!matchedCommand) {
    for (const [key, value] of Object.entries(VOICE_COMMANDS)) {
      if (lowerText.includes(key)) {
        matchedCommand = value;
        break;
      }
    }
  }
  
  return {
    id: `cmd_${Date.now()}`,
    text,
    category: matchedCommand?.category || "QUERY",
    confidence: matchedCommand ? 0.85 + Math.random() * 0.15 : 0.3 + Math.random() * 0.4,
    timestamp: new Date(),
    executed: !!matchedCommand,
    response: matchedCommand 
      ? `Executing ${matchedCommand.action}...` 
      : `Command not recognized: "${text}"`,
  };
};

// ============================================================================
// SUB-COMPONENTS — WUWA TACET MARK VISUALIZATION
// ============================================================================

// --- Tacet Mark Core Component ---
const TacetMarkCore: React.FC<{
  audioData: AudioData[];
  width: number;
  height: number;
  isActive: boolean;
}> = ({ audioData, width, height, isActive }) => {
  const tacetPoints = useMemo(() => 
    generateTacetPoints(audioData, width, height),
    [audioData, width, height]
  );
  
  const centerX = width / 2;
  const centerY = height / 2;
  
  return (
    <svg width={width} height={height} className="absolute inset-0">
      <defs>
        <radialGradient id="tacetGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={TACET_COLORS.glow} stopOpacity="0.8" />
          <stop offset="100%" stopColor={TACET_COLORS.glow} stopOpacity="0" />
        </radialGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      
      {/* Outer Ring */}
      <motion.circle
        cx={centerX}
        cy={centerY}
        r="180"
        fill="none"
        stroke={TACET_COLORS.primary}
        strokeWidth="1"
        strokeOpacity="0.3"
        animate={{
          scale: isActive ? [1, 1.05, 1] : 1,
          opacity: isActive ? [0.3, 0.6, 0.3] : 0.3,
        }}
        transition={{ duration: 2, repeat: Infinity }}
      />
      
      {/* Middle Ring */}
      <motion.circle
        cx={centerX}
        cy={centerY}
        r="140"
        fill="none"
        stroke={TACET_COLORS.secondary}
        strokeWidth="1.5"
        strokeOpacity="0.5"
        animate={{
          rotate: isActive ? 360 : 0,
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        style={{ transformOrigin: `${centerX}px ${centerY}px` }}
      />
      
      {/* Inner Ring */}
      <motion.circle
        cx={centerX}
        cy={centerY}
        r="100"
        fill="none"
        stroke={TACET_COLORS.accent}
        strokeWidth="2"
        strokeOpacity="0.7"
        animate={{
          scale: isActive ? [1, 1.1, 1] : 1,
        }}
        transition={{ duration: 1.5, repeat: Infinity }}
      />
      
      {/* Tacet Waveform Points */}
      {tacetPoints.map((point, index) => {
        const nextPoint = tacetPoints[(index + 1) % tacetPoints.length];
        const prevPoint = tacetPoints[(index - 1 + tacetPoints.length) % tacetPoints.length];
        
        return (
          <g key={index}>
            {/* Connection Lines */}
            <motion.line
              x1={prevPoint.x}
              y1={prevPoint.y}
              x2={point.x}
              y2={point.y}
              stroke={TACET_COLORS.primary}
              strokeWidth={point.intensity * 2}
              strokeOpacity={point.intensity * 0.8}
              filter="url(#glow)"
              animate={{
                strokeWidth: [point.intensity * 1.5, point.intensity * 2.5, point.intensity * 1.5],
              }}
              transition={{ duration: 0.5, repeat: Infinity }}
            />
            
            {/* Symmetric Connection */}
            <motion.line
              x1={centerX + (centerX - prevPoint.x)}
              y1={centerY + (centerY - prevPoint.y)}
              x2={centerX + (centerX - point.x)}
              y2={centerY + (centerY - point.y)}
              stroke={TACET_COLORS.secondary}
              strokeWidth={point.intensity * 1.5}
              strokeOpacity={point.intensity * 0.6}
              filter="url(#glow)"
              animate={{
                strokeWidth: [point.intensity * 1, point.intensity * 2, point.intensity * 1],
              }}
              transition={{ duration: 0.5, repeat: Infinity, delay: 0.1 }}
            />
            
            {/* Core Points */}
            <motion.circle
              cx={point.x}
              cy={point.y}
              r={point.intensity * 4}
              fill={TACET_COLORS.primary}
              opacity={point.intensity}
              filter="url(#glow)"
              animate={{
                r: [point.intensity * 3, point.intensity * 5, point.intensity * 3],
              }}
              transition={{ duration: 0.3, repeat: Infinity }}
            />
            
            {/* Symmetric Points */}
            <motion.circle
              cx={centerX + (centerX - point.x)}
              cy={centerY + (centerY - point.y)}
              r={point.intensity * 3}
              fill={TACET_COLORS.secondary}
              opacity={point.intensity * 0.8}
              filter="url(#glow)"
              animate={{
                r: [point.intensity * 2, point.intensity * 4, point.intensity * 2],
              }}
              transition={{ duration: 0.3, repeat: Infinity, delay: 0.05 }}
            />
          </g>
        );
      })}
      
      {/* Center Core */}
      <motion.circle
        cx={centerX}
        cy={centerY}
        r="30"
        fill="url(#tacetGlow)"
        animate={{
          scale: isActive ? [1, 1.3, 1] : 1,
          opacity: isActive ? [0.5, 1, 0.5] : 0.5,
        }}
        transition={{ duration: 1, repeat: Infinity }}
      />
      
      {/* Center Dot */}
      <circle
        cx={centerX}
        cy={centerY}
        r="8"
        fill={TACET_COLORS.primary}
        filter="url(#glow)"
      />
    </svg>
  );
};

// --- Waveform Visualization ---
const WaveformVisualization: React.FC<{
  audioData: AudioData[];
  width: number;
  height: number;
}> = ({ audioData, width, height }) => {
  const centerY = height / 2;
  
  return (
    <svg width={width} height={height} className="absolute inset-0">
      <defs>
        <linearGradient id="waveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={TACET_COLORS.primary} stopOpacity="0.8" />
          <stop offset="50%" stopColor={TACET_COLORS.secondary} stopOpacity="0.8" />
          <stop offset="100%" stopColor={TACET_COLORS.accent} stopOpacity="0.8" />
        </linearGradient>
      </defs>
      
      {/* Upper Waveform */}
      <motion.path
        d={audioData.map((data, i) => {
          const x = (i / audioData.length) * width;
          const y = centerY - (data.amplitude * height * 0.4);
          return `${i === 0 ? "M" : "L"} ${x} ${y}`;
        }).join(" ")}
        fill="none"
        stroke="url(#waveGradient)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        animate={{
          opacity: [0.6, 1, 0.6],
        }}
        transition={{ duration: 1, repeat: Infinity }}
      />
      
      {/* Lower Waveform (Symmetric) */}
      <motion.path
        d={audioData.map((data, i) => {
          const x = (i / audioData.length) * width;
          const y = centerY + (data.amplitude * height * 0.4);
          return `${i === 0 ? "M" : "L"} ${x} ${y}`;
        }).join(" ")}
        fill="none"
        stroke="url(#waveGradient)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        animate={{
          opacity: [0.6, 1, 0.6],
        }}
        transition={{ duration: 1, repeat: Infinity, delay: 0.1 }}
      />
      
      {/* Fill Area */}
      <motion.path
        d={`${audioData.map((data, i) => {
          const x = (i / audioData.length) * width;
          const y = centerY - (data.amplitude * height * 0.4);
          return `${i === 0 ? "M" : "L"} ${x} ${y}`;
        }).join(" ")} L ${width} ${centerY} L 0 ${centerY} Z`}
        fill="url(#waveGradient)"
        opacity="0.2"
      />
    </svg>
  );
};

// --- Spectrum Analyzer ---
const SpectrumAnalyzer: React.FC<{
  audioData: AudioData[];
  width: number;
  height: number;
}> = ({ audioData, width, height }) => {
  const barCount = 64;
  const barWidth = width / barCount;
  
  return (
    <svg width={width} height={height} className="absolute inset-0">
      {Array.from({ length: barCount }).map((_, i) => {
        const dataIndex = Math.floor((i / barCount) * audioData.length);
        const data = audioData[dataIndex] || { amplitude: 0, frequency: 0 };
        const barHeight = data.amplitude * height * 0.8;
        const x = i * barWidth;
        const y = height - barHeight;
        
        const hue = 180 + (i / barCount) * 120;
        const color = `hsl(${hue}, 100%, 50%)`;
        
        return (
          <motion.rect
            key={i}
            x={x + 1}
            y={y}
            width={barWidth - 2}
            height={barHeight}
            fill={color}
            opacity="0.8"
            animate={{
              height: [barHeight * 0.8, barHeight, barHeight * 0.8],
            }}
            transition={{ duration: 0.2, repeat: Infinity }}
          />
        );
      })}
    </svg>
  );
};

// --- Circular Visualization ---
const CircularVisualization: React.FC<{
  audioData: AudioData[];
  width: number;
  height: number;
}> = ({ audioData, width, height }) => {
  const centerX = width / 2;
  const centerY = height / 2;
  const radius = Math.min(width, height) / 3;
  
  return (
    <svg width={width} height={height} className="absolute inset-0">
      {audioData.slice(0, 128).map((data, i) => {
        const angle = (i / 128) * Math.PI * 2;
        const r = radius + (data.amplitude * 100);
        const x = centerX + Math.cos(angle) * r;
        const y = centerY + Math.sin(angle) * r;
        
        const hue = (i / 128) * 360;
        const color = `hsl(${hue}, 100%, 60%)`;
        
        return (
          <motion.circle
            key={i}
            cx={x}
            cy={y}
            r={data.amplitude * 5}
            fill={color}
            opacity={data.amplitude}
            animate={{
              r: [data.amplitude * 4, data.amplitude * 6, data.amplitude * 4],
            }}
            transition={{ duration: 0.3, repeat: Infinity }}
          />
        );
      })}
    </svg>
  );
};

// --- Particle System ---
const ParticleVisualization: React.FC<{
  audioData: AudioData[];
  width: number;
  height: number;
  isActive: boolean;
}> = ({ audioData, width, height, isActive }) => {
  const [particles, setParticles] = useState<Array<{
    id: number;
    x: number;
    y: number;
    vx: number;
    vy: number;
    life: number;
    maxLife: number;
    size: number;
    color: string;
    amplitude: number;
  }>>([]);
  
  useEffect(() => {
    if (!isActive) return;
    
    const interval = setInterval(() => {
      const avgAmplitude = audioData.reduce((sum, d) => sum + d.amplitude, 0) / audioData.length;
      
      if (avgAmplitude > 0.3) {
        const newParticles = Array.from({ length: Math.floor(avgAmplitude * 10) }, () => ({
          id: Date.now() + Math.random(),
          x: width / 2,
          y: height / 2,
          vx: (Math.random() - 0.5) * avgAmplitude * 10,
          vy: (Math.random() - 0.5) * avgAmplitude * 10,
          life: 0,
          maxLife: 100 + Math.random() * 100,
          size: 2 + avgAmplitude * 8,
          color: `hsl(${180 + Math.random() * 120}, 100%, 60%)`,
          amplitude: avgAmplitude,
        }));
        
        setParticles(prev => [...prev.slice(-100), ...newParticles]);
      }
    }, 50);
    
    return () => clearInterval(interval);
  }, [audioData, width, height, isActive]);
  
  useEffect(() => {
    if (!isActive) return;
    
    const interval = setInterval(() => {
      setParticles(prev =>
        prev
          .map(p => ({
            ...p,
            x: p.x + p.vx,
            y: p.y + p.vy,
            life: p.life + 1,
          }))
          .filter(p => p.life < p.maxLife)
      );
    }, 16);
    
    return () => clearInterval(interval);
  }, [isActive]);
  
  return (
    <svg width={width} height={height} className="absolute inset-0">
      {particles.map(particle => (
        <motion.circle
          key={particle.id}
          cx={particle.x}
          cy={particle.y}
          r={particle.size * (1 - particle.life / particle.maxLife)}
          fill={particle.color}
          opacity={particle.amplitude * (1 - particle.life / particle.maxLife)}
        />
      ))}
    </svg>
  );
};

// ============================================================================
// MAIN VOICE INTERFACE COMPONENT
// ============================================================================

export default function VoiceInterface() {
  const [voiceState, setVoiceState] = useState<VoiceState>("IDLE");
  const [visualizationMode, setVisualizationMode] = useState<VisualizationMode>("TACET");
  const [audioData, setAudioData] = useState<AudioData[]>([]);
  const [commands, setCommands] = useState<VoiceCommand[]>([]);
  const [metrics, setMetrics] = useState<VoiceMetrics>({
    averageAmplitude: 0,
    peakAmplitude: 0,
    totalListeningTime: 0,
    commandsExecuted: 0,
    recognitionAccuracy: 0,
    responseTime: 0,
    activeSessionDuration: 0,
  });
  const [isListening, setIsListening] = useState(false);
  const [volume, setVolume] = useState(80);
  const [sensitivity, setSensitivity] = useState(70);
  const [showSettings, setShowSettings] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [currentTranscript, setCurrentTranscript] = useState("");
  const [lastCommand, setLastCommand] = useState<VoiceCommand | null>(null);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  
  // Initialize audio context
  const initializeAudio = useCallback(async () => {
    try {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 2048;
      analyserRef.current.smoothingTimeConstant = 0.8;
      
      mediaStreamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
      const source = audioContextRef.current.createMediaStreamSource(mediaStreamRef.current);
      source.connect(analyserRef.current);
      
      return true;
    } catch (error) {
      console.error("Failed to initialize audio:", error);
      return false;
    }
  }, []);
  
  // Process audio data
  const processAudioData = useCallback(() => {
    if (!analyserRef.current) return;
    
    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyserRef.current.getByteTimeDomainData(dataArray);
    
    const rms = Math.sqrt(
      dataArray.reduce((sum, value) => sum + Math.pow((value - 128) / 128, 2), 0) / bufferLength
    );
    
    const newAudioData: AudioData = {
      timestamp: Date.now(),
      amplitude: Math.min(rms * (sensitivity / 50), 1),
      frequency: dataArray.reduce((sum, val, i) => sum + val * i, 0) / bufferLength / 255,
      energy: dataArray.reduce((sum, val) => sum + val, 0) / bufferLength / 255,
      zeroCrossingRate: dataArray.filter((val, i, arr) => 
        i > 0 && ((val - 128) * (arr[i - 1] - 128) < 0)
      ).length / bufferLength,
      spectralCentroid: dataArray.reduce((sum, val, i) => sum + val * i, 0) / bufferLength,
      rms,
    };
    
    setAudioData(prev => [...prev.slice(-100), newAudioData]);
    setMetrics(prev => ({
      ...prev,
      averageAmplitude: (prev.averageAmplitude * 0.9) + (newAudioData.amplitude * 0.1),
      peakAmplitude: Math.max(prev.peakAmplitude, newAudioData.amplitude),
    }));
    
    animationRef.current = requestAnimationFrame(processAudioData);
  }, [sensitivity]);
  
  // Start listening
  const startListening = useCallback(async () => {
    if (voiceState !== "IDLE") return;
    
    const initialized = await initializeAudio();
    if (!initialized) {
      setVoiceState("ERROR");
      return;
    }
    
    setVoiceState("LISTENING");
    setIsListening(true);
    processAudioData();
    
    // Simulate speech recognition
    setTimeout(() => {
      const transcripts = [
        "Show me the trading dashboard",
        "What is the current system status",
        "Increase volume to maximum",
        "Create a new task for tomorrow",
        "Open security dashboard",
      ];
      const randomTranscript = transcripts[Math.floor(Math.random() * transcripts.length)];
      setCurrentTranscript(randomTranscript);
      
      const command = processVoiceCommand(randomTranscript);
      setLastCommand(command);
      setCommands(prev => [command, ...prev].slice(0, 50));
      setVoiceState("PROCESSING");
      
      setTimeout(() => {
        setVoiceState("SPEAKING");
        setTimeout(() => {
          setVoiceState("IDLE");
          setIsListening(false);
          setCurrentTranscript("");
          if (animationRef.current) {
            cancelAnimationFrame(animationRef.current);
          }
        }, 2000);
      }, 1500);
    }, 3000 + Math.random() * 2000);
  }, [voiceState, initializeAudio, processAudioData]);
  
  // Stop listening
  const stopListening = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
    
    setVoiceState("IDLE");
    setIsListening(false);
    setAudioData([]);
  }, []);
  
  // Toggle listening
  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);
  
  // Update metrics
  useEffect(() => {
    setMetrics(calculateAudioMetrics(audioData));
  }, [audioData]);
  
  // Cleanup
  useEffect(() => {
    return () => {
      stopListening();
    };
  }, [stopListening]);
  
  const renderVisualization = () => {
    const width = 800;
    const height = 400;
    
    switch (visualizationMode) {
      case "TACET":
        return <TacetMarkCore audioData={audioData} width={width} height={height} isActive={isListening} />;
      case "WAVEFORM":
        return <WaveformVisualization audioData={audioData} width={width} height={height} />;
      case "SPECTRUM":
        return <SpectrumAnalyzer audioData={audioData} width={width} height={height} />;
      case "CIRCULAR":
        return <CircularVisualization audioData={audioData} width={width} height={height} />;
      case "PARTICLES":
        return <ParticleVisualization audioData={audioData} width={width} height={height} isActive={isListening} />;
      default:
        return <TacetMarkCore audioData={audioData} width={width} height={height} isActive={isListening} />;
    }
  };
  
  const getStateColor = () => {
    switch (voiceState) {
      case "LISTENING": return "text-cyan-400";
      case "PROCESSING": return "text-purple-400";
      case "SPEAKING": return "text-green-400";
      case "ERROR": return "text-red-400";
      default: return "text-white/60";
    }
  };
  
  const getStateText = () => {
    switch (voiceState) {
      case "LISTENING": return "LISTENING";
      case "PROCESSING": return "PROCESSING";
      case "SPEAKING": return "SPEAKING";
      case "ERROR": return "ERROR";
      default: return "READY";
    }
  };
  
  return (
    <div className="min-h-screen bg-black text-white p-6">
      {/* Header */}
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="max-w-7xl mx-auto mb-8"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-cyan-500/30">
              <Mic className="w-8 h-8 text-cyan-400" />
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-[0.3em] text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500">
                VOICE INTERFACE
              </h1>
              <p className="text-xs text-white/40 tracking-widest mt-1">
                WUWA TACET MARK SYSTEM • PART 10
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className={`px-4 py-2 rounded-xl border ${getStateColor()} bg-black/40 backdrop-blur-xl`}>
              <div className="text-xs tracking-widest">{getStateText()}</div>
            </div>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
            >
              <Settings className="w-5 h-5" />
            </button>
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
            >
              <History className="w-5 h-5" />
            </button>
          </div>
        </div>
      </motion.div>
      
      {/* Main Visualization Area */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="relative bg-black/40 border border-white/10 rounded-3xl overflow-hidden backdrop-blur-xl" style={{ height: "500px" }}>
          {/* Visualization */}
          <div className="absolute inset-0 flex items-center justify-center">
            {renderVisualization()}
          </div>
          
          {/* Center Control */}
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.button
              onClick={toggleListening}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`relative w-32 h-32 rounded-full flex items-center justify-center transition-all ${
                isListening
                  ? "bg-gradient-to-br from-red-500 to-red-700 shadow-[0_0_60px_rgba(239,68,68,0.6)] animate-pulse"
                  : "bg-gradient-to-br from-cyan-500 to-purple-600 shadow-[0_0_40px_rgba(6,182,212,0.4)]"
              }`}
            >
              {isListening ? <MicOff className="w-12 h-12 text-white" /> : <Mic className="w-12 h-12 text-white" />}
            </motion.button>
          </div>
          
          {/* Mode Selector */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
            {(["TACET", "WAVEFORM", "SPECTRUM", "CIRCULAR", "PARTICLES"] as VisualizationMode[]).map(mode => (
              <button
                key={mode}
                onClick={() => setVisualizationMode(mode)}
                className={`px-4 py-2 rounded-xl text-xs font-bold tracking-widest transition-all ${
                  visualizationMode === mode
                    ? "bg-cyan-500/20 border border-cyan-500/50 text-cyan-400"
                    : "bg-black/40 border border-white/10 text-white/60 hover:border-white/30"
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>
      </div>
      
      {/* Transcript & Command Display */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="grid grid-cols-2 gap-6">
          {/* Current Transcript */}
          <div className="bg-black/40 border border-white/10 rounded-2xl p-6 backdrop-blur-xl">
            <div className="flex items-center gap-3 mb-4">
              <Activity className="w-5 h-5 text-cyan-400" />
              <h3 className="text-sm font-bold tracking-widest">CURRENT TRANSCRIPT</h3>
            </div>
            <div className="text-lg text-white/80 font-mono min-h-[60px]">
              {currentTranscript || "Waiting for voice input..."}
            </div>
          </div>
          
          {/* Last Command */}
          <div className="bg-black/40 border border-white/10 rounded-2xl p-6 backdrop-blur-xl">
            <div className="flex items-center gap-3 mb-4">
              <Zap className="w-5 h-5 text-purple-400" />
              <h3 className="text-sm font-bold tracking-widest">LAST COMMAND</h3>
            </div>
            {lastCommand ? (
              <div>
                <div className="text-lg text-white/80 font-mono mb-2">{lastCommand.text}</div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-1 rounded ${
                    lastCommand.executed ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
                  }`}>
                    {lastCommand.executed ? "EXECUTED" : "FAILED"}
                  </span>
                  <span className="text-xs text-white/40">Confidence: {(lastCommand.confidence * 100).toFixed(0)}%</span>
                </div>
              </div>
            ) : (
              <div className="text-white/40">No commands executed yet</div>
            )}
          </div>
        </div>
      </div>
      
      {/* Metrics & Controls */}
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-3 gap-6">
          {/* Metrics */}
          <div className="bg-black/40 border border-white/10 rounded-2xl p-6 backdrop-blur-xl">
            <div className="flex items-center gap-3 mb-4">
              <BrainIcon className="w-5 h-5 text-green-400" />
              <h3 className="text-sm font-bold tracking-widest">VOICE METRICS</h3>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-xs text-white/60">Avg Amplitude</span>
                <span className="text-xs font-bold text-cyan-400">{(metrics.averageAmplitude * 100).toFixed(1)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-white/60">Peak Amplitude</span>
                <span className="text-xs font-bold text-purple-400">{(metrics.peakAmplitude * 100).toFixed(1)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-white/60">Listening Time</span>
                <span className="text-xs font-bold text-green-400">{metrics.totalListeningTime.toFixed(1)}s</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-white/60">Commands</span>
                <span className="text-xs font-bold text-yellow-400">{metrics.commandsExecuted}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-white/60">Accuracy</span>
                <span className="text-xs font-bold text-pink-400">{metrics.recognitionAccuracy.toFixed(1)}%</span>
              </div>
            </div>
          </div>
          
          {/* Volume & Sensitivity */}
          <div className="bg-black/40 border border-white/10 rounded-2xl p-6 backdrop-blur-xl">
            <div className="flex items-center gap-3 mb-4">
              <Sliders className="w-5 h-5 text-yellow-400" />
              <h3 className="text-sm font-bold tracking-widest">AUDIO CONTROLS</h3>
            </div>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-xs text-white/60">Volume</span>
                  <span className="text-xs font-bold text-yellow-400">{volume}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={volume}
                  onChange={(e) => setVolume(parseInt(e.target.value))}
                  className="w-full h-2 bg-black/50 rounded-full appearance-none cursor-pointer accent-yellow-500"
                />
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-xs text-white/60">Sensitivity</span>
                  <span className="text-xs font-bold text-cyan-400">{sensitivity}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={sensitivity}
                  onChange={(e) => setSensitivity(parseInt(e.target.value))}
                  className="w-full h-2 bg-black/50 rounded-full appearance-none cursor-pointer accent-cyan-500"
                />
              </div>
            </div>
          </div>
          
          {/* Quick Stats */}
          <div className="bg-black/40 border border-white/10 rounded-2xl p-6 backdrop-blur-xl">
            <div className="flex items-center gap-3 mb-4">
              <CpuIcon className="w-5 h-5 text-pink-400" />
              <h3 className="text-sm font-bold tracking-widest">SYSTEM STATUS</h3>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-xs text-white/60">Response Time</span>
                <span className="text-xs font-bold text-green-400">{metrics.responseTime.toFixed(0)}ms</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-white/60">Session Duration</span>
                <span className="text-xs font-bold text-purple-400">{metrics.activeSessionDuration.toFixed(1)}s</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-white/60">Audio Buffer</span>
                <span className="text-xs font-bold text-cyan-400">{audioData.length}/100</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-white/60">FFT Size</span>
                <span className="text-xs font-bold text-yellow-400">2048</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}