import { PageBreadcrumb } from "@/components/page-breadcrumb"
import { Button } from "@/components/ui/button"
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
import { AlertCircle, ChevronRight, FileText, Plus } from "lucide-react"
import { parseAsInteger, useQueryState } from "nuqs"
import { Link } from "react-router"

function formatDate(dateStr: string) {
  const date = new Date(dateStr)
  return date.toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

export function ArticleListPage() {
  const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1))
  const { data, isLoading, isError, refetch } = useArticles(page)

  const totalPages = data?.meta?.totalPages ?? 1

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <PageBreadcrumb items={[{ label: "ダッシュボード", to: "/dashboard" }, { label: "記事" }]} />

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-lg font-semibold">記事</h1>
        <Link to="/articles/new">
          <Button size="sm" className="h-8 text-[13px]">
            <Plus className="h-3.5 w-3.5 mr-1.5" />
            新規作成
          </Button>
        </Link>
      </div>

      {isError ? (
        <div className="text-center py-20">
          <AlertCircle className="h-8 w-8 mx-auto text-muted-foreground/30 mb-4" />
          <p className="text-sm font-medium mb-1">読み込みに失敗しました</p>
          <p className="text-[13px] text-muted-foreground mb-4">
            ネットワーク接続を確認してください
          </p>
          <Button size="sm" variant="outline" className="h-8 text-[13px]" onClick={() => refetch()}>
            再試行
          </Button>
        </div>
      ) : isLoading ? (
        <div className="border rounded-lg divide-y">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={`skeleton-${i}`} className="px-4 py-3">
              <Skeleton className="h-4 w-1/2 mb-2" />
              <Skeleton className="h-3 w-24" />
            </div>
          ))}
        </div>
      ) : data?.data.length === 0 ? (
        <div className="text-center py-20 border border-dashed rounded-lg">
          <FileText className="h-8 w-8 mx-auto text-muted-foreground/30 mb-4" />
          <p className="text-sm font-medium mb-1">記事がありません</p>
          <p className="text-[13px] text-muted-foreground mb-4">最初の記事を作成しましょう</p>
          <Link to="/articles/new">
            <Button size="sm" className="h-8 text-[13px]">
              <Plus className="h-3.5 w-3.5 mr-1.5" />
              作成する
            </Button>
          </Link>
        </div>
      ) : (
        <div className="border rounded-lg divide-y">
          {data?.data.map((article) => (
            <Link
              key={article.id}
              to={`/articles/${article.id}`}
              className="flex items-center justify-between px-4 py-3 hover:bg-secondary/50 transition-colors duration-150 group"
            >
              <div className="min-w-0">
                <p className="text-[13px] font-medium truncate">{article.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {formatDate(article.createdAt)}
                </p>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground/30 group-hover:text-muted-foreground transition-colors duration-150 flex-shrink-0 ml-3" />
            </Link>
          ))}
        </div>
      )}

      {totalPages > 1 ? (
        <div className="mt-6">
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
