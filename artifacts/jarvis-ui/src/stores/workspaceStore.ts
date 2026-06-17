import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import localforage from 'localforage'

export interface Project {
  id: string
  title: string
  associatedFiles: string[]
  timestamp: Date
  // Add other project-related fields
}

interface WorkspaceState {
  projects: Project[]
  activeProjectId: string | null
  addProject: (project: Omit<Project, 'id'>) => void
  updateProject: (id: string, updates: Partial<Project>) => void
  deleteProject: (id: string) => void
  setActiveProject: (id: string | null) => void
  getActiveProject: () => Project | null
}

// Configure localforage
localforage.config({
  name: 'jarvis-workspace',
  storeName: 'workspace_data'
})

export const useWorkspaceStore = create<WorkspaceState>()(
  persist(
    (set, get) => ({
      projects: [],
      activeProjectId: null,
      addProject: (projectData) => {
        const newProject: Project = {
          ...projectData,
          id: Math.random().toString(36).substr(2, 9)
        }
        set((state) => ({
          projects: [...state.projects, newProject]
        }))
      },
      updateProject: (id, updates) => {
        set((state) => ({
          projects: state.projects.map(project =>
            project.id === id ? { ...project, ...updates } : project
          )
        }))
      },
      deleteProject: (id) => {
        set((state) => ({
          projects: state.projects.filter(project => project.id !== id),
          activeProjectId: state.activeProjectId === id ? null : state.activeProjectId
        }))
      },
      setActiveProject: (id) => {
        set({ activeProjectId: id })
      },
      getActiveProject: () => {
        const state = get()
        return state.projects.find(project => project.id === state.activeProjectId) || null
      }
    }),
    {
      name: 'workspace-storage',
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
