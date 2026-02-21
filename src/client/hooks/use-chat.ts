import type { PageContext } from "~/shared"
import { useCallback } from "react"
import { useLocation } from "react-router"
import { toast } from "sonner"
import { apiClient } from "@/lib/api-client"
import { useActionExecutor } from "./use-action-executor"
import { useChatStore } from "@/stores/chat-store"

const usePageContext = (): PageContext => {
  const location = useLocation()
  const path = location.pathname

  if (path === "/dashboard") {
    return { page: "dashboard" }
  }

  if (path === "/articles/new") {
    return { page: "article_new", editor: { title: "", body: "" } }
  }

  if (path.startsWith("/articles/") && path !== "/articles") {
    const id = path.split("/").pop() ?? ""
    return { page: "article_edit", article: { id, title: "", body: "" } }
  }

  if (path === "/articles") {
    return { page: "articles", pageNum: 1 }
  }

  return { page: "dashboard" }
}

export function useSendMessage() {
  const { messages, addMessage, setLoading } = useChatStore()
  const context = usePageContext()
  const executeAction = useActionExecutor()

  return useCallback(
    async (message: string) => {
      addMessage({ type: "text", role: "user", content: message })
      setLoading(true)

      try {
        const history = messages
          .filter((m) => m.type === "text")
          .map((m) => {
            if (m.type !== "text") throw new Error("unreachable")
            return { role: m.role, content: m.content }
          })

        const res = await apiClient.api.chat.$post({
          json: {
            message,
            history: [...history],
            context,
          },
        })
        const data = await res.json()

        addMessage({ type: "text", role: "assistant", content: data.message })

        if ("action" in data && data.action) {
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
