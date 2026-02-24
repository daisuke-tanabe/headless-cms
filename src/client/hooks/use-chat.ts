import { useCallback } from "react"
import { useLocation } from "react-router"
import { toast } from "sonner"
import { apiClient } from "@/lib/api-client"
import { buildPageContext } from "@/lib/page-context"
import { useChatStore } from "@/stores/chat-store"
import type { ChatMessage } from "~/shared"
import { useActionExecutor } from "./use-action-executor"

type TextMessage = Extract<ChatMessage, { type: "text" }>

export function useSendMessage() {
  const { messages, addMessage, setLoading } = useChatStore()
  const location = useLocation()
  const context = buildPageContext(location.pathname)
  const executeAction = useActionExecutor()

  return useCallback(
    async (message: string) => {
      addMessage({ type: "text", role: "user", content: message })
      setLoading(true)

      try {
        const history = messages
          .filter((m): m is TextMessage => m.type === "text")
          .map((m) => ({ role: m.role, content: m.content }))

        const res = await apiClient.api.chat.$post({
          json: {
            message,
            history: [...history],
            context,
          },
        })

        if (!res.ok) {
          const errorData = await res.json()
          const errorMessage = "error" in errorData ? errorData.error : "エラーが発生しました。"
          addMessage({ type: "text", role: "assistant", content: errorMessage })
          return null
        }

        const data = await res.json()

        addMessage({ type: "text", role: "assistant", content: data.message })

        if (data.action) {
          executeAction(data.action)
        }

        return data
      } catch {
        addMessage({
          type: "text",
          role: "assistant",
          content: "エラーが発生しました。もう一度お試しください。",
        })
        toast.error("メッセージの送信に失敗しました")
        return null
      } finally {
        setLoading(false)
      }
    },
    [messages, context, addMessage, setLoading, executeAction],
  )
}
