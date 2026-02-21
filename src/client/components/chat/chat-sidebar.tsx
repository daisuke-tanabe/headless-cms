import { X } from "lucide-react"
import { ChatInput } from "./chat-input"
import { ChatMessageList } from "./chat-message-list"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { useSendMessage } from "@/hooks/use-chat"
import { useIsMobile } from "@/hooks/use-mobile"
import { useChatStore } from "@/stores/chat-store"

function ChatContent() {
  const { messages, isLoading, toggleSidebar } = useChatStore()
  const sendMessage = useSendMessage()

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="font-semibold text-sm">AI アシスタント</h2>
        <Button variant="ghost" size="icon" onClick={toggleSidebar}>
          <X className="h-4 w-4" />
          <span className="sr-only">閉じる</span>
        </Button>
      </div>
      <ChatMessageList messages={messages} />
      <ChatInput onSend={sendMessage} disabled={isLoading} />
    </div>
  )
}

function MobileChatSidebar() {
  const { isOpen, toggleSidebar } = useChatStore()

  return (
    <Sheet open={isOpen} onOpenChange={toggleSidebar}>
      <SheetContent side="right" className="w-full sm:w-96 p-0 [&>button]:hidden">
        <SheetHeader className="sr-only">
          <SheetTitle>AI アシスタント</SheetTitle>
        </SheetHeader>
        <ChatContent />
      </SheetContent>
    </Sheet>
  )
}

function DesktopChatSidebar() {
  const { isOpen } = useChatStore()

  if (!isOpen) return null

  return (
    <div className="fixed right-0 top-14 bottom-0 w-80 border-l bg-background z-50">
      <ChatContent />
    </div>
  )
}

export function ChatSidebar() {
  const isMobile = useIsMobile()

  if (isMobile) {
    return <MobileChatSidebar />
  }

  return <DesktopChatSidebar />
}
