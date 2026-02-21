import { create } from "zustand"
import type { ChatMessage } from "~/shared"
import { MAX_CONVERSATION_ROUNDS } from "~/shared"

type ChatStore = {
  readonly messages: readonly ChatMessage[]
  readonly isLoading: boolean
  readonly addMessage: (message: ChatMessage) => void
  readonly updateLastApproval: (status: "approved" | "cancelled") => void
  readonly setLoading: (loading: boolean) => void
  readonly clearMessages: () => void
}

const trimHistory = (messages: readonly ChatMessage[]): readonly ChatMessage[] => {
  const textMessages = messages.filter((m) => m.type === "text")
  const maxMessages = MAX_CONVERSATION_ROUNDS * 2

  if (textMessages.length <= maxMessages) {
    return messages
  }

  const oldestTextToKeep = textMessages[textMessages.length - maxMessages]
  if (!oldestTextToKeep) return messages

  const oldestIndex = messages.indexOf(oldestTextToKeep)
  return messages.slice(oldestIndex)
}

export const useChatStore = create<ChatStore>((set) => ({
  messages: [],
  isLoading: false,

  addMessage: (message) =>
    set((state) => ({
      messages: trimHistory([...state.messages, message]),
    })),

  updateLastApproval: (status) =>
    set((state) => {
      const messages = [...state.messages]
      for (let i = messages.length - 1; i >= 0; i--) {
        const msg = messages[i]
        if (msg?.type === "approval" && msg.status === "pending") {
          messages[i] = { ...msg, status }
          break
        }
      }
      return { messages }
    }),

  setLoading: (loading) => set({ isLoading: loading }),

  clearMessages: () => set({ messages: [] }),
}))
