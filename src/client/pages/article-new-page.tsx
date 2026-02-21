import { ArticleEditor } from "@/components/article-editor"
import { PageBreadcrumb } from "@/components/page-breadcrumb"
import { PageContainer } from "@/components/page-container"
import { useCreateArticle } from "@/hooks/use-articles"
import { useChatStore } from "@/stores/chat-store"
import { useEditorStore } from "@/stores/editor-store"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router"

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
    <PageContainer>
      <PageBreadcrumb
        items={[
          { label: "ダッシュボード", to: "/dashboard" },
          { label: "記事", to: "/articles" },
          { label: "新規作成" },
        ]}
      />

      <h1 className="text-lg font-semibold mb-6">記事を作成</h1>

      <ArticleEditor
        defaultValues={defaultValues}
        isSubmitting={createArticle.isPending}
        submitLabel="作成"
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
    </PageContainer>
  )
}
