import { create } from "zustand"

type PendingContent = Record<string, unknown>

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
