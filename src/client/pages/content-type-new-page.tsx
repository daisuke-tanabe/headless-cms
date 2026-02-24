import { Loader2 } from "lucide-react"
import { useForm } from "react-hook-form"
import { useNavigate } from "react-router"
import { AsyncBoundary } from "@/components/async-boundary"
import { PageBreadcrumb } from "@/components/page-breadcrumb"
import { PageContainer } from "@/components/page-container"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useCreateContentType } from "@/hooks/use-content-types"

type NewContentTypeForm = {
  slug: string
  name: string
}

function ContentTypeNewContent() {
  const navigate = useNavigate()
  const createContentType = useCreateContentType()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<NewContentTypeForm>()

  const onSubmit = async (data: NewContentTypeForm) => {
    const result = await createContentType.mutateAsync(data)
    navigate(`/content-types/${result.data.id}`)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-lg space-y-6">
      <div className="space-y-1.5">
        <Label htmlFor="name">表示名</Label>
        <Input
          id="name"
          placeholder="例: 記事"
          {...register("name", { required: "表示名は必須です" })}
        />
        {errors.name ? <p className="text-xs text-destructive">{errors.name.message}</p> : null}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="slug">スラッグ</Label>
        <Input
          id="slug"
          placeholder="例: article"
          {...register("slug", {
            required: "スラッグは必須です",
            pattern: {
              value: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
              message: "小文字英数字とハイフンのみ使用できます",
            },
          })}
        />
        {errors.slug ? (
          <p className="text-xs text-destructive">{errors.slug.message}</p>
        ) : (
          <p className="text-xs text-muted-foreground">
            APIキーとして使用されます（例: /api/v1/article）
          </p>
        )}
      </div>

      <Button type="submit" disabled={createContentType.isPending} className="h-9">
        {createContentType.isPending ? (
          <>
            <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
            作成中...
          </>
        ) : (
          "作成する"
        )}
      </Button>
    </form>
  )
}

export function ContentTypeNewPage() {
  return (
    <PageContainer>
      <PageBreadcrumb
        items={[
          { label: "ダッシュボード", to: "/dashboard" },
          { label: "コンテンツ", to: "/content-types" },
          { label: "新規作成" },
        ]}
      />
      <h1 className="text-lg font-semibold mb-8">コンテンツタイプを作成</h1>

      <AsyncBoundary fallback={null}>
        <ContentTypeNewContent />
      </AsyncBoundary>
    </PageContainer>
  )
}
