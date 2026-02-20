import { parseAsInteger, useQueryState } from "nuqs"
import { Link } from "react-router"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useArticles } from "@/hooks/use-articles"

export function ArticleListPage() {
	const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1))
	const { data, isLoading } = useArticles(page)

	return (
		<div className="container mx-auto px-4 py-8">
			<div className="flex items-center justify-between mb-6">
				<h1 className="text-2xl font-bold">記事一覧</h1>
				<Link to="/articles/new">
					<Button>新規作成</Button>
				</Link>
			</div>

			{isLoading ? (
				<div className="space-y-4">
					{Array.from({ length: 5 }).map((_, i) => (
						<Skeleton key={`skeleton-${i}`} className="h-20 w-full" />
					))}
				</div>
			) : data?.data.length === 0 ? (
				<p className="text-muted-foreground">記事がありません。</p>
			) : (
				<div className="space-y-4">
					{data?.data.map((article) => (
						<Link key={article.id} to={`/articles/${article.id}`}>
							<Card className="hover:bg-accent transition-colors">
								<CardHeader>
									<CardTitle className="text-lg">{article.title}</CardTitle>
								</CardHeader>
								<CardContent>
									<p className="text-sm text-muted-foreground">
										{new Date(article.createdAt).toLocaleDateString("ja-JP")}
									</p>
								</CardContent>
							</Card>
						</Link>
					))}
				</div>
			)}

			{data?.meta && data.meta.totalPages > 1 ? (
				<div className="flex justify-center gap-2 mt-8">
					<Button
						variant="outline"
						disabled={page <= 1}
						onClick={() => setPage(page - 1)}
					>
						前へ
					</Button>
					<span className="flex items-center px-4 text-sm">
						{page} / {data.meta.totalPages}
					</span>
					<Button
						variant="outline"
						disabled={page >= data.meta.totalPages}
						onClick={() => setPage(page + 1)}
					>
						次へ
					</Button>
				</div>
			) : null}
		</div>
	)
}
