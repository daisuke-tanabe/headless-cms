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
  "最新の記事を編集して、タイトルを変更して",
]

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-4 gap-4">
      <MessageSquare className="h-10 w-10 text-muted-foreground/40" />
      <div>
        <p className="text-sm font-medium mb-1">AI アシスタントに話しかけてみましょう</p>
        <p className="text-xs text-muted-foreground">例えばこんなことができます:</p>
      </div>
      <div className="space-y-2 w-full max-w-[240px]">
        {examplePrompts.map((prompt) => (
          <p
            key={prompt}
            className="text-xs text-muted-foreground bg-muted rounded-md px-3 py-2 text-left"
          >
            "{prompt}"
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
      <div className="p-4 space-y-4">
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
          className={`max-w-[85%] sm:max-w-[80%] rounded-lg px-3 py-2 text-sm ${
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
