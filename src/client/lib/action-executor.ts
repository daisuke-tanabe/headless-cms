import { match } from "ts-pattern"
import type { ChatAction, ChatMessage } from "~/shared"

type ActionHandlers = {
  readonly navigate: (to: string) => void
  readonly addMessage: (message: ChatMessage) => void
  readonly setPendingContent: (content: { readonly title?: string; readonly body?: string }) => void
}

export const executeAction = (action: ChatAction | null, handlers: ActionHandlers): void => {
  if (!action) return

  match(action)
    .with({ type: "open_editor" }, (a) => {
      handlers.setPendingContent({ title: a.data.title, body: a.data.body })
      handlers.navigate(a.to)
    })
    .with({ type: "delete_article" }, (a) => {
      handlers.addMessage({
        type: "approval",
        articleId: a.data.id,
        articleTitle: a.data.title,
        status: "pending",
      })
    })
    .exhaustive()
}
