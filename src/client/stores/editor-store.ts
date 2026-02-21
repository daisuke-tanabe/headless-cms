import { create } from "zustand"

type PendingContent = {
  readonly title?: string
  readonly body?: string
}

type EditorStore = {
  readonly pendingContent: PendingContent | null
  readonly setPendingContent: (content: PendingContent) => void
  readonly clearPendingContent: () => void
}

export const useEditorStore = create<EditorStore>((set) => ({
  pendingContent: null,
  setPendingContent: (content) => set({ pendingContent: content }),
  clearPendingContent: () => set({ pendingContent: null }),
}))
