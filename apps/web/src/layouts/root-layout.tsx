import { SignOutButton, useAuth } from "@clerk/clerk-react"
import { Link, Outlet } from "react-router"
import { ChatSidebar } from "@/components/chat/chat-sidebar"
import { Button } from "@/components/ui/button"
import { useChatStore } from "@/stores/chat-store"

export function RootLayout() {
	const { isSignedIn } = useAuth()
	const toggleSidebar = useChatStore((s) => s.toggleSidebar)

	return (
		<div className="min-h-screen flex flex-col">
			<header className="border-b">
				<div className="container mx-auto flex items-center justify-between h-14 px-4">
					<Link to="/" className="font-bold text-lg">
						AI CMS
					</Link>
					<nav className="flex items-center gap-4">
						{isSignedIn ? (
							<>
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
								<Button variant="outline" size="sm" onClick={toggleSidebar}>
									AI
								</Button>
								<SignOutButton>
									<Button variant="ghost" size="sm">
										ログアウト
									</Button>
								</SignOutButton>
							</>
						) : null}
					</nav>
				</div>
			</header>
			<main className="flex-1">
				<Outlet />
			</main>
			{isSignedIn ? <ChatSidebar /> : null}
		</div>
	)
}
