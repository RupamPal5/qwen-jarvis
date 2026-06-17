import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import localforage from 'localforage'

export interface TerminalOutput {
  id: string
  content: string
  timestamp: Date
  projectId: string
}

interface TerminalState {
  outputs: Record<string, TerminalOutput[]> // key is projectId
  addOutput: (projectId: string, content: string) => void
  getOutputs: (projectId: string) => TerminalOutput[]
  clearOutputs: (projectId: string) => void
}

// Configure localforage for terminal
localforage.config({
  name: 'jarvis-terminal',
  storeName: 'terminal_data'
})

export const useTerminalStore = create<TerminalState>()(
  persist(
    (set, get) => ({
      outputs: {},
      addOutput: (projectId, content) => {
        const newOutput: TerminalOutput = {
          id: Math.random().toString(36).substr(2, 9),
          content,
          timestamp: new Date(),
          projectId
        }
        set((state) => ({
          outputs: {
            ...state.outputs,
            [projectId]: [...(state.outputs[projectId] || []), newOutput]
          }
        }))
      },
      getOutputs: (projectId) => {
        return get().outputs[projectId] || []
      },
      clearOutputs: (projectId) => {
        set((state) => ({
          outputs: {
            ...state.outputs,
            [projectId]: []
          }
        }))
      }
    }),
    {
      name: 'terminal-storage',
      storage: createJSONStorage(() => ({
        getItem: async (name) => {
          const item = await localforage.getItem(name)
          return item ? JSON.parse(item as string) : null
        },
        setItem: async (name, value) => {
          await localforage.setItem(name, JSON.stringify(value))
        },
        removeItem: async (name) => {
          await localforage.removeItem(name)
        }
      }))
    }
  )
)
