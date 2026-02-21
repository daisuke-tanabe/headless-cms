import { useSendMessage } from "@/hooks/use-chat"
import { useChatStore } from "@/stores/chat-store"
import { X } from "lucide-react"
import { ChatInput } from "./chat-input"
import { ChatMessageList } from "./chat-message-list"

interface ChatPanelProps {
  readonly onClose?: () => void
}

export function ChatPanel({ onClose }: ChatPanelProps) {
  const { messages, isLoading } = useChatStore()
  const sendMessage = useSendMessage()

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 h-12 border-b">
        <h2 className="text-[13px] font-medium">AI アシスタント</h2>
        {onClose ? (
          <button
            type="button"
            onClick={onClose}
            className="h-7 w-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors duration-150"
          >
            <X className="h-3.5 w-3.5" />
            <span className="sr-only">閉じる</span>
          </button>
        ) : null}
      </div>
      <ChatMessageList messages={messages} isLoading={isLoading} />
      <ChatInput onSend={sendMessage} disabled={isLoading} />
    </div>
  )
}
