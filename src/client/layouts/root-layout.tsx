import { OrganizationSwitcher, useAuth, useClerk, useUser } from "@clerk/clerk-react"
import { LogOut, UserRoundCog } from "lucide-react"
import { Link, Outlet, useLocation } from "react-router"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

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
      {isSignedIn ? (
        <AuthenticatedHeader isActive={isActive} />
      ) : (
        <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur-lg">
          <div className="max-w-3xl mx-auto flex items-center h-12 px-4">
            <Link to="/" className="text-sm font-semibold text-foreground">
              AI CMS
            </Link>
          </div>
        </header>
      )}

      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  )
}

function AuthenticatedHeader({ isActive }: { isActive: (match: string) => boolean }) {
  const { user } = useUser()
  const clerk = useClerk()

  const initials = user?.firstName?.charAt(0) ?? "U"

  return (
    <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg">
      {/* Upper bar */}
      <div className="flex items-center justify-between h-12 px-4 sm:px-6 border-b">
        <OrganizationSwitcher
          hidePersonal={true}
          afterSelectOrganizationUrl="/dashboard"
          afterCreateOrganizationUrl="/dashboard"
        />

        <DropdownMenu>
          <DropdownMenuTrigger className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring">
            <Avatar size="sm">
              <AvatarImage src={user?.imageUrl} alt={user?.firstName ?? ""} />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuItem onClick={() => clerk.openUserProfile()}>
              <UserRoundCog className="mr-2 h-4 w-4" />
              Manage Account
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => clerk.signOut()}>
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Lower nav bar */}
      <nav className="flex items-center gap-1 h-10 px-4 sm:px-6 border-b">
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
    </header>
  )
}
