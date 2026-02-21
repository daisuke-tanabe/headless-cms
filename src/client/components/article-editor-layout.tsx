import { ChatPanel } from "@/components/chat/chat-sidebar"
import { PageBreadcrumb } from "@/components/page-breadcrumb"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { useIsMobile } from "@/hooks/use-mobile"
import { MessageSquare, X } from "lucide-react"
import { type ReactNode, useState } from "react"
import { Link } from "react-router"

type BreadcrumbSegment = {
  readonly label: string
  readonly to?: string
}

type EditorShellProps = {
  readonly children: ReactNode
  readonly breadcrumbItems: readonly BreadcrumbSegment[]
  readonly actionButton: ReactNode
  readonly closePath: string
}

export function EditorShell({
  children,
  breadcrumbItems,
  actionButton,
  closePath,
}: EditorShellProps) {
  const isMobile = useIsMobile()
  const [isChatOpen, setIsChatOpen] = useState(false)

  if (isMobile) {
    return (
      <div className="flex flex-col h-screen">
        {/* Mobile toolbar */}
        <div className="flex items-center justify-between h-12 border-b px-3 flex-shrink-0">
          <Link
            to={closePath}
            className="text-[13px] text-muted-foreground hover:text-foreground transition-colors duration-150"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">閉じる</span>
          </Link>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsChatOpen(true)}
              className="h-8 w-8 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors duration-150"
            >
              <MessageSquare className="h-4 w-4" />
              <span className="sr-only">AI アシスタント</span>
            </button>
            {actionButton}
          </div>
        </div>

        {/* Editor area */}
        <div className="flex-1 overflow-auto">{children}</div>

        {/* Mobile AI chat sheet */}
        <Sheet open={isChatOpen} onOpenChange={setIsChatOpen}>
          <SheetContent side="left" className="w-full sm:w-96 p-0 [&>button]:hidden">
            <SheetHeader className="sr-only">
              <SheetTitle>AI アシスタント</SheetTitle>
            </SheetHeader>
            <ChatPanel onClose={() => setIsChatOpen(false)} />
          </SheetContent>
        </Sheet>
      </div>
    )
  }

  return (
    <div className="flex h-screen">
      {/* Icon bar */}
      <div className="w-12 border-r bg-muted/30 flex flex-col items-center pt-3 flex-shrink-0">
        <button
          type="button"
          onClick={() => setIsChatOpen((prev) => !prev)}
          className={`h-8 w-8 rounded-md flex items-center justify-center transition-colors duration-150 ${
            isChatOpen
              ? "bg-secondary text-foreground"
              : "text-muted-foreground hover:text-foreground hover:bg-secondary"
          }`}
        >
          <MessageSquare className="h-4 w-4" />
          <span className="sr-only">AI アシスタント</span>
        </button>
      </div>

      {/* Chat panel (toggleable) */}
      {isChatOpen ? (
        <div className="w-80 border-r flex-shrink-0">
          <ChatPanel onClose={() => setIsChatOpen(false)} />
        </div>
      ) : null}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Toolbar */}
        <div className="flex items-center justify-between h-12 border-b px-4 flex-shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <Link
              to={closePath}
              className="text-[13px] text-muted-foreground hover:text-foreground transition-colors duration-150 flex-shrink-0"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">閉じる</span>
            </Link>
            <PageBreadcrumb items={breadcrumbItems} className="mb-0" />
          </div>
          <div className="flex-shrink-0">{actionButton}</div>
        </div>

        {/* Editor area */}
        <div className="flex-1 overflow-auto">{children}</div>
      </div>
    </div>
  )
}
