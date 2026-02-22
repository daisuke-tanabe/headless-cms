import { useCallback } from "react"
import { useNavigate } from "react-router"
import { executeAction } from "@/lib/action-executor"
import { useChatStore } from "@/stores/chat-store"
import { useEditorStore } from "@/stores/editor-store"
import type { ChatAction } from "~/shared"

export function useActionExecutor() {
  const navigate = useNavigate()
  const addMessage = useChatStore((s) => s.addMessage)
  const setPendingContent = useEditorStore((s) => s.setPendingContent)

  return useCallback(
    (action: ChatAction | null) =>
      executeAction(action, { navigate, addMessage, setPendingContent }),
    [navigate, addMessage, setPendingContent],
  )
}
