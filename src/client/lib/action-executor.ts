import type { ChatAction, ChatMessage } from "~/shared"

type ActionHandlers = {
  readonly navigate: (to: string) => void
  readonly addMessage: (message: ChatMessage) => void
  readonly setPendingContent: (content: { readonly title?: string; readonly body?: string }) => void
}

export const executeAction = (action: ChatAction | null, handlers: ActionHandlers): void => {
  if (!action) return

  switch (action.type) {
    case "open_editor": {
      handlers.setPendingContent({
        title: action.data.title,
        body: action.data.body,
      })
      handlers.navigate(action.to)
      break
    }
    case "delete_article": {
      handlers.addMessage({
        type: "approval",
        articleId: action.data.id,
        articleTitle: action.data.title,
        status: "pending",
      })
      break
    }
  }
}
