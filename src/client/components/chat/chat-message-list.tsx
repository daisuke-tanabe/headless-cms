import { ScrollArea } from "@/components/ui/scroll-area"
import { MessageSquare } from "lucide-react"
import { useEffect, useRef } from "react"
import type { ChatMessage } from "~/shared"
import { ApprovalMessage } from "./approval-message"
import { TypingIndicator } from "./typing-indicator"

type ChatMessageListProps = {
  readonly messages: readonly ChatMessage[]
  readonly isLoading?: boolean
}

const examplePrompts = [
  "「AIの最新トレンド」という記事を作成して",
  "記事一覧を見せて",
  "最新の記事のタイトルを変更して",
]

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-6 gap-4">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
        <MessageSquare className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="space-y-1">
        <p className="text-[13px] font-medium">AI アシスタント</p>
        <p className="text-xs text-muted-foreground">こんなことができます</p>
      </div>
      <div className="space-y-1.5 w-full max-w-[220px]">
        {examplePrompts.map((prompt) => (
          <p
            key={prompt}
            className="text-xs text-muted-foreground bg-secondary rounded-md px-3 py-2 text-left leading-relaxed"
          >
            {prompt}
          </p>
        ))}
      </div>
    </div>
  )
}

export function ChatMessageList({ messages, isLoading = false }: ChatMessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null)
  const messageCount = messages.length

  // biome-ignore lint/correctness/useExhaustiveDependencies: scroll on message/loading changes
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messageCount, isLoading])

  const visibleMessages = messages.filter((m) => {
    if (m.type === "text" && m.content.startsWith("[システム]")) {
      return false
    }
    return true
  })

  if (visibleMessages.length === 0 && !isLoading) {
    return (
      <div className="flex-1 overflow-hidden">
        <EmptyState />
      </div>
    )
  }

  return (
    <ScrollArea className="flex-1">
      <div className="p-4 space-y-3">
        {visibleMessages.map((message, index) => (
          <ChatMessageItem key={`msg-${index}`} message={message} />
        ))}
        {isLoading ? <TypingIndicator /> : null}
        <div ref={bottomRef} />
      </div>
    </ScrollArea>
  )
}

function ChatMessageItem({ message }: { readonly message: ChatMessage }) {
  if (message.type === "text") {
    const isUser = message.role === "user"
    return (
      <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
        <div
          className={`max-w-[85%] sm:max-w-[80%] text-[13px] leading-relaxed ${
            isUser
              ? "bg-foreground text-background rounded-2xl rounded-br-sm px-3.5 py-2"
              : "bg-secondary text-foreground rounded-2xl rounded-bl-sm px-3.5 py-2"
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
