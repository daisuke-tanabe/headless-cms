import { match } from "ts-pattern"
import type { ChatAction, ChatMessage } from "~/shared"

type ActionHandlers = {
  readonly navigate: (to: string) => void
  readonly addMessage: (message: ChatMessage) => void
  readonly setPendingContent: (content: Record<string, unknown>) => void
}

export const executeAction = (action: ChatAction | null, handlers: ActionHandlers): void => {
  if (!action) return

  match(action)
    .with({ type: "open_editor" }, (a) => {
      handlers.setPendingContent(a.data)
      handlers.navigate(a.to)
    })
    .with({ type: "delete_entry" }, (a) => {
      handlers.addMessage({
        type: "approval",
        entryId: a.data.id,
        entryLabel: a.data.label,
        contentTypeId: a.data.contentTypeId,
        status: "pending",
      })
    })
    .exhaustive()
}
