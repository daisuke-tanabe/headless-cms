import { ChatSidebar } from "@/components/chat/chat-sidebar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { useChatStore } from "@/stores/chat-store"
import { SignOutButton, useAuth } from "@clerk/clerk-react"
import { Menu, MessageSquare, Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { Link, Outlet, useLocation } from "react-router"

const navItems = [
  { to: "/dashboard", label: "トップ", match: "/dashboard" },
  { to: "/articles", label: "記事一覧", match: "/articles" },
] as const

function ThemeToggle() {
  const { setTheme, resolvedTheme } = useTheme()

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
        >
          <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">テーマ切替</span>
        </Button>
      </TooltipTrigger>
      <TooltipContent>テーマ切替</TooltipContent>
    </Tooltip>
  )
}

export function RootLayout() {
  const { isSignedIn } = useAuth()
  const toggleSidebar = useChatStore((s) => s.toggleSidebar)
  const { pathname } = useLocation()

  const isActive = (match: string) => pathname.startsWith(match)

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex items-center justify-between h-14 px-4">
          <Link to="/" className="font-bold text-lg">
            AI CMS
          </Link>
          {isSignedIn ? (
            <nav className="flex items-center gap-2">
              {/* Desktop nav */}
              <div className="hidden md:flex items-center gap-2">
                {navItems.map((item) => (
                  <Link key={item.to} to={item.to}>
                    <Button variant={isActive(item.match) ? "secondary" : "ghost"} size="sm">
                      {item.label}
                    </Button>
                  </Link>
                ))}
                <SignOutButton>
                  <Button variant="ghost" size="sm">
                    ログアウト
                  </Button>
                </SignOutButton>
              </div>

              <ThemeToggle />

              {/* AI button - always visible */}
              <Button variant="outline" size="sm" onClick={toggleSidebar}>
                <MessageSquare className="h-4 w-4 mr-1" />
                AI
              </Button>

              {/* Mobile hamburger menu */}
              <div className="md:hidden">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <Menu className="h-5 w-5" />
                          <span className="sr-only">メニュー</span>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>メニュー</TooltipContent>
                    </Tooltip>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    {navItems.map((item) => (
                      <DropdownMenuItem key={item.to} asChild>
                        <Link to={item.to} className="w-full">
                          {isActive(item.match) ? `● ${item.label}` : item.label}
                        </Link>
                      </DropdownMenuItem>
                    ))}
                    <DropdownMenuSeparator />
                    <SignOutButton>
                      <DropdownMenuItem className="w-full cursor-pointer">
                        ログアウト
                      </DropdownMenuItem>
                    </SignOutButton>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </nav>
          ) : (
            <ThemeToggle />
          )}
        </div>
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
      {isSignedIn ? <ChatSidebar /> : null}
    </div>
  )
}
