import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ThemeId } from './theme';
import { persistence, type ProjectFolder, type ProjectWorkspace } from './lib/persistence';

export type InputMode = 'text' | 'voice' | 'code' | 'vision';
export type ThreatLevel = 'LOW' | 'ELEVATED' | 'CRITICAL';
export type TradingStatus = 'IDLE' | 'ANALYZING' | 'EXECUTING' | 'PROFIT' | 'LOSS';
export type SwarmNodeStatus = 'ONLINE' | 'SYNCING' | 'PROCESSING' | 'OFFLINE';
export type SystemStatus = 'OFFLINE' | 'BOOTING' | 'ONLINE';
export type ProjectType = 'chat' | 'trading' | 'swarm' | 'blockchain' | 'quantum' | 'security' | 'workspace';

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
  activePanel: string;

  // Workspace & Project Management
  activeWorkspaceId: string;
  workspaces: Record<string, ProjectWorkspace>;
  activeProjectId: string | null;
  folders: Record<string, ProjectFolder>;
  activeFolderId: string | null;

  // Theme
  theme: ThemeId;

  // System Status
  systemStatus: SystemStatus;
  audioAmplitude: number;
  ollamaOnline: boolean | null;
  ollamaModelCount: number;

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

  // Persistence layer
  persistenceInitialized: boolean;

  // Actions
  toggleRadialMenu: () => void;
  toggleVoice: () => void;
  setListening: (status: boolean) => void;
  setInputMode: (mode: InputMode) => void;
  triggerThreat: () => void;
  clearThreat: () => void;
  setActivePanel: (panel: string) => void;
  updateTelemetry: (cpu: number, energy: number, window: string) => void;
  addMessage: (message: Message) => void;
  updateTradingPairs: (pairs: TradingPair[]) => void;
  setTradingStatus: (status: TradingStatus) => void;
  updateSwarmNodes: (nodes: SwarmNode[]) => void;
  updateBlockchainIdentity: (identity: BlockchainIdentity) => void;
  updateQuantumEntanglement: (value: number) => void;
  clearMessages: () => void;
  setTheme: (theme: ThemeId) => void;
  setSystemStatus: (status: SystemStatus) => void;
  setAudioAmplitude: (amp: number) => void;
  setOllamaStatus: (online: boolean | null, modelCount?: number) => void;

  // Workspace & Project Management
  initializePersistence: () => Promise<void>;
  createProjectFolder: (folder: Omit<ProjectFolder, 'id' | 'createdAt' | 'updatedAt' | 'archived' | 'order'>) => Promise<ProjectFolder>;
  renameProjectFolder: (folderId: string, newName: string) => Promise<ProjectFolder>;
  archiveProjectFolder: (folderId: string) => Promise<ProjectFolder>;
  deleteProjectFolder: (folderId: string) => Promise<void>;
  reorderProjectFolders: (newOrder: string[]) => Promise<void>;
  setActiveFolder: (folderId: string | null) => void;

  // Workspace Management
  createWorkspace: (name: string) => Promise<ProjectWorkspace>;
  switchWorkspace: (workspaceId: string) => Promise<void>;
  renameWorkspace: (workspaceId: string, newName: string) => Promise<ProjectWorkspace>;

  // Project Data Management
  loadProjectData: (projectId: string) => Promise<void>;
  saveProjectData: () => Promise<void>;
}

export const useStore = create<JarvisState>()(
  persist(
    (set, get) => ({
      isRadialMenuOpen: false,
      isVoiceActive: false,
      isListening: false,
      inputMode: 'text',
      threatLevel: 'LOW',
      showThreatPopup: false,
      activePanel: 'dashboard',

      theme: 'cyberpunk',
      systemStatus: 'OFFLINE',
      audioAmplitude: 0,
      ollamaOnline: null,
      ollamaModelCount: 0,

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

      // Workspace & Project Management
      activeWorkspaceId: 'default',
      workspaces: {},
      activeProjectId: null,
      folders: {},
      activeFolderId: null,
      persistenceInitialized: false,

      toggleRadialMenu: () => set((state) => ({ isRadialMenuOpen: !state.isRadialMenuOpen })),
      toggleVoice: () => set((state) => ({ isVoiceActive: !state.isVoiceActive, isListening: !state.isVoiceActive })),
      setListening: (status) => set({ isListening: status }),
      setInputMode: (mode) => set({ inputMode: mode }),
      triggerThreat: () => set({ threatLevel: 'CRITICAL', showThreatPopup: true }),
      clearThreat: () => set({ threatLevel: 'LOW', showThreatPopup: false }),
      setActivePanel: (panel) => {
        set({ activePanel: panel });
        // Update workspace last active panel
        const { activeWorkspaceId, workspaces, saveProjectData } = get();
        if (workspaces[activeWorkspaceId]) {
          workspaces[activeWorkspaceId].lastActivePanel = panel;
          set({ workspaces: { ...workspaces } });
          saveProjectData();
        }
      },
      updateTelemetry: (cpu, energy, window) => set({ cpuLoad: cpu, energyLevel: energy, activeWindow: window }),
      addMessage: (message) => {
        set((state) => ({ messages: [...state.messages, message] }));
        // Persist the message
        const { activeProjectId, saveProjectData } = get();
        if (activeProjectId) {
          persistence.addMessage(activeProjectId, message);
        }
      },
      updateTradingPairs: (pairs) => {
        set({ tradingPairs: pairs });
        // Persist trading pairs
        const { activeProjectId, saveProjectData } = get();
        if (activeProjectId) {
          persistence.updateTradingPairs(activeProjectId, pairs);
        }
      },
      setTradingStatus: (status) => set({ tradingStatus: status }),
      updateSwarmNodes: (nodes) => {
        set({ swarmNodes: nodes });
        // Persist swarm nodes
        const { activeProjectId, saveProjectData } = get();
        if (activeProjectId) {
          persistence.updateSwarmNodes(activeProjectId, nodes);
        }
      },
      updateBlockchainIdentity: (identity) => {
        set({ blockchainIdentity: identity });
        // Persist blockchain identity
        const { activeProjectId, saveProjectData } = get();
        if (activeProjectId) {
          persistence.updateBlockchainIdentity(activeProjectId, identity);
        }
      },
      updateQuantumEntanglement: (value) => set({ quantumEntanglement: value }),
      clearMessages: () => {
        set({ messages: [] });
        // Clear persisted messages
        const { activeProjectId, saveProjectData } = get();
        if (activeProjectId) {
          persistence.clearMessages(activeProjectId);
        }
      },
      setTheme: (theme) => {
        set({ theme });
        // Update workspace theme
        const { activeWorkspaceId, workspaces, saveProjectData } = get();
        if (workspaces[activeWorkspaceId]) {
          workspaces[activeWorkspaceId].theme = theme;
          set({ workspaces: { ...workspaces } });
          saveProjectData();
        }
      },
      setSystemStatus: (status) => set({ systemStatus: status }),
      setAudioAmplitude: (amp) => set({ audioAmplitude: amp }),
      setOllamaStatus: (online, modelCount = 0) => set({ ollamaOnline: online, ollamaModelCount: modelCount }),

      // Persistence Initialization
      initializePersistence: async () => {
        const persistedState = await persistence.initialize();
        set({
          activeWorkspaceId: persistedState.activeWorkspaceId,
          workspaces: persistedState.workspaces,
          folders: persistedState.folders,
          activePanel: persistedState.workspaces[persistedState.activeWorkspaceId]?.lastActivePanel || 'dashboard',
          theme: persistedState.theme,
          persistenceInitialized: true
        });
      },

      // Project Folder Management
      createProjectFolder: async (folder) => {
        const newFolder = await persistence.createProjectFolder(folder);
        set((state) => ({
          folders: { ...state.folders, [newFolder.id]: newFolder }
        }));
        return newFolder;
      },

      renameProjectFolder: async (folderId, newName) => {
        const updatedFolder = await persistence.renameProjectFolder(folderId, newName);
        set((state) => ({
          folders: { ...state.folders, [folderId]: updatedFolder }
        }));
        return updatedFolder;
      },

      archiveProjectFolder: async (folderId) => {
        const updatedFolder = await persistence.archiveProjectFolder(folderId);
        set((state) => ({
          folders: { ...state.folders, [folderId]: updatedFolder }
        }));
        return updatedFolder;
      },

      deleteProjectFolder: async (folderId) => {
        await persistence.deleteProjectFolder(folderId);
        const { folders, activeFolderId } = get();
        const newFolders = { ...folders };
        delete newFolders[folderId];

        set({
          folders: newFolders,
          activeFolderId: activeFolderId === folderId ? null : activeFolderId
        });
      },

      reorderProjectFolders: async (newOrder) => {
        await persistence.reorderProjectFolders(newOrder);
        const { folders } = get();
        const updatedFolders = { ...folders };

        newOrder.forEach((folderId, index) => {
          if (updatedFolders[folderId]) {
            updatedFolders[folderId] = { ...updatedFolders[folderId], order: index };
          }
        });

        set({ folders: updatedFolders });
      },

      setActiveFolder: (folderId) => {
        set({ activeFolderId: folderId });
        if (folderId) {
          const folder = get().folders[folderId];
          if (folder) {
            get().loadProjectData(folderId);
          }
        }
      },

      // Workspace Management
      createWorkspace: async (name) => {
        const newWorkspace = await persistence.createWorkspace(name);
        set((state) => ({
          workspaces: { ...state.workspaces, [newWorkspace.id]: newWorkspace },
          activeWorkspaceId: newWorkspace.id
        }));
        return newWorkspace;
      },

      switchWorkspace: async (workspaceId) => {
        await persistence.switchWorkspace(workspaceId);
        const workspace = get().workspaces[workspaceId];
        set({
          activeWorkspaceId: workspaceId,
          activePanel: workspace?.lastActivePanel || 'dashboard',
          theme: workspace?.theme || 'cyberpunk'
        });
        // Load default project for workspace
        const defaultFolder = Object.values(get().folders).find(
          f => f.type === 'workspace' && !f.archived && f.parentId === undefined
        );
        if (defaultFolder) {
          get().setActiveFolder(defaultFolder.id);
        }
      },

      renameWorkspace: async (workspaceId, newName) => {
        const updatedWorkspace = await persistence.renameWorkspace(workspaceId, newName);
        set((state) => ({
          workspaces: { ...state.workspaces, [workspaceId]: updatedWorkspace }
        }));
        return updatedWorkspace;
      },

      // Project Data Management
      loadProjectData: async (projectId) => {
        set({ activeProjectId: projectId, messages: [], tradingPairs: [], swarmNodes: [] });

        // Load messages
        const messages = await persistence.getMessages(projectId);
        set({ messages });

        // Load trading pairs
        const tradingPairs = await persistence.getTradingPairs(projectId);
        set({ tradingPairs });

        // Load swarm nodes
        const swarmNodes = await persistence.getSwarmNodes(projectId);
        set({ swarmNodes });

        // Load blockchain identity
        const blockchainIdentity = await persistence.getBlockchainIdentity(projectId);
        if (blockchainIdentity) {
          set({ blockchainIdentity });
        }
      },

      saveProjectData: async () => {
        const {
          activeProjectId,
          messages,
          tradingPairs,
          swarmNodes,
          blockchainIdentity,
          activeWorkspaceId,
          workspaces
        } = get();

        if (activeProjectId) {
          // Save messages
          if (messages.length > 0) {
            await persistence.updateTradingPairs(activeProjectId, messages);
          }

          // Save trading pairs
          if (tradingPairs.length > 0) {
            await persistence.updateTradingPairs(activeProjectId, tradingPairs);
          }

          // Save swarm nodes
          if (swarmNodes.length > 0) {
            await persistence.updateSwarmNodes(activeProjectId, swarmNodes);
          }

          // Save blockchain identity
          await persistence.updateBlockchainIdentity(activeProjectId, blockchainIdentity);
        }

        // Save workspace state
        if (workspaces[activeWorkspaceId]) {
          workspaces[activeWorkspaceId].updatedAt = new Date();
          await persistence.saveState({
            workspaces: { ...workspaces },
            activeWorkspaceId
          });
        }
      }
    }),
    {
      name: 'jarvis-god-protocol-localstorage',
      partialize: (state) => ({
        // Only persist these in localStorage, IndexedDB handles the rest
        theme: state.theme,
        energyLevel: state.energyLevel,
        lastSystemStatus: state.systemStatus
      }),
    }
  )
);
