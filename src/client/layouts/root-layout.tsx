import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { SignOutButton, useAuth } from "@clerk/clerk-react"
import { Menu } from "lucide-react"
import { Link, Outlet, useLocation } from "react-router"

const navItems = [
  { to: "/dashboard", label: "ダッシュボード", match: "/dashboard" },
  { to: "/articles", label: "記事", match: "/articles" },
  { to: "/settings", label: "設定", match: "/settings" },
] as const

export function RootLayout() {
  const { isSignedIn } = useAuth()
  const { pathname } = useLocation()

  const isActive = (match: string) => pathname.startsWith(match)

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur-lg">
        <div className="max-w-3xl mx-auto flex items-center justify-between h-12 px-4">
          <div className="flex items-center gap-6">
            <Link to="/" className="text-sm font-semibold text-foreground">
              AI CMS
            </Link>

            {isSignedIn ? (
              <nav className="hidden md:flex items-center gap-1">
                {navItems.map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={`px-3 py-1.5 text-[13px] rounded-md transition-colors duration-150 ${
                      isActive(item.match)
                        ? "text-foreground font-medium bg-secondary"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            ) : null}
          </div>

          {isSignedIn ? (
            <div className="flex items-center gap-2">
              <div className="hidden md:block">
                <SignOutButton>
                  <button
                    type="button"
                    className="px-3 py-1.5 text-[13px] text-muted-foreground hover:text-foreground rounded-md transition-colors duration-150"
                  >
                    ログアウト
                  </button>
                </SignOutButton>
              </div>

              <div className="md:hidden">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Menu className="h-4 w-4" />
                      <span className="sr-only">メニュー</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-44">
                    {navItems.map((item) => (
                      <DropdownMenuItem key={item.to} asChild>
                        <Link
                          to={item.to}
                          className={`w-full ${isActive(item.match) ? "font-medium" : ""}`}
                        >
                          {item.label}
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
            </div>
          ) : null}
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  )
}
