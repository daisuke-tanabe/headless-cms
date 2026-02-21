import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { useSendMessage } from "@/hooks/use-chat"
import { useIsMobile } from "@/hooks/use-mobile"
import { useChatStore } from "@/stores/chat-store"
import { X } from "lucide-react"
import { ChatInput } from "./chat-input"
import { ChatMessageList } from "./chat-message-list"

function ChatContent() {
  const { messages, isLoading, toggleSidebar } = useChatStore()
  const sendMessage = useSendMessage()

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 h-12 border-b">
        <h2 className="text-[13px] font-medium">AI アシスタント</h2>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              onClick={toggleSidebar}
              className="h-7 w-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors duration-150"
            >
              <X className="h-3.5 w-3.5" />
              <span className="sr-only">閉じる</span>
            </button>
          </TooltipTrigger>
          <TooltipContent>閉じる</TooltipContent>
        </Tooltip>
      </div>
      <ChatMessageList messages={messages} isLoading={isLoading} />
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
    <div className="fixed right-0 top-12 bottom-0 w-80 border-l bg-background z-50">
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
