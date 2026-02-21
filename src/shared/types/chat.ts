export type ChatMessage =
  | { readonly type: "text"; readonly role: "user" | "assistant"; readonly content: string }
  | {
      readonly type: "approval"
      readonly articleId: string
      readonly articleTitle: string
      readonly status: "pending" | "approved" | "cancelled"
    }

export type PageContext =
  | { readonly page: "dashboard" }
  | { readonly page: "articles"; readonly pageNum: number }
  | {
      readonly page: "article_new"
      readonly editor: { readonly title: string; readonly body: string }
    }
  | {
      readonly page: "article_edit"
      readonly article: { readonly id: string; readonly title: string; readonly body: string }
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
      readonly data: {
        readonly id?: string
        readonly title?: string
        readonly body?: string
      }
    }
  | {
      readonly type: "delete_article"
      readonly data: { readonly id: string; readonly title: string }
      readonly requiresApproval: true
    }

export type ChatResponse = {
  readonly message: string
  readonly action: ChatAction | null
}
