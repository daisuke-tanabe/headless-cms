import { PageBreadcrumb } from "@/components/page-breadcrumb"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
    <div className="container mx-auto px-4 py-8">
      <PageBreadcrumb items={[{ label: "トップ" }]} />

      <h1 className="text-2xl font-bold mb-2">
        ようこそ{user?.firstName ? `、${user.firstName}さん` : ""}
      </h1>
      <p className="text-muted-foreground mb-8">AI CMS ダッシュボード</p>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          <>
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
          </>
        ) : (
          <>
            <Card className="border-primary/20 bg-primary/5">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">記事数</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold">{count}</p>
                <CardDescription className="mt-1">公開中の記事の合計数</CardDescription>
              </CardContent>
            </Card>

            <Card className="flex flex-col justify-center">
              <CardContent className="pt-6">
                <Link to="/articles/new">
                  <Button className="w-full" size="lg">
                    <Plus className="h-4 w-4 mr-2" />
                    新規記事を作成
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="flex flex-col justify-center">
              <CardContent className="pt-6">
                <Button variant="outline" className="w-full" size="lg" onClick={toggleSidebar}>
                  <MessageSquare className="h-4 w-4 mr-2" />
                  AI に相談する
                </Button>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {!isLoading && count === 0 ? (
        <div className="mt-12 text-center">
          <FileText className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
          <h2 className="text-lg font-semibold mb-2">まだ記事がありません</h2>
          <p className="text-muted-foreground mb-6">
            最初の記事を作成するか、AI に話しかけて記事を作ってもらいましょう。
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-3">
            <Link to="/articles/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                記事を作成する
              </Button>
            </Link>
            <Button variant="outline" onClick={toggleSidebar}>
              <MessageSquare className="h-4 w-4 mr-2" />
              AI に依頼する
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  )
}
