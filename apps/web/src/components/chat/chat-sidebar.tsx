import { ChatInput } from "./chat-input"
import { ChatMessageList } from "./chat-message-list"
import { Button } from "@/components/ui/button"
import { useSendMessage } from "@/hooks/use-chat"
import { useChatStore } from "@/stores/chat-store"

export function ChatSidebar() {
	const { messages, isOpen, isLoading, toggleSidebar } = useChatStore()
	const sendMessage = useSendMessage()

	if (!isOpen) return null

	return (
		<div className="fixed right-0 top-14 bottom-0 w-80 border-l bg-background flex flex-col z-50">
			<div className="flex items-center justify-between p-4 border-b">
				<h2 className="font-semibold text-sm">AI アシスタント</h2>
				<Button variant="ghost" size="sm" onClick={toggleSidebar}>
					閉じる
				</Button>
			</div>
			<ChatMessageList messages={messages} />
			<ChatInput onSend={sendMessage} disabled={isLoading} />
		</div>
	)
}
