import type { PageContext } from "@ai-cms/shared"
import { useCallback } from "react"
import { useLocation } from "react-router"
import { apiClient } from "@/lib/api-client"
import { useChatStore } from "@/stores/chat-store"

const usePageContext = (): PageContext => {
	const location = useLocation()
	const path = location.pathname

	if (path === "/dashboard") {
		return { page: "dashboard" }
	}

	if (path === "/articles/new") {
		// TODO: Phase 5 でエディタの現在値を取得
		return { page: "article_new", editor: { title: "", body: "" } }
	}

	if (path.startsWith("/articles/") && path !== "/articles") {
		// TODO: Phase 5 で記事の現在値を取得
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

				// TODO: Phase 5 で action を use-action-executor に渡す
				return data
			} catch {
				addMessage({
					type: "text",
					role: "assistant",
					content: "エラーが発生しました。もう一度お試しください。",
				})
				return null
			} finally {
				setLoading(false)
			}
		},
		[messages, context, addMessage, setLoading],
	)
}
