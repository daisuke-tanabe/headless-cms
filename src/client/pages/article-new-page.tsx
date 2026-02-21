import { Loader2 } from "lucide-react"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router"
import { ArticleEditor } from "@/components/article-editor"
import { EditorShell } from "@/components/article-editor-layout"
import { Button } from "@/components/ui/button"
import { useCreateArticle } from "@/hooks/use-articles"
import { useChatStore } from "@/stores/chat-store"
import { useEditorStore } from "@/stores/editor-store"

const FORM_ID = "article-new-form"

export function ArticleNewPage() {
  const navigate = useNavigate()
  const createArticle = useCreateArticle()
  const { pendingContent, clearPendingContent } = useEditorStore()
  const addMessage = useChatStore((s) => s.addMessage)
  const [defaultValues, setDefaultValues] = useState<{
    title?: string
    body?: string
  }>()

  useEffect(() => {
    if (pendingContent) {
      setDefaultValues({
        title: pendingContent.title,
        body: pendingContent.body,
      })
      clearPendingContent()
    }
  }, [pendingContent, clearPendingContent])

  return (
    <EditorShell
      breadcrumbItems={[{ label: "記事", to: "/articles" }, { label: "新規作成" }]}
      actionButton={
        <Button
          type="submit"
          form={FORM_ID}
          size="sm"
          disabled={createArticle.isPending}
          className="h-8 text-[13px]"
        >
          {createArticle.isPending ? (
            <>
              <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
              作成中...
            </>
          ) : (
            "作成"
          )}
        </Button>
      }
      closePath="/articles"
    >
      <ArticleEditor
        formId={FORM_ID}
        defaultValues={defaultValues}
        isSubmitting={createArticle.isPending}
        onSubmit={async (data) => {
          const result = await createArticle.mutateAsync(data)
          addMessage({
            type: "text",
            role: "assistant",
            content: `[システム] 記事を保存しました（ID: ${result.data.id}、タイトル: ${result.data.title}）`,
          })
          navigate(`/articles/${result.data.id}`)
        }}
      />
    </EditorShell>
  )
}
