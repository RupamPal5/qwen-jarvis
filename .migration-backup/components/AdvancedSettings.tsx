"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Settings, Brain, Shield, Palette, Network, Cpu, Wallet,
  Bell, Eye, Code, Save, RotateCcw, Search, ChevronRight,
  Zap, Lock, Globe, HardDrive, Database, Terminal,
  ToggleLeft, ToggleRight, Sliders, Volume2, VolumeX,
  Moon, Sun, Monitor, Smartphone, Tablet, Watch,
  Activity, AlertTriangle, CheckCircle, XCircle, Info,
  HelpCircle, RefreshCw, Download, Upload, Trash2,
  Key, Fingerprint, Wifi, WifiOff, Server, Cloud,
  CloudOff, Database as DbIcon, GitBranch, Bug,
  Layers, Box, Package, Timer, Clock, Calendar,
  Mail, MessageSquare, Phone, Video, Mic, MicOff,
  Camera, CameraOff, MapPin, Navigation, Compass,
  Thermometer, Fan, Power, Battery, BatteryCharging,
  Gauge, Tachometer, Cpu as CpuIcon, MemoryStick,
  HardDrive as HdIcon, Network as NetIcon, Globe as GlobeIcon,
  Shield as ShieldIcon, Lock as LockIcon, Key as KeyIcon,
  Fingerprint as FpIcon, Eye as EyeIcon, EyeOff,
  Bell as BellIcon, BellOff, Mail as MailIcon,
  MessageSquare as MsgIcon, Phone as PhoneIcon,
  Video as VideoIcon, Mic as MicIcon, Camera as CamIcon,
  MapPin as MapIcon, Navigation as NavIcon, Compass as CompIcon,
  Thermometer as ThermIcon, Fan as FanIcon, Power as PowerIcon,
  Battery as BatIcon, BatteryCharging as BatChgIcon,
  Gauge as GaugeIcon, Tachometer as TachIcon,
} from "lucide-react";

// ============================================================================
// REUSABLE UI COMPONENTS
// ============================================================================

const SettingSection: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode }> = ({ title, icon, children }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="mb-8"
  >
    <div className="flex items-center gap-3 mb-4 pb-2 border-b border-white/10">
      <div className="p-2 rounded-lg bg-purple-500/20 text-purple-400">
        {icon}
      </div>
      <h3 className="text-lg font-bold text-white tracking-wider">{title}</h3>
    </div>
    <div className="space-y-4 pl-2">
      {children}
    </div>
  </motion.div>
);

const SettingRow: React.FC<{ label: string; description?: string; children: React.ReactNode }> = ({ label, description, children }) => (
  <div className="flex items-center justify-between p-4 rounded-xl bg-black/30 border border-white/5 hover:border-purple-500/30 transition-all">
    <div className="flex-1 pr-4">
      <div className="text-sm font-semibold text-white mb-1">{label}</div>
      {description && <div className="text-xs text-white/50">{description}</div>}
    </div>
    <div className="flex-shrink-0">
      {children}
    </div>
  </div>
);

const Toggle: React.FC<{ enabled: boolean; onChange: (v: boolean) => void }> = ({ enabled, onChange }) => (
  <button
    onClick={() => onChange(!enabled)}
    className={`relative w-12 h-6 rounded-full transition-colors ${enabled ? "bg-purple-600" : "bg-white/10"}`}
  >
    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${enabled ? "left-7" : "left-1"}`} />
  </button>
);

const Slider: React.FC<{ value: number; min: number; max: number; step?: number; onChange: (v: number) => void; suffix?: string }> = ({ value, min, max, step = 1, onChange, suffix = "" }) => (
  <div className="flex items-center gap-3 w-48">
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(parseFloat(e.target.value))}
      className="flex-1 h-1 bg-white/10 rounded-full appearance-none cursor-pointer accent-purple-500"
    />
    <span className="text-xs font-mono text-purple-400 w-12 text-right">{value}{suffix}</span>
  </div>
);

const Select: React.FC<{ value: string; options: string[]; onChange: (v: string) => void }> = ({ value, options, onChange }) => (
  <select
    value={value}
    onChange={(e) => onChange(e.target.value)}
    className="bg-black/50 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-purple-500/50"
  >
    {options.map((opt) => (
      <option key={opt} value={opt}>{opt}</option>
    ))}
  </select>
);

const NumberInput: React.FC<{ value: number; onChange: (v: number) => void; min?: number; max?: number }> = ({ value, onChange, min, max }) => (
  <input
    type="number"
    value={value}
    min={min}
    max={max}
    onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
    className="w-20 bg-black/50 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white text-right focus:outline-none focus:border-purple-500/50"
  />
);

const TextInput: React.FC<{ value: string; onChange: (v: string) => void; placeholder?: string }> = ({ value, onChange, placeholder }) => (
  <input
    type="text"
    value={value}
    onChange={(e) => onChange(e.target.value)}
    placeholder={placeholder}
    className="w-48 bg-black/50 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-purple-500/50"
  />
);

// ============================================================================
// MAIN SETTINGS COMPONENT
// ============================================================================

export default function AdvancedSettings() {
  const [activeCategory, setActiveCategory] = useState("ai-core");
  const [searchQuery, setSearchQuery] = useState("");
  const [saved, setSaved] = useState(false);

  // --- STATE FOR 60+ OPTIONS ---
  // AI Core
  const [model, setModel] = useState("qwen2.5:7b");
  const [temperature, setTemperature] = useState(0.7);
  const [topP, setTopP] = useState(0.9);
  const [maxTokens, setMaxTokens] = useState(4096);
  const [freqPenalty, setFreqPenalty] = useState(0.0);
  const [presPenalty, setPresPenalty] = useState(0.0);
  const [contextWindow, setContextWindow] = useState(32768);
  const [systemPrompt, setSystemPrompt] = useState("You are JARVIS, a sovereign AI.");
  const [councilLoops, setCouncilLoops] = useState(3);
  const [watchdogSens, setWatchdogSens] = useState(85);

  // UI/UX
  const [theme, setTheme] = useState("DARK");
  const [accentColor, setAccentColor] = useState("PURPLE");
  const [animSpeed, setAnimSpeed] = useState(500);
  const [fontSize, setFontSize] = useState(14);
  const [compactMode, setCompactMode] = useState(false);
  const [glassIntensity, setGlassIntensity] = useState(80);
  const [bgQuality, setBgQuality] = useState("HIGH");
  const [soundVol, setSoundVol] = useState(75);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Security
  const [bioAuth, setBioAuth] = useState(true);
  const [twoFA, setTwoFA] = useState(true);
  const [sessionTimeout, setSessionTimeout] = useState(30);
  const [panicTrigger, setPanicTrigger] = useState(true);
  const [encAlgo, setEncAlgo] = useState("AES-256-GCM");
  const [killSwitch, setKillSwitch] = useState("YUBIKEY");
  const [auditRetention, setAuditRetention] = useState(90);
  const [ipWhitelist, setIpWhitelist] = useState(true);

  // Network
  const [proxyMode, setProxyMode] = useState(true);
  const [wsPort, setWsPort] = useState(8000);
  const [apiRateLimit, setApiRateLimit] = useState(60);
  const [bandwidthThrottle, setBandwidthThrottle] = useState(false);
  const [dnsServer, setDnsServer] = useState("1.1.1.1");
  const [allowDomains, setAllowDomains] = useState("api.anthropic.com, ollama.com");

  // Hardware
  const [cpuLimit, setCpuLimit] = useState(4);
  const [ramLimit, setRamLimit] = useState(8);
  const [gpuAccel, setGpuAccel] = useState(true);
  const [thermalThrottle, setThermalThrottle] = useState(80);
  const [fanCurve, setFanCurve] = useState("BALANCED");
  const [powerMode, setPowerMode] = useState("PERFORMANCE");

  // Blockchain
  const [defaultNet, setDefaultNet] = useState("ETHEREUM");
  const [gasLimit, setGasLimit] = useState(21000);
  const [slippage, setSlippage] = useState(0.5);
  const [autoApprove, setAutoApprove] = useState(false);
  const [wcTimeout, setWcTimeout] = useState(300);
  const [nftRefresh, setNftRefresh] = useState(true);

  // Notifications
  const [desktopAlerts, setDesktopAlerts] = useState(true);
  const [emailDigests, setEmailDigests] = useState(false);
  const [soundAlerts, setSoundAlerts] = useState(true);
  const [criticalOnly, setCriticalOnly] = useState(false);
  const [dndSchedule, setDndSchedule] = useState("22:00-08:00");

  // Privacy
  const [dataCollection, setDataCollection] = useState(false);
  const [telemetry, setTelemetry] = useState(false);
  const [memoryDecay, setMemoryDecay] = useState(30);
  const [autoForget, setAutoForget] = useState(true);
  const [localOnly, setLocalOnly] = useState(true);

  // Debug
  const [verboseLog, setVerboseLog] = useState(false);
  const [devMode, setDevMode] = useState(true);
  const [mockData, setMockData] = useState(false);
  const [wsReconnect, setWsReconnect] = useState(3000);
  const [cacheClear, setCacheClear] = useState(false);

  const categories = [
    { id: "ai-core", label: "AI Core", icon: <Brain size={18} /> },
    { id: "ui-ux", label: "UI / UX", icon: <Palette size={18} /> },
    { id: "security", label: "Security", icon: <Shield size={18} /> },
    { id: "network", label: "Network", icon: <Network size={18} /> },
    { id: "hardware", label: "Hardware", icon: <Cpu size={18} /> },
    { id: "blockchain", label: "Blockchain", icon: <Wallet size={18} /> },
    { id: "notifications", label: "Notifications", icon: <Bell size={18} /> },
    { id: "privacy", label: "Privacy", icon: <Eye size={18} /> },
    { id: "debug", label: "Debug / Adv", icon: <Code size={18} /> },
  ];

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    // In production: persist to localStorage or backend
  };

  const handleReset = () => {
    if (confirm("Reset all settings to default?")) {
      // Reset logic here
      alert("Settings reset to default.");
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div className="flex items-center gap-4">
            <Settings className="w-8 h-8 text-purple-400" />
            <div>
              <h1 className="text-3xl font-black text-white tracking-wider">ADVANCED SETTINGS</h1>
              <p className="text-xs text-white/60 tracking-widest">60+ CONFIGURATION OPTIONS • GOD PROTOCOL v5.0</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleReset}
              className="px-4 py-2 bg-red-600/20 border border-red-500/50 text-red-400 rounded-lg text-xs font-bold hover:bg-red-600/30 transition-all flex items-center gap-2"
            >
              <RotateCcw size={14} /> RESET
            </button>
            <button
              onClick={handleSave}
              className={`px-6 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
                saved
                  ? "bg-green-600 text-white border border-green-500"
                  : "bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-500 hover:to-blue-500 shadow-[0_0_20px_rgba(168,85,247,0.4)]"
              }`}
            >
              {saved ? <><CheckCircle size={14} /> SAVED</> : <><Save size={14} /> SAVE CHANGES</>}
            </button>
          </div>
        </motion.div>

        <div className="grid grid-cols-12 gap-6">
          {/* Sidebar Navigation */}
          <div className="col-span-12 lg:col-span-3">
            <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-4 sticky top-6">
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search settings..."
                  className="w-full bg-black/50 border border-white/10 rounded-lg pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500/50"
                />
              </div>
              <nav className="space-y-1">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                      activeCategory === cat.id
                        ? "bg-purple-600/20 border border-purple-500/50 text-purple-400"
                        : "text-white/60 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    {cat.icon}
                    {cat.label}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="col-span-12 lg:col-span-9">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeCategory}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                {activeCategory === "ai-core" && (
                  <SettingSection title="AI Core Configuration" icon={<Brain size={20} />}>
                    <SettingRow label="Primary Model" description="Select the main LLM for cognitive tasks">
                      <Select value={model} options={["qwen2.5:7b", "qwen2.5:1.5b", "llama3:8b", "mistral:7b"]} onChange={setModel} />
                    </SettingRow>
                    <SettingRow label="Temperature" description="Controls randomness (0 = deterministic, 1 = creative)">
                      <Slider value={temperature} min={0} max={1} step={0.1} onChange={setTemperature} />
                    </SettingRow>
                    <SettingRow label="Top-P (Nucleus Sampling)" description="Alternative to temperature">
                      <Slider value={topP} min={0} max={1} step={0.05} onChange={setTopP} />
                    </SettingRow>
                    <SettingRow label="Max Tokens" description="Maximum output length per response">
                      <NumberInput value={maxTokens} onChange={setMaxTokens} min={256} max={32768} />
                    </SettingRow>
                    <SettingRow label="Frequency Penalty" description="Reduce repetition of tokens">
                      <Slider value={freqPenalty} min={0} max={2} step={0.1} onChange={setFreqPenalty} />
                    </SettingRow>
                    <SettingRow label="Presence Penalty" description="Encourage new topics">
                      <Slider value={presPenalty} min={0} max={2} step={0.1} onChange={setPresPenalty} />
                    </SettingRow>
                    <SettingRow label="Context Window Size" description="Tokens retained in memory">
                      <NumberInput value={contextWindow} onChange={setContextWindow} min={4096} max={128000} />
                    </SettingRow>
                    <SettingRow label="Council Debate Loops" description="Max recursion for Council of Three">
                      <NumberInput value={councilLoops} onChange={setCouncilLoops} min={1} max={10} />
                    </SettingRow>
                    <SettingRow label="Watchdog Sensitivity" description="Threshold for blocking unsafe actions">
                      <Slider value={watchdogSens} min={0} max={100} onChange={setWatchdogSens} suffix="%" />
                    </SettingRow>
                    <SettingRow label="System Prompt" description="Base personality and instructions">
                      <TextInput value={systemPrompt} onChange={setSystemPrompt} placeholder="You are JARVIS..." />
                    </SettingRow>
                  </SettingSection>
                )}

                {activeCategory === "ui-ux" && (
                  <SettingSection title="UI / UX Customization" icon={<Palette size={20} />}>
                    <SettingRow label="Theme Mode" description="Overall color scheme">
                      <Select value={theme} options={["DARK", "LIGHT", "AUTO"]} onChange={setTheme} />
                    </SettingRow>
                    <SettingRow label="Accent Color" description="Primary UI highlight color">
                      <Select value={accentColor} options={["PURPLE", "CYAN", "GREEN", "RED", "GOLD"]} onChange={setAccentColor} />
                    </SettingRow>
                    <SettingRow label="Animation Speed" description="Transition duration in ms">
                      <Slider value={animSpeed} min={0} max={1000} step={50} onChange={setAnimSpeed} suffix="ms" />
                    </SettingRow>
                    <SettingRow label="Font Size" description="Base text size">
                      <Slider value={fontSize} min={10} max={24} onChange={setFontSize} suffix="px" />
                    </SettingRow>
                    <SettingRow label="Compact Mode" description="Reduce padding and margins">
                      <Toggle enabled={compactMode} onChange={setCompactMode} />
                    </SettingRow>
                    <SettingRow label="Glassmorphism Intensity" description="Background blur strength">
                      <Slider value={glassIntensity} min={0} max={100} onChange={setGlassIntensity} suffix="%" />
                    </SettingRow>
                    <SettingRow label="3D Background Quality" description="Particle and globe rendering">
                      <Select value={bgQuality} options={["LOW", "MEDIUM", "HIGH", "ULTRA"]} onChange={setBgQuality} />
                    </SettingRow>
                    <SettingRow label="Sound Effects" description="Enable UI audio feedback">
                      <Toggle enabled={soundEnabled} onChange={setSoundEnabled} />
                    </SettingRow>
                    <SettingRow label="Master Volume" description="Overall sound level">
                      <Slider value={soundVol} min={0} max={100} onChange={setSoundVol} suffix="%" />
                    </SettingRow>
                  </SettingSection>
                )}

                {activeCategory === "security" && (
                  <SettingSection title="Security & Containment" icon={<Shield size={20} />}>
                    <SettingRow label="Biometric Authentication" description="Require fingerprint/face for sensitive actions">
                      <Toggle enabled={bioAuth} onChange={setBioAuth} />
                    </SettingRow>
                    <SettingRow label="Two-Factor Authentication (2FA)" description="Require TOTP for login">
                      <Toggle enabled={twoFA} onChange={setTwoFA} />
                    </SettingRow>
                    <SettingRow label="Session Timeout" description="Auto-lock after inactivity">
                      <NumberInput value={sessionTimeout} onChange={setSessionTimeout} min={5} max={480} />
                    </SettingRow>
                    <SettingRow label="Panic Room Auto-Trigger" description="Lock down on anomaly detection">
                      <Toggle enabled={panicTrigger} onChange={setPanicTrigger} />
                    </SettingRow>
                    <SettingRow label="Encryption Algorithm" description="Data at rest encryption">
                      <Select value={encAlgo} options={["AES-256-GCM", "ChaCha20-Poly1305", "AES-128-CBC"]} onChange={setEncAlgo} />
                    </SettingRow>
                    <SettingRow label="Hardware Kill Switch" description="Physical trigger type">
                      <Select value={killSwitch} options={["YUBIKEY", "GPIO_PIN", "USB_UNPLUG", "NONE"]} onChange={setKillSwitch} />
                    </SettingRow>
                    <SettingRow label="Audit Log Retention" description="Days to keep Merkle audit logs">
                      <NumberInput value={auditRetention} onChange={setAuditRetention} min={7} max={365} />
                    </SettingRow>
                    <SettingRow label="IP Whitelist Mode" description="Only allow known IPs">
                      <Toggle enabled={ipWhitelist} onChange={setIpWhitelist} />
                    </SettingRow>
                  </SettingSection>
                )}

                {activeCategory === "network" && (
                  <SettingSection title="Network & Connectivity" icon={<Network size={20} />}>
                    <SettingRow label="Proxy Mode" description="Route traffic through Squid">
                      <Toggle enabled={proxyMode} onChange={setProxyMode} />
                    </SettingRow>
                    <SettingRow label="WebSocket Port" description="Backend communication port">
                      <NumberInput value={wsPort} onChange={setWsPort} min={1024} max={65535} />
                    </SettingRow>
                    <SettingRow label="API Rate Limit" description="Requests per minute">
                      <NumberInput value={apiRateLimit} onChange={setApiRateLimit} min={10} max={1000} />
                    </SettingRow>
                    <SettingRow label="Bandwidth Throttle" description="Limit data usage">
                      <Toggle enabled={bandwidthThrottle} onChange={setBandwidthThrottle} />
                    </SettingRow>
                    <SettingRow label="DNS Server" description="Custom DNS resolver">
                      <TextInput value={dnsServer} onChange={setDnsServer} placeholder="1.1.1.1" />
                    </SettingRow>
                    <SettingRow label="Allowed Domains" description="Comma-separated whitelist">
                      <TextInput value={allowDomains} onChange={setAllowDomains} placeholder="api.example.com" />
                    </SettingRow>
                  </SettingSection>
                )}

                {activeCategory === "hardware" && (
                  <SettingSection title="Hardware & Resources" icon={<Cpu size={20} />}>
                    <SettingRow label="CPU Core Limit" description="Max cores allocated to JARVIS">
                      <NumberInput value={cpuLimit} onChange={setCpuLimit} min={1} max={16} />
                    </SettingRow>
                    <SettingRow label="RAM Limit (GB)" description="Maximum memory usage">
                      <NumberInput value={ramLimit} onChange={setRamLimit} min={1} max={32} />
                    </SettingRow>
                    <SettingRow label="GPU Acceleration" description="Use CUDA/Metal for inference">
                      <Toggle enabled={gpuAccel} onChange={setGpuAccel} />
                    </SettingRow>
                    <SettingRow label="Thermal Throttle Temp" description="Switch to light model above this">
                      <Slider value={thermalThrottle} min={60} max={100} onChange={setThermalThrottle} suffix="°C" />
                    </SettingRow>
                    <SettingRow label="Fan Curve Profile" description="Cooling behavior">
                      <Select value={fanCurve} options={["SILENT", "BALANCED", "PERFORMANCE", "MAX"]} onChange={setFanCurve} />
                    </SettingRow>
                    <SettingRow label="Power Mode" description="System power profile">
                      <Select value={powerMode} options={["POWER_SAVER", "BALANCED", "PERFORMANCE", "TURBO"]} onChange={setPowerMode} />
                    </SettingRow>
                  </SettingSection>
                )}

                {activeCategory === "blockchain" && (
                  <SettingSection title="Blockchain & Web3" icon={<Wallet size={20} />}>
                    <SettingRow label="Default Network" description="Primary chain for transactions">
                      <Select value={defaultNet} options={["ETHEREUM", "POLYGON", "BSC", "ARBITRUM", "SOLANA"]} onChange={setDefaultNet} />
                    </SettingRow>
                    <SettingRow label="Gas Limit" description="Max gas per transaction">
                      <NumberInput value={gasLimit} onChange={setGasLimit} min={21000} max={1000000} />
                    </SettingRow>
                    <SettingRow label="Slippage Tolerance" description="Max price change for swaps">
                      <Slider value={slippage} min={0.1} max={5} step={0.1} onChange={setSlippage} suffix="%" />
                    </SettingRow>
                    <SettingRow label="Auto-Approve Transactions" description="Skip confirmation for small amounts">
                      <Toggle enabled={autoApprove} onChange={setAutoApprove} />
                    </SettingRow>
                    <SettingRow label="WalletConnect Timeout" description="Seconds to wait for connection">
                      <NumberInput value={wcTimeout} onChange={setWcTimeout} min={30} max={600} />
                    </SettingRow>
                    <SettingRow label="NFT Auto-Refresh" description="Update floor prices automatically">
                      <Toggle enabled={nftRefresh} onChange={setNftRefresh} />
                    </SettingRow>
                  </SettingSection>
                )}

                {activeCategory === "notifications" && (
                  <SettingSection title="Notifications & Alerts" icon={<Bell size={20} />}>
                    <SettingRow label="Desktop Alerts" description="Show system notifications">
                      <Toggle enabled={desktopAlerts} onChange={setDesktopAlerts} />
                    </SettingRow>
                    <SettingRow label="Email Digests" description="Daily summary via email">
                      <Toggle enabled={emailDigests} onChange={setEmailDigests} />
                    </SettingRow>
                    <SettingRow label="Sound Alerts" description="Audio for critical events">
                      <Toggle enabled={soundAlerts} onChange={setSoundAlerts} />
                    </SettingRow>
                    <SettingRow label="Critical Only Mode" description="Suppress non-urgent alerts">
                      <Toggle enabled={criticalOnly} onChange={setCriticalOnly} />
                    </SettingRow>
                    <SettingRow label="Do Not Disturb Schedule" description="Mute during these hours">
                      <TextInput value={dndSchedule} onChange={setDndSchedule} placeholder="22:00-08:00" />
                    </SettingRow>
                  </SettingSection>
                )}

                {activeCategory === "privacy" && (
                  <SettingSection title="Privacy & Data Control" icon={<Eye size={20} />}>
                    <SettingRow label="Data Collection" description="Allow anonymous usage stats">
                      <Toggle enabled={dataCollection} onChange={setDataCollection} />
                    </SettingRow>
                    <SettingRow label="Telemetry" description="Send performance metrics">
                      <Toggle enabled={telemetry} onChange={setTelemetry} />
                    </SettingRow>
                    <SettingRow label="Memory Decay Rate" description="Days until unused memories fade">
                      <NumberInput value={memoryDecay} onChange={setMemoryDecay} min={7} max={365} />
                    </SettingRow>
                    <SettingRow label="Auto-Forget Sensitive Data" description="Delete PII after processing">
                      <Toggle enabled={autoForget} onChange={setAutoForget} />
                    </SettingRow>
                    <SettingRow label="Local Processing Only" description="Never send data to cloud">
                      <Toggle enabled={localOnly} onChange={setLocalOnly} />
                    </SettingRow>
                  </SettingSection>
                )}

                {activeCategory === "debug" && (
                  <SettingSection title="Debug & Advanced" icon={<Code size={20} />}>
                    <SettingRow label="Verbose Logging" description="Show detailed debug output">
                      <Toggle enabled={verboseLog} onChange={setVerboseLog} />
                    </SettingRow>
                    <SettingRow label="Developer Mode" description="Unlock experimental features">
                      <Toggle enabled={devMode} onChange={setDevMode} />
                    </SettingRow>
                    <SettingRow label="Mock Data Toggle" description="Use simulated data for testing">
                      <Toggle enabled={mockData} onChange={setMockData} />
                    </SettingRow>
                    <SettingRow label="WebSocket Reconnect Interval" description="ms between retry attempts">
                      <NumberInput value={wsReconnect} onChange={setWsReconnect} min={1000} max={30000} />
                    </SettingRow>
                    <SettingRow label="Clear Cache on Restart" description="Wipe temporary files">
                      <Toggle enabled={cacheClear} onChange={setCacheClear} />
                    </SettingRow>
                  </SettingSection>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}