import { FileText, Plus } from "lucide-react"
import { parseAsInteger, useQueryState } from "nuqs"
import { Link } from "react-router"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
	Pagination,
	PaginationContent,
	PaginationItem,
	PaginationLink,
	PaginationNext,
	PaginationPrevious,
} from "@/components/ui/pagination"
import { Skeleton } from "@/components/ui/skeleton"
import { useArticles } from "@/hooks/use-articles"

function formatDate(dateStr: string) {
	const date = new Date(dateStr)
	return date.toLocaleDateString("ja-JP", {
		year: "numeric",
		month: "long",
		day: "numeric",
	})
}

export function ArticleListPage() {
	const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1))
	const { data, isLoading } = useArticles(page)

	const totalPages = data?.meta?.totalPages ?? 1

	return (
		<div className="container mx-auto px-4 py-8">
			<div className="flex items-center justify-between mb-6">
				<h1 className="text-2xl font-bold">記事一覧</h1>
				<Link to="/articles/new">
					<Button>
						<Plus className="h-4 w-4 mr-1" />
						<span className="hidden sm:inline">新規作成</span>
						<span className="sm:hidden">作成</span>
					</Button>
				</Link>
			</div>

			{isLoading ? (
				<div className="space-y-4">
					{Array.from({ length: 5 }).map((_, i) => (
						<Card key={`skeleton-${i}`}>
							<CardHeader className="pb-2">
								<Skeleton className="h-6 w-2/3" />
							</CardHeader>
							<CardContent>
								<Skeleton className="h-4 w-32" />
							</CardContent>
						</Card>
					))}
				</div>
			) : data?.data.length === 0 ? (
				<div className="text-center py-16">
					<FileText className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
					<h2 className="text-lg font-semibold mb-2">最初の記事を作成しましょう</h2>
					<p className="text-muted-foreground mb-6">記事を作成して、AI CMS を使い始めましょう。</p>
					<Link to="/articles/new">
						<Button>
							<Plus className="h-4 w-4 mr-2" />
							記事を作成する
						</Button>
					</Link>
				</div>
			) : (
				<div className="space-y-3">
					{data?.data.map((article) => (
						<Link key={article.id} to={`/articles/${article.id}`} className="block">
							<Card className="hover:bg-accent/50 hover:shadow-sm transition-all">
								<CardHeader className="pb-2">
									<CardTitle className="text-base sm:text-lg">{article.title}</CardTitle>
								</CardHeader>
								<CardContent>
									<p className="text-xs sm:text-sm text-muted-foreground">
										{formatDate(article.createdAt)}
									</p>
								</CardContent>
							</Card>
						</Link>
					))}
				</div>
			)}

			{totalPages > 1 ? (
				<div className="mt-8">
					<Pagination>
						<PaginationContent>
							<PaginationItem>
								<PaginationPrevious
									onClick={() => setPage(Math.max(1, page - 1))}
									aria-disabled={page <= 1}
									className={page <= 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
								/>
							</PaginationItem>

							{Array.from({ length: totalPages }).map((_, i) => {
								const pageNum = i + 1
								if (
									totalPages <= 5 ||
									pageNum === 1 ||
									pageNum === totalPages ||
									Math.abs(pageNum - page) <= 1
								) {
									return (
										<PaginationItem key={pageNum}>
											<PaginationLink
												isActive={pageNum === page}
												onClick={() => setPage(pageNum)}
												className="cursor-pointer"
											>
												{pageNum}
											</PaginationLink>
										</PaginationItem>
									)
								}
								if (pageNum === 2 && page > 3) {
									return (
										<PaginationItem key="ellipsis-start">
											<span className="flex h-9 w-9 items-center justify-center text-sm">...</span>
										</PaginationItem>
									)
								}
								if (pageNum === totalPages - 1 && page < totalPages - 2) {
									return (
										<PaginationItem key="ellipsis-end">
											<span className="flex h-9 w-9 items-center justify-center text-sm">...</span>
										</PaginationItem>
									)
								}
								return null
							})}

							<PaginationItem>
								<PaginationNext
									onClick={() => setPage(Math.min(totalPages, page + 1))}
									aria-disabled={page >= totalPages}
									className={
										page >= totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"
									}
								/>
							</PaginationItem>
						</PaginationContent>
					</Pagination>
				</div>
			) : null}
		</div>
	)
}
