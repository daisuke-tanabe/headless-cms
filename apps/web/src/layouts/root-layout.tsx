import { SignOutButton, useAuth } from "@clerk/clerk-react"
import { Menu, MessageSquare } from "lucide-react"
import { Link, Outlet } from "react-router"
import { ChatSidebar } from "@/components/chat/chat-sidebar"
import { Button } from "@/components/ui/button"
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useChatStore } from "@/stores/chat-store"

export function RootLayout() {
	const { isSignedIn } = useAuth()
	const toggleSidebar = useChatStore((s) => s.toggleSidebar)

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
								<Link to="/dashboard">
									<Button variant="ghost" size="sm">
										トップ
									</Button>
								</Link>
								<Link to="/articles">
									<Button variant="ghost" size="sm">
										記事一覧
									</Button>
								</Link>
								<SignOutButton>
									<Button variant="ghost" size="sm">
										ログアウト
									</Button>
								</SignOutButton>
							</div>

							{/* AI button - always visible */}
							<Button variant="outline" size="sm" onClick={toggleSidebar}>
								<MessageSquare className="h-4 w-4 mr-1" />
								AI
							</Button>

							{/* Mobile hamburger menu */}
							<div className="md:hidden">
								<DropdownMenu>
									<DropdownMenuTrigger asChild>
										<Button variant="ghost" size="icon">
											<Menu className="h-5 w-5" />
											<span className="sr-only">メニュー</span>
										</Button>
									</DropdownMenuTrigger>
									<DropdownMenuContent align="end" className="w-48">
										<DropdownMenuItem asChild>
											<Link to="/dashboard" className="w-full">
												トップ
											</Link>
										</DropdownMenuItem>
										<DropdownMenuItem asChild>
											<Link to="/articles" className="w-full">
												記事一覧
											</Link>
										</DropdownMenuItem>
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
					) : null}
				</div>
			</header>
			<main className="flex-1">
				<Outlet />
			</main>
			{isSignedIn ? <ChatSidebar /> : null}
		</div>
	)
}
