import { FileX, Loader2 } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { Link, useParams } from "react-router"
import { ArticleEditor } from "@/components/article-editor"
import { EditorShell } from "@/components/article-editor-layout"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useArticle, useUpdateArticle } from "@/hooks/use-articles"
import { useChatStore } from "@/stores/chat-store"
import { useEditorStore } from "@/stores/editor-store"

const FORM_ID = "article-edit-form"

export function ArticleEditPage() {
  const { id } = useParams<{ id: string }>()
  const { data, isLoading } = useArticle(id ?? "")
  const updateArticle = useUpdateArticle()
  const { pendingContent, clearPendingContent } = useEditorStore()
  const addMessage = useChatStore((s) => s.addMessage)

  const [defaultValues, setDefaultValues] = useState<{
    title?: string
    body?: string
  }>()

  const article = data?.data

  const initialized = useRef(false)
  useEffect(() => {
    if (!article || initialized.current) return
    initialized.current = true
    if (pendingContent) {
      setDefaultValues({
        title: pendingContent.title ?? article.title,
        body: pendingContent.body ?? article.body,
      })
      clearPendingContent()
    } else {
      setDefaultValues({
        title: article.title,
        body: article.body,
      })
    }
  }, [article, pendingContent, clearPendingContent])

  if (!id) return null

  if (isLoading) {
    return (
      <EditorShell
        breadcrumbItems={[{ label: "記事", to: "/articles" }, { label: "読み込み中..." }]}
        actionButton={<Skeleton className="h-8 w-16" />}
        closePath="/articles"
      >
        <div className="max-w-3xl mx-auto px-6 md:px-12 py-8">
          <Skeleton className="h-8 w-2/3 mb-4" />
          <Skeleton className="h-48 w-full" />
        </div>
      </EditorShell>
    )
  }

  if (!article) {
    return (
      <EditorShell
        breadcrumbItems={[{ label: "記事", to: "/articles" }, { label: "見つかりません" }]}
        actionButton={null}
        closePath="/articles"
      >
        <div className="text-center py-20">
          <FileX className="h-8 w-8 mx-auto text-muted-foreground/30 mb-4" />
          <p className="text-sm font-medium mb-1">記事が見つかりません</p>
          <p className="text-[13px] text-muted-foreground mb-6">
            この記事は削除されたか、存在しない可能性があります。
          </p>
          <Link to="/articles">
            <Button variant="outline" size="sm" className="h-8 text-[13px]">
              記事一覧に戻る
            </Button>
          </Link>
        </div>
      </EditorShell>
    )
  }

  return (
    <EditorShell
      breadcrumbItems={[{ label: "記事", to: "/articles" }, { label: article.title }]}
      actionButton={
        <Button
          type="submit"
          form={FORM_ID}
          size="sm"
          disabled={updateArticle.isPending}
          className="h-8 text-[13px]"
        >
          {updateArticle.isPending ? (
            <>
              <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
              保存中...
            </>
          ) : (
            "保存"
          )}
        </Button>
      }
      closePath="/articles"
    >
      <ArticleEditor
        formId={FORM_ID}
        defaultValues={defaultValues}
        isSubmitting={updateArticle.isPending}
        onSubmit={async (formData) => {
          const result = await updateArticle.mutateAsync({
            id,
            data: formData,
          })
          addMessage({
            type: "text",
            role: "assistant",
            content: `[システム] 記事を更新しました（ID: ${id}、タイトル: ${result.data.title}）`,
          })
        }}
      />
    </EditorShell>
  )
}
