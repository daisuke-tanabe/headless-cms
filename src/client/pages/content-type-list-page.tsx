import { ChevronRight, Layers, Plus } from "lucide-react"
import { Link } from "react-router"
import { AsyncBoundary } from "@/components/async-boundary"
import { PageBreadcrumb } from "@/components/page-breadcrumb"
import { PageContainer } from "@/components/page-container"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useContentTypes } from "@/hooks/use-content-types"

function ContentTypeListContent() {
  const { data } = useContentTypes()
  const contentTypes = data.data

  if (contentTypes.length === 0) {
    return (
      <div className="text-center py-20 border border-dashed rounded-lg">
        <Layers className="h-8 w-8 mx-auto text-muted-foreground/30 mb-4" />
        <p className="text-sm font-medium mb-1">コンテンツタイプがありません</p>
        <p className="text-[13px] text-muted-foreground mb-6">
          最初のコンテンツタイプを作成しましょう
        </p>
        <Link to="/content-types/new">
          <Button size="sm" className="h-8 text-[13px]">
            <Plus className="h-3.5 w-3.5 mr-1.5" />
            作成する
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="border rounded-lg divide-y">
      {contentTypes.map((ct) => (
        <Link
          key={ct.id}
          to={`/content-types/${ct.id}`}
          className="flex items-center justify-between px-4 py-3 hover:bg-secondary/50 transition-colors duration-150 group"
        >
          <div className="min-w-0">
            <p className="text-[13px] font-medium truncate">{ct.name}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{ct.slug}</p>
          </div>
          <ChevronRight className="h-4 w-4 text-muted-foreground/30 group-hover:text-muted-foreground transition-colors duration-150 flex-shrink-0 ml-3" />
        </Link>
      ))}
    </div>
  )
}

export function ContentTypeListPage() {
  return (
    <PageContainer>
      <PageBreadcrumb
        items={[{ label: "ダッシュボード", to: "/dashboard" }, { label: "コンテンツ" }]}
      />
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-lg font-semibold">コンテンツタイプ</h1>
        <Link to="/content-types/new">
          <Button size="sm" className="h-8 text-[13px]">
            <Plus className="h-3.5 w-3.5 mr-1.5" />
            新規作成
          </Button>
        </Link>
      </div>

      <AsyncBoundary
        fallback={
          <div className="border rounded-lg divide-y">
            {Array.from({ length: 3 }).map((_, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: static skeleton list
              <div key={`skeleton-${i}`} className="px-4 py-3">
                <Skeleton className="h-4 w-1/3 mb-2" />
                <Skeleton className="h-3 w-20" />
              </div>
            ))}
          </div>
        }
      >
        <ContentTypeListContent />
      </AsyncBoundary>
    </PageContainer>
  )
}
