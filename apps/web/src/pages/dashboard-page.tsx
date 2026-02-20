import { useUser } from "@clerk/clerk-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function DashboardPage() {
	const { user } = useUser()

	return (
		<div className="container mx-auto px-4 py-8">
			<h1 className="text-2xl font-bold mb-6">
				ようこそ{user?.firstName ? `、${user.firstName}さん` : ""}
			</h1>
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
				<Card>
					<CardHeader>
						<CardTitle>記事数</CardTitle>
					</CardHeader>
					<CardContent>
						{/* TODO: Phase 3 で useArticleCount() に接続 */}
						<p className="text-3xl font-bold">-</p>
					</CardContent>
				</Card>
			</div>
		</div>
	)
}
