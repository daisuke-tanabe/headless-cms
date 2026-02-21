import { PageBreadcrumb } from "@/components/page-breadcrumb"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useArticleCount } from "@/hooks/use-articles"
import { useChatStore } from "@/stores/chat-store"
import { useUser } from "@clerk/clerk-react"
import { FileText, MessageSquare, Plus } from "lucide-react"
import { Link } from "react-router"

export function DashboardPage() {
  const { user } = useUser()
  const { data, isLoading } = useArticleCount()
  const toggleSidebar = useChatStore((s) => s.toggleSidebar)

  const count = data?.data.count ?? 0

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <PageBreadcrumb items={[{ label: "ダッシュボード" }]} />

      <h1 className="text-lg font-semibold mb-8">
        {user?.firstName ? `${user.firstName}さん、おかえりなさい` : "ダッシュボード"}
      </h1>

      <div className="grid gap-4 sm:grid-cols-3 mb-8">
        {isLoading ? (
          <>
            <Skeleton className="h-[120px] rounded-lg" />
            <Skeleton className="h-[120px] rounded-lg" />
            <Skeleton className="h-[120px] rounded-lg" />
          </>
        ) : (
          <>
            {/* Article count */}
            <div className="rounded-lg border p-5">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[13px] text-muted-foreground">記事数</span>
                <FileText className="h-4 w-4 text-muted-foreground/40" />
              </div>
              <p className="text-3xl font-semibold tabular-nums">{count}</p>
            </div>

            {/* Create article */}
            <Link to="/articles/new" className="block group">
              <div className="rounded-lg border p-5 h-full flex flex-col justify-between hover:border-foreground/20 transition-colors duration-150">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[13px] text-muted-foreground">新規作成</span>
                  <Plus className="h-4 w-4 text-muted-foreground/40 group-hover:text-foreground transition-colors duration-150" />
                </div>
                <p className="text-[13px] font-medium">記事を作成する</p>
              </div>
            </Link>

            {/* AI chat */}
            <button type="button" onClick={toggleSidebar} className="text-left group">
              <div className="rounded-lg border p-5 h-full flex flex-col justify-between hover:border-foreground/20 transition-colors duration-150">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[13px] text-muted-foreground">AI アシスタント</span>
                  <MessageSquare className="h-4 w-4 text-muted-foreground/40 group-hover:text-foreground transition-colors duration-150" />
                </div>
                <p className="text-[13px] font-medium">チャットで相談する</p>
              </div>
            </button>
          </>
        )}
      </div>

      {!isLoading && count === 0 ? (
        <div className="text-center py-16 border border-dashed rounded-lg">
          <FileText className="h-8 w-8 mx-auto text-muted-foreground/30 mb-4" />
          <p className="text-sm font-medium mb-1">まだ記事がありません</p>
          <p className="text-[13px] text-muted-foreground mb-6">
            記事を作成するか、AIに依頼しましょう
          </p>
          <div className="flex justify-center gap-2">
            <Link to="/articles/new">
              <Button size="sm" className="h-8 text-[13px]">
                <Plus className="h-3.5 w-3.5 mr-1.5" />
                作成する
              </Button>
            </Link>
            <Button size="sm" variant="outline" className="h-8 text-[13px]" onClick={toggleSidebar}>
              <MessageSquare className="h-3.5 w-3.5 mr-1.5" />
              AIに依頼
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  )
}
