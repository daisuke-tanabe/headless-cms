import type { Field } from "./content-type.js"

export type ChatMessage =
  | { readonly type: "text"; readonly role: "user" | "assistant"; readonly content: string }
  | {
      readonly type: "approval"
      readonly entryId: string
      readonly entryLabel: string
      readonly contentTypeId: string
      readonly status: "pending" | "approved" | "cancelled"
    }

export type PageContext =
  | { readonly page: "dashboard" }
  | { readonly page: "content_type_list" }
  | {
      readonly page: "content_type_detail"
      readonly contentTypeId: string
      readonly contentTypeName: string
    }
  | {
      readonly page: "entry_list"
      readonly contentTypeId: string
      readonly contentTypeName: string
      readonly fields: Field[]
      readonly pageNum: number
    }
  | {
      readonly page: "entry_new"
      readonly contentTypeId: string
      readonly contentTypeName: string
      readonly fields: Field[]
      readonly editor: Record<string, unknown>
    }
  | {
      readonly page: "entry_edit"
      readonly contentTypeId: string
      readonly contentTypeName: string
      readonly fields: Field[]
      readonly entry: { readonly id: string; readonly data: Record<string, unknown> }
    }

export type ChatRequest = {
  readonly message: string
  readonly history: readonly { readonly role: "user" | "assistant"; readonly content: string }[]
  readonly context: PageContext
}

export type ChatAction =
  | {
      readonly type: "open_editor"
      readonly to: string
      readonly mode: "create" | "edit"
      readonly data: Record<string, unknown>
    }
  | {
      readonly type: "delete_entry"
      readonly data: { readonly id: string; readonly label: string; readonly contentTypeId: string }
      readonly requiresApproval: true
    }

export type ChatResponse = {
  readonly message: string
  readonly action: ChatAction | null
}
