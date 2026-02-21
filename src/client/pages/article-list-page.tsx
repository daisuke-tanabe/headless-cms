import { ArticlePagination } from "@/components/article-pagination"
import { PageBreadcrumb } from "@/components/page-breadcrumb"
import { PageContainer } from "@/components/page-container"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useArticles } from "@/hooks/use-articles"
import { formatDate } from "@/lib/format"
import { AlertCircle, ChevronRight, FileText, Plus } from "lucide-react"
import { parseAsInteger, useQueryState } from "nuqs"
import { Link } from "react-router"

export function ArticleListPage() {
  const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1))
  const { data, isLoading, isError, refetch } = useArticles(page)

  const totalPages = data?.meta?.totalPages ?? 1

  return (
    <PageContainer>
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
            // biome-ignore lint/suspicious/noArrayIndexKey: static skeleton list
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

      <ArticlePagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </PageContainer>
  )
}
