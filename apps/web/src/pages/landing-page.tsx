import { SignInButton, useAuth } from "@clerk/clerk-react"
import { MessageSquare, Pencil, Trash2 } from "lucide-react"
import { Navigate } from "react-router"
import { Button } from "@/components/ui/button"

export function LandingPage() {
	const { isSignedIn, isLoaded } = useAuth()

	if (isLoaded && isSignedIn) {
		return <Navigate to="/dashboard" replace />
	}

	return (
		<div className="flex flex-1 items-center justify-center px-4 py-16">
			<div className="max-w-2xl mx-auto text-center space-y-8">
				<h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
					AI CMS
				</h1>
				<p className="text-base sm:text-lg text-muted-foreground max-w-lg mx-auto">
					AIチャットでCMS操作を代行。記事の作成・編集・削除をチャットで指示するだけで完了します。
				</p>
				<div className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
					<div className="flex items-center gap-2">
						<MessageSquare className="h-4 w-4" />
						<span>チャットで指示</span>
					</div>
					<div className="flex items-center gap-2">
						<Pencil className="h-4 w-4" />
						<span>記事を自動作成</span>
					</div>
					<div className="flex items-center gap-2">
						<Trash2 className="h-4 w-4" />
						<span>編集・削除も簡単</span>
					</div>
				</div>
				<div className="flex justify-center">
					<SignInButton mode="modal">
						<Button size="lg" className="text-base px-8 py-6">
							ログインして始める
						</Button>
					</SignInButton>
				</div>
			</div>
		</div>
	)
}
