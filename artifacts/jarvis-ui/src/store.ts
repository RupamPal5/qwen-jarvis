import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type InputMode = 'text' | 'voice' | 'code' | 'vision';
export type ThreatLevel = 'LOW' | 'ELEVATED' | 'CRITICAL';
export type TradingStatus = 'IDLE' | 'ANALYZING' | 'EXECUTING' | 'PROFIT' | 'LOSS';
export type SwarmNodeStatus = 'ONLINE' | 'SYNCING' | 'PROCESSING' | 'OFFLINE';

export interface Message {
  id: string;
  role: 'user' | 'jarvis' | 'system' | 'council';
  content: string;
  timestamp: Date;
  metadata?: {
    sentiment?: number;
    confidence?: number;
    councilVotes?: {
      architect: string;
      adversary: string;
      arbiter: string;
    };
  };
}

export interface TradingPair {
  symbol: string;
  price: number;
  change24h: number;
  volume: number;
  signal: 'BUY' | 'SELL' | 'HOLD';
  confidence: number;
}

export interface SwarmNode {
  id: string;
  location: string;
  status: SwarmNodeStatus;
  tasksCompleted: number;
  latency: number;
}

export interface BlockchainIdentity {
  address: string;
  verified: boolean;
  reputation: number;
  transactions: number;
}

interface JarvisState {
  // UI States
  isRadialMenuOpen: boolean;
  isVoiceActive: boolean;
  isListening: boolean;
  inputMode: InputMode;
  threatLevel: ThreatLevel;
  showThreatPopup: boolean;
  activePanel: 'chat' | 'trading' | 'swarm' | 'blockchain' | 'quantum';
  
  // Data
  cpuLoad: number;
  energyLevel: number;
  activeWindow: string;
  messages: Message[];
  tradingPairs: TradingPair[];
  tradingStatus: TradingStatus;
  swarmNodes: SwarmNode[];
  blockchainIdentity: BlockchainIdentity;
  quantumEntanglement: number;
  
  // Actions
  toggleRadialMenu: () => void;
  toggleVoice: () => void;
  setListening: (status: boolean) => void;
  setInputMode: (mode: InputMode) => void;
  triggerThreat: () => void;
  clearThreat: () => void;
  setActivePanel: (panel: any) => void;
  updateTelemetry: (cpu: number, energy: number, window: string) => void;
  addMessage: (message: Message) => void;
  updateTradingPairs: (pairs: TradingPair[]) => void;
  setTradingStatus: (status: TradingStatus) => void;
  updateSwarmNodes: (nodes: SwarmNode[]) => void;
  updateBlockchainIdentity: (identity: BlockchainIdentity) => void;
  updateQuantumEntanglement: (value: number) => void;
  clearMessages: () => void;
}

export const useStore = create<JarvisState>()(
  persist(
    (set) => ({
      isRadialMenuOpen: false,
      isVoiceActive: false,
      isListening: false,
      inputMode: 'text',
      threatLevel: 'LOW',
      showThreatPopup: false,
      activePanel: 'chat',
      
      cpuLoad: 42,
      energyLevel: 85,
      activeWindow: 'VS Code',
      messages: [],
      tradingPairs: [],
      tradingStatus: 'IDLE',
      swarmNodes: [],
      blockchainIdentity: {
        address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
        verified: true,
        reputation: 98.7,
        transactions: 1247
      },
      quantumEntanglement: 94.2,
      
      toggleRadialMenu: () => set((state) => ({ isRadialMenuOpen: !state.isRadialMenuOpen })),
      toggleVoice: () => set((state) => ({ isVoiceActive: !state.isVoiceActive, isListening: !state.isVoiceActive })),
      setListening: (status) => set({ isListening: status }),
      setInputMode: (mode) => set({ inputMode: mode }),
      triggerThreat: () => set({ threatLevel: 'CRITICAL', showThreatPopup: true }),
      clearThreat: () => set({ threatLevel: 'LOW', showThreatPopup: false }),
      setActivePanel: (panel) => set({ activePanel: panel }),
      updateTelemetry: (cpu, energy, window) => set({ cpuLoad: cpu, energyLevel: energy, activeWindow: window }),
      addMessage: (message) => set((state) => ({ messages: [...state.messages, message] })),
      updateTradingPairs: (pairs) => set({ tradingPairs: pairs }),
      setTradingStatus: (status) => set({ tradingStatus: status }),
      updateSwarmNodes: (nodes) => set({ swarmNodes: nodes }),
      updateBlockchainIdentity: (identity) => set({ blockchainIdentity: identity }),
      updateQuantumEntanglement: (value) => set({ quantumEntanglement: value }),
      clearMessages: () => set({ messages: [] }),
    }),
    {
      name: 'jarvis-god-protocol-storage',
      partialize: (state) => ({
        messages: state.messages,
        blockchainIdentity: state.blockchainIdentity,
        energyLevel: state.energyLevel,
      }),
    }
  )
);