import { create } from "zustand"
import type { Field } from "~/shared"

type PageExtras = {
  readonly contentTypeId?: string
  readonly contentTypeName?: string
  readonly fields?: Field[]
  readonly entryId?: string
  readonly entryData?: Record<string, unknown>
  readonly editorData?: Record<string, unknown>
  readonly pageNum?: number
}

type PageContextStore = {
  readonly extras: PageExtras
  readonly setExtras: (extras: PageExtras) => void
  readonly clearExtras: () => void
}

export const usePageContextStore = create<PageContextStore>((set) => ({
  extras: {},
  setExtras: (extras) => set({ extras }),
  clearExtras: () => set({ extras: {} }),
}))
