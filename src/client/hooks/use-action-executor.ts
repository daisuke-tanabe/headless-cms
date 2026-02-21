import { useCallback } from "react"
import { useNavigate } from "react-router"
import { useChatStore } from "@/stores/chat-store"
import { useEditorStore } from "@/stores/editor-store"
import type { ChatAction } from "~/shared"

export function useActionExecutor() {
  const navigate = useNavigate()
  const addMessage = useChatStore((s) => s.addMessage)
  const setPendingContent = useEditorStore((s) => s.setPendingContent)

  return useCallback(
    (action: ChatAction | null) => {
      if (!action) return

      switch (action.type) {
        case "open_editor": {
          setPendingContent({
            title: action.data.title,
            body: action.data.body,
          })
          navigate(action.to)
          break
        }
        case "delete_article": {
          addMessage({
            type: "approval",
            articleId: action.data.id,
            articleTitle: action.data.title,
            status: "pending",
          })
          break
        }
      }
    },
    [navigate, addMessage, setPendingContent],
  )
}
