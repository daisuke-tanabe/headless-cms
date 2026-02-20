import type { ChatMessage } from "@ai-cms/shared"
import { useEffect, useRef } from "react"
import { ApprovalMessage } from "./approval-message"

type ChatMessageListProps = {
	readonly messages: readonly ChatMessage[]
}

export function ChatMessageList({ messages }: ChatMessageListProps) {
	const bottomRef = useRef<HTMLDivElement>(null)

	useEffect(() => {
		bottomRef.current?.scrollIntoView({ behavior: "smooth" })
	}, [messages])

	const visibleMessages = messages.filter((m) => {
		if (m.type === "text" && m.content.startsWith("[システム]")) {
			return false
		}
		return true
	})

	return (
		<div className="flex-1 overflow-y-auto p-4 space-y-4">
			{visibleMessages.map((message, index) => (
				<ChatMessageItem key={`msg-${index}`} message={message} />
			))}
			<div ref={bottomRef} />
		</div>
	)
}

function ChatMessageItem({ message }: { readonly message: ChatMessage }) {
	if (message.type === "text") {
		const isUser = message.role === "user"
		return (
			<div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
				<div
					className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
						isUser ? "bg-primary text-primary-foreground" : "bg-muted"
					}`}
				>
					{message.content}
				</div>
			</div>
		)
	}

	if (message.type === "approval") {
		return (
			<ApprovalMessage
				articleId={message.articleId}
				articleTitle={message.articleTitle}
				status={message.status}
			/>
		)
	}

	return null
}
