import { SignInButton, useAuth } from "@clerk/clerk-react"
import { Navigate } from "react-router"
import { Button } from "@/components/ui/button"

export function LandingPage() {
	const { isSignedIn, isLoaded } = useAuth()

	if (isLoaded && isSignedIn) {
		return <Navigate to="/dashboard" replace />
	}

	return (
		<div className="container mx-auto px-4 py-16">
			<div className="max-w-2xl mx-auto text-center space-y-8">
				<h1 className="text-4xl font-bold">AI CMS</h1>
				<p className="text-lg text-muted-foreground">
					AIチャットでCMS操作を代行。記事の作成・編集・削除をチャットで指示するだけ。
				</p>
				<div className="flex justify-center gap-4">
					<SignInButton mode="modal">
						<Button size="lg">ログイン</Button>
					</SignInButton>
				</div>
			</div>
		</div>
	)
}
