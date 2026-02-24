import { useUser } from "@clerk/clerk-react"
import { Layers, Plus } from "lucide-react"
import { Link } from "react-router"
import { AsyncBoundary } from "@/components/async-boundary"
import { PageBreadcrumb } from "@/components/page-breadcrumb"
import { PageContainer } from "@/components/page-container"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useContentTypes } from "@/hooks/use-content-types"

function DashboardContent() {
  const { data } = useContentTypes()
  const contentTypes = data.data

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 mb-8">
        {/* Content type count */}
        <div className="rounded-lg border p-5">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[13px] text-muted-foreground">コンテンツタイプ数</span>
            <Layers className="h-4 w-4 text-muted-foreground/40" />
          </div>
          <p className="text-3xl font-semibold tabular-nums">{contentTypes.length}</p>
        </div>

        {/* Create content type */}
        <Link to="/content-types/new" className="block group">
          <div className="rounded-lg border p-5 h-full flex flex-col justify-between hover:border-foreground/20 transition-colors duration-150">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[13px] text-muted-foreground">新規作成</span>
              <Plus className="h-4 w-4 text-muted-foreground/40 group-hover:text-foreground transition-colors duration-150" />
            </div>
            <p className="text-[13px] font-medium">コンテンツタイプを作成する</p>
          </div>
        </Link>
      </div>

      {contentTypes.length === 0 ? (
        <div className="text-center py-16 border border-dashed rounded-lg">
          <Layers className="h-8 w-8 mx-auto text-muted-foreground/30 mb-4" />
          <p className="text-sm font-medium mb-1">まだコンテンツタイプがありません</p>
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
      ) : (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-muted-foreground mb-3">コンテンツタイプ</p>
          <div className="border rounded-lg divide-y">
            {contentTypes.map((ct) => (
              <Link
                key={ct.id}
                to={`/content-types/${ct.id}/entries`}
                className="flex items-center justify-between px-4 py-3 hover:bg-secondary/50 transition-colors duration-150 group"
              >
                <div className="min-w-0">
                  <p className="text-[13px] font-medium">{ct.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{ct.slug}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </>
  )
}

export function DashboardPage() {
  const { user } = useUser()

  return (
    <PageContainer>
      <PageBreadcrumb items={[{ label: "ダッシュボード" }]} />

      <h1 className="text-lg font-semibold mb-8">
        {user?.firstName ? `${user.firstName}さん、おかえりなさい` : "ダッシュボード"}
      </h1>

      <AsyncBoundary
        fallback={
          <div className="grid gap-4 sm:grid-cols-2 mb-8">
            <Skeleton className="h-[120px] rounded-lg" />
            <Skeleton className="h-[120px] rounded-lg" />
          </div>
        }
      >
        <DashboardContent />
      </AsyncBoundary>
    </PageContainer>
  )
}
