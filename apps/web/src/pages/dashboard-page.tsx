import { useUser } from "@clerk/clerk-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useArticleCount } from "@/hooks/use-articles"

export function DashboardPage() {
	const { user } = useUser()
	const { data, isLoading } = useArticleCount()

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
						<p className="text-3xl font-bold">
							{isLoading ? "-" : (data?.data.count ?? 0)}
						</p>
					</CardContent>
				</Card>
			</div>
		</div>
	)
}
