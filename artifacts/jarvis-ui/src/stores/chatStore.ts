import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import localforage from 'localforage'

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  projectId: string
}

interface ChatState {
  messages: Record<string, ChatMessage[]> // key is projectId
  addMessage: (projectId: string, message: Omit<ChatMessage, 'id' | 'timestamp'>) => void
  getMessages: (projectId: string) => ChatMessage[]
  clearMessages: (projectId: string) => void
}

// Configure localforage for chat
localforage.config({
  name: 'jarvis-chat',
  storeName: 'chat_data'
})

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      messages: {},
      addMessage: (projectId, messageData) => {
        const newMessage: ChatMessage = {
          ...messageData,
          id: Math.random().toString(36).substr(2, 9),
          timestamp: new Date()
        }
        set((state) => ({
          messages: {
            ...state.messages,
            [projectId]: [...(state.messages[projectId] || []), newMessage]
          }
        }))
      },
      getMessages: (projectId) => {
        return get().messages[projectId] || []
      },
      clearMessages: (projectId) => {
        set((state) => ({
          messages: {
            ...state.messages,
            [projectId]: []
          }
        }))
      }
    }),
    {
      name: 'chat-storage',
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
