import { ArticleEditor } from "@/components/article-editor"
import { PageBreadcrumb } from "@/components/page-breadcrumb"
import { PageContainer } from "@/components/page-container"
import { Button } from "@/components/ui/button"
import { useUpdateArticle } from "@/hooks/use-articles"
import { useChatStore } from "@/stores/chat-store"

interface ArticleEditViewProps {
  article: { id: string; title: string; body: string }
  editDefaults?: { title?: string; body?: string }
  onCancel: () => void
  onSaved: () => void
}

export function ArticleEditView({
  article,
  editDefaults,
  onCancel,
  onSaved,
}: ArticleEditViewProps) {
  const updateArticle = useUpdateArticle()
  const addMessage = useChatStore((s) => s.addMessage)

  return (
    <PageContainer>
      <PageBreadcrumb
        items={[
          { label: "ダッシュボード", to: "/dashboard" },
          { label: "記事", to: "/articles" },
          { label: article.title, to: `/articles/${article.id}` },
          { label: "編集" },
        ]}
      />

      <h1 className="text-lg font-semibold mb-6">記事を編集</h1>

      <ArticleEditor
        defaultValues={editDefaults ?? { title: article.title, body: article.body }}
        isSubmitting={updateArticle.isPending}
        submitLabel="更新"
        onSubmit={async (formData) => {
          const result = await updateArticle.mutateAsync({ id: article.id, data: formData })
          addMessage({
            type: "text",
            role: "assistant",
            content: `[システム] 記事を更新しました（ID: ${article.id}、タイトル: ${result.data.title}）`,
          })
          onSaved()
        }}
      />
      <Button
        variant="ghost"
        size="sm"
        className="mt-3 text-[13px] text-muted-foreground"
        onClick={onCancel}
      >
        キャンセル
      </Button>
    </PageContainer>
  )
}
