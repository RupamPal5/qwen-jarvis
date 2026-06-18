/**
 * JARVIS V5.0 - Client-Side Memory Layer
 * Comprehensive IndexedDB persistence via localForage
 * Preserves chat histories, project contexts, and UI states across sessions
 */

interface LocalForageInstance {
  getItem<T>(key: string): Promise<T | null>;
  setItem<T>(key: string, value: T): Promise<T>;
  removeItem(key: string): Promise<void>;
  clear(): Promise<void>;
}

let localForage: any;
try {
  localForage = require('localforage');
} catch {
  localForage = null;
}

const jarvisDB: LocalForageInstance = localForage?.createInstance({
  name: 'JARVIS_GOD_PROTOCOL_V5',
  storeName: 'memory_layer',
  version: 1.0,
  description: 'Client-side memory layer for JARVIS V5.0 with IndexedDB backend'
}) || ({
  getItem: async () => null,
  setItem: async (k: string, v: any) => v,
  removeItem: async () => {},
  clear: async () => {}
} as LocalForageInstance);
import { Message, TradingPair, SwarmNode, BlockchainIdentity } from '../store';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export type ProjectType = 'chat' | 'trading' | 'swarm' | 'blockchain' | 'quantum' | 'security' | 'workspace';

export interface ProjectFolder {
  id: string;
  name: string;
  type: ProjectType;
  createdAt: Date;
  updatedAt: Date;
  archived: boolean;
  parentId?: string;
  order: number;
}

export interface ProjectWorkspace {
  id: string;
  name: string;
  activeProjectId?: string;
  lastActivePanel: string;
  createdAt: Date;
  updatedAt: Date;
  theme: string;
}

export interface PersistedState {
  // Core UI state
  activeWorkspaceId: string;
  workspaces: Record<string, ProjectWorkspace>;
  folders: Record<string, ProjectFolder>;

  // Project data
  messages: Record<string, Message[]>; // projectId -> messages
  tradingPairs: Record<string, TradingPair[]>; // projectId -> pairs
  swarmNodes: Record<string, SwarmNode[]>; // projectId -> nodes
  blockchainIdentities: Record<string, BlockchainIdentity>; // projectId -> identity

  // UI preferences
  sidebarOpen: boolean;
  inputMode: string;
  theme: string;
  lastSystemStatus: string;
}

// ============================================================================
// DATABASE CONFIGURATION
// ============================================================================

// ============================================================================
// CORE PERSISTENCE LAYER
// ============================================================================

class JarvisPersistence {
  private static instance: JarvisPersistence;
  private state: PersistedState;
  private isInitialized: boolean = false;

  private constructor() {
    this.state = this.getDefaultState();
  }

  public static getInstance(): JarvisPersistence {
    if (!JarvisPersistence.instance) {
      JarvisPersistence.instance = new JarvisPersistence();
    }
    return JarvisPersistence.instance;
  }

  private getDefaultState(): PersistedState {
    return {
      activeWorkspaceId: 'default',
      workspaces: {
        default: {
          id: 'default',
          name: 'Default Workspace',
          lastActivePanel: 'dashboard',
          createdAt: new Date(),
          updatedAt: new Date(),
          theme: 'cyberpunk'
        }
      },
      folders: {},
      messages: {},
      tradingPairs: {},
      swarmNodes: {},
      blockchainIdentities: {},
      sidebarOpen: true,
      inputMode: 'text',
      theme: 'cyberpunk',
      lastSystemStatus: 'OFFLINE'
    };
  }

  // ============================================================================
  // INITIALIZATION & LOADING
  // ============================================================================

  public async initialize(): Promise<PersistedState> {
    if (this.isInitialized) {
      return this.state;
    }

    try {
      const savedState = await jarvisDB.getItem<PersistedState>('jarvis_state');

      if (savedState) {
        this.state = {
          ...this.getDefaultState(),
          ...savedState,
          workspaces: {
            ...this.getDefaultState().workspaces,
            ...savedState.workspaces
          }
        };
      }

      this.isInitialized = true;
      return this.state;
    } catch (error) {
      console.error('JARVIS Persistence: Initialization failed', error);
      this.state = this.getDefaultState();
      this.isInitialized = true;
      return this.state;
    }
  }

  // ============================================================================
  // STATE PERSISTENCE
  // ============================================================================

  public async saveState(partialState: Partial<PersistedState>): Promise<void> {
    this.state = { ...this.state, ...partialState };
    try {
      await jarvisDB.setItem('jarvis_state', this.state);
    } catch (error) {
      console.error('JARVIS Persistence: Save failed', error);
    }
  }

  public async clearState(): Promise<void> {
    this.state = this.getDefaultState();
    try {
      await jarvisDB.clear();
    } catch (error) {
      console.error('JARVIS Persistence: Clear failed', error);
    }
  }

  // ============================================================================
  // PROJECT & FOLDER MANAGEMENT
  // ============================================================================

  public async createProjectFolder(folder: Omit<ProjectFolder, 'id' | 'createdAt' | 'updatedAt' | 'archived' | 'order'> & { id?: string }): Promise<ProjectFolder> {
    const folderId = folder.id || this.generateId();
    const newFolder: ProjectFolder = {
      id: folderId,
      name: folder.name,
      type: folder.type,
      createdAt: new Date(),
      updatedAt: new Date(),
      archived: false,
      parentId: folder.parentId,
      order: Object.keys(this.state.folders).length
    };

    this.state.folders[folderId] = newFolder;
    await this.saveState({ folders: this.state.folders });
    return newFolder;
  }

  public async renameProjectFolder(folderId: string, newName: string): Promise<ProjectFolder> {
    if (!this.state.folders[folderId]) {
      throw new Error(`Folder ${folderId} not found`);
    }

    const updatedFolder = {
      ...this.state.folders[folderId],
      name: newName,
      updatedAt: new Date()
    };

    this.state.folders[folderId] = updatedFolder;
    await this.saveState({ folders: this.state.folders });

    // Return a new object to ensure React re-renders
    return { ...updatedFolder };
  }

  public async archiveProjectFolder(folderId: string): Promise<ProjectFolder> {
    if (!this.state.folders[folderId]) {
      throw new Error(`Folder ${folderId} not found`);
    }

    const updatedFolder = {
      ...this.state.folders[folderId],
      archived: true,
      updatedAt: new Date()
    };

    this.state.folders[folderId] = updatedFolder;
    await this.saveState({ folders: this.state.folders });

    return { ...updatedFolder };
  }

  public async deleteProjectFolder(folderId: string): Promise<void> {
    // First, reassign any child folders to parent or root
    Object.values(this.state.folders).forEach(folder => {
      if (folder.parentId === folderId) {
        folder.parentId = undefined;
      }
    });

    // Remove the folder
    delete this.state.folders[folderId];

    // Clean up associated data
    delete this.state.messages[folderId];
    delete this.state.tradingPairs[folderId];
    delete this.state.swarmNodes[folderId];
    delete this.state.blockchainIdentities[folderId];

    await this.saveState({
      folders: this.state.folders,
      messages: this.state.messages,
      tradingPairs: this.state.tradingPairs,
      swarmNodes: this.state.swarmNodes,
      blockchainIdentities: this.state.blockchainIdentities
    });
  }

  public async reorderProjectFolders(newOrder: string[]): Promise<void> {
    newOrder.forEach((folderId, index) => {
      if (this.state.folders[folderId]) {
        this.state.folders[folderId] = {
          ...this.state.folders[folderId],
          order: index
        };
      }
    });

    await this.saveState({ folders: this.state.folders });
  }

  // ============================================================================
  // WORKSPACE MANAGEMENT
  // ============================================================================

  public async createWorkspace(name: string): Promise<ProjectWorkspace> {
    const workspaceId = this.generateId();
    const newWorkspace: ProjectWorkspace = {
      id: workspaceId,
      name,
      lastActivePanel: 'dashboard',
      createdAt: new Date(),
      updatedAt: new Date(),
      theme: this.state.theme
    };

    this.state.workspaces[workspaceId] = newWorkspace;
    await this.saveState({
      workspaces: this.state.workspaces,
      activeWorkspaceId: workspaceId
    });

    return newWorkspace;
  }

  public async switchWorkspace(workspaceId: string): Promise<ProjectWorkspace> {
    if (!this.state.workspaces[workspaceId]) {
      throw new Error(`Workspace ${workspaceId} not found`);
    }

    await this.saveState({ activeWorkspaceId: workspaceId });
    return this.state.workspaces[workspaceId];
  }

  public async renameWorkspace(workspaceId: string, newName: string): Promise<ProjectWorkspace> {
    if (!this.state.workspaces[workspaceId]) {
      throw new Error(`Workspace ${workspaceId} not found`);
    }

    const updatedWorkspace = {
      ...this.state.workspaces[workspaceId],
      name: newName,
      updatedAt: new Date()
    };

    this.state.workspaces[workspaceId] = updatedWorkspace;
    await this.saveState({ workspaces: this.state.workspaces });

    return { ...updatedWorkspace };
  }

  // ============================================================================
  // CHAT HISTORY MANAGEMENT
  // ============================================================================

  public async addMessage(projectId: string, message: Message): Promise<void> {
    if (!this.state.messages[projectId]) {
      this.state.messages[projectId] = [];
    }

    this.state.messages[projectId] = [...this.state.messages[projectId], message];
    await this.saveState({ messages: this.state.messages });
  }

  public async getMessages(projectId: string): Promise<Message[]> {
    return this.state.messages[projectId] || [];
  }

  public async clearMessages(projectId: string): Promise<void> {
    delete this.state.messages[projectId];
    await this.saveState({ messages: this.state.messages });
  }

  public async deleteMessage(projectId: string, messageId: string): Promise<void> {
    if (this.state.messages[projectId]) {
      this.state.messages[projectId] = this.state.messages[projectId].filter(msg => msg.id !== messageId);
      await this.saveState({ messages: this.state.messages });
    }
  }

  // ============================================================================
  // TRADING DATA MANAGEMENT
  // ============================================================================

  public async updateTradingPairs(projectId: string, pairs: TradingPair[]): Promise<void> {
    this.state.tradingPairs[projectId] = pairs;
    await this.saveState({ tradingPairs: this.state.tradingPairs });
  }

  public async getTradingPairs(projectId: string): Promise<TradingPair[]> {
    return this.state.tradingPairs[projectId] || [];
  }

  // ============================================================================
  // SWARM NETWORK MANAGEMENT
  // ============================================================================

  public async updateSwarmNodes(projectId: string, nodes: SwarmNode[]): Promise<void> {
    this.state.swarmNodes[projectId] = nodes;
    await this.saveState({ swarmNodes: this.state.swarmNodes });
  }

  public async getSwarmNodes(projectId: string): Promise<SwarmNode[]> {
    return this.state.swarmNodes[projectId] || [];
  }

  // ============================================================================
  // BLOCKCHAIN IDENTITY MANAGEMENT
  // ============================================================================

  public async updateBlockchainIdentity(projectId: string, identity: BlockchainIdentity): Promise<void> {
    this.state.blockchainIdentities[projectId] = identity;
    await this.saveState({ blockchainIdentities: this.state.blockchainIdentities });
  }

  public async getBlockchainIdentity(projectId: string): Promise<BlockchainIdentity | undefined> {
    return this.state.blockchainIdentities[projectId];
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  private generateId(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }

  public getCurrentState(): PersistedState {
    return { ...this.state };
  }
}

export const persistence = JarvisPersistence.getInstance();
export default persistence;
