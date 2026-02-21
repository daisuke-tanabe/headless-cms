import { ArticleEditView } from "@/components/article-edit-view"
import { PageBreadcrumb } from "@/components/page-breadcrumb"
import { PageContainer } from "@/components/page-container"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useArticle, useDeleteArticle } from "@/hooks/use-articles"
import { formatDate } from "@/lib/format"
import { useChatStore } from "@/stores/chat-store"
import { useEditorStore } from "@/stores/editor-store"
import { ArrowLeft, FileX, Pencil, Trash2 } from "lucide-react"
import { useEffect, useState } from "react"
import { Link, useNavigate, useParams } from "react-router"

export function ArticleDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data, isLoading } = useArticle(id ?? "")
  const deleteArticle = useDeleteArticle()
  const { pendingContent, clearPendingContent } = useEditorStore()
  const addMessage = useChatStore((s) => s.addMessage)

  const [isEditing, setIsEditing] = useState(false)
  const [editDefaults, setEditDefaults] = useState<{ title?: string; body?: string }>()

  useEffect(() => {
    if (pendingContent && data?.data) {
      setEditDefaults({
        title: pendingContent.title ?? data.data.title,
        body: pendingContent.body ?? data.data.body,
      })
      clearPendingContent()
      setIsEditing(true)
    }
  }, [pendingContent, data, clearPendingContent])

  if (!id) return null

  if (isLoading) {
    return (
      <PageContainer>
        <Skeleton className="h-4 w-32 mb-6" />
        <Skeleton className="h-6 w-2/3 mb-2" />
        <Skeleton className="h-4 w-24 mb-8" />
        <Skeleton className="h-48 w-full" />
      </PageContainer>
    )
  }

  if (!data?.data) {
    return (
      <PageContainer>
        <PageBreadcrumb
          items={[
            { label: "ダッシュボード", to: "/dashboard" },
            { label: "記事", to: "/articles" },
            { label: "見つかりません" },
          ]}
        />
        <div className="text-center py-20">
          <FileX className="h-8 w-8 mx-auto text-muted-foreground/30 mb-4" />
          <p className="text-sm font-medium mb-1">記事が見つかりません</p>
          <p className="text-[13px] text-muted-foreground mb-6">
            この記事は削除されたか、存在しない可能性があります。
          </p>
          <Link to="/articles">
            <Button variant="outline" size="sm" className="h-8 text-[13px]">
              <ArrowLeft className="h-3.5 w-3.5 mr-1.5" />
              記事一覧に戻る
            </Button>
          </Link>
        </div>
      </PageContainer>
    )
  }

  const article = data.data

  const handleDelete = async () => {
    await deleteArticle.mutateAsync(id)
    addMessage({
      type: "text",
      role: "assistant",
      content: `[システム] 記事を削除しました（ID: ${id}、タイトル: ${article.title}）`,
    })
    navigate("/articles")
  }

  if (isEditing) {
    return (
      <ArticleEditView
        article={{ id, title: article.title, body: article.body }}
        editDefaults={editDefaults}
        onCancel={() => setIsEditing(false)}
        onSaved={() => setIsEditing(false)}
      />
    )
  }

  return (
    <PageContainer>
      <PageBreadcrumb
        items={[
          { label: "ダッシュボード", to: "/dashboard" },
          { label: "記事", to: "/articles" },
          { label: article.title },
        ]}
      />

      <article>
        <div className="mb-8">
          <h1 className="text-lg font-semibold mb-1">{article.title}</h1>
          <p className="text-xs text-muted-foreground">{formatDate(article.createdAt)}</p>
        </div>

        <div className="border-t pt-6 mb-8">
          <div className="text-[14px] leading-[1.8] text-foreground/90">
            <p className="whitespace-pre-wrap">{article.body}</p>
          </div>
        </div>

        <div className="border-t pt-6 flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-[13px]"
            onClick={() => setIsEditing(true)}
          >
            <Pencil className="h-3.5 w-3.5 mr-1.5" />
            編集
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 text-[13px] text-destructive hover:text-destructive hover:bg-destructive/10"
                disabled={deleteArticle.isPending}
              >
                <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                削除
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>記事を削除しますか？</AlertDialogTitle>
                <AlertDialogDescription>
                  「{article.title}」を削除します。この操作は取り消せません。
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>キャンセル</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  className="bg-destructive text-white hover:bg-destructive/90"
                >
                  削除する
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </article>
    </PageContainer>
  )
}
