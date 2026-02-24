import { create } from "zustand"
import { immer } from "zustand/middleware/immer"
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

const trimHistory = (messages: readonly ChatMessage[]): ChatMessage[] => {
  const textMessages = messages.filter((m) => m.type === "text")
  const maxMessages = MAX_CONVERSATION_ROUNDS * 2

  if (textMessages.length <= maxMessages) {
    return messages.slice()
  }

  const oldestTextToKeep = textMessages[textMessages.length - maxMessages]
  if (!oldestTextToKeep) return messages.slice()

  const oldestIndex = messages.indexOf(oldestTextToKeep)
  return messages.slice(oldestIndex)
}

export const useChatStore = create<ChatStore>()(
  immer((set) => ({
    messages: [],
    isLoading: false,

    addMessage: (message) =>
      set((draft) => {
        draft.messages = trimHistory([...draft.messages, message])
      }),

    updateLastApproval: (status) =>
      set((draft) => {
        for (let i = draft.messages.length - 1; i >= 0; i--) {
          const msg = draft.messages[i]
          if (msg?.type === "approval" && msg.status === "pending") {
            msg.status = status
            break
          }
        }
      }),

    setLoading: (loading) => set({ isLoading: loading }),

    clearMessages: () => set({ messages: [] }),
  })),
)
