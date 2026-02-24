import { ChevronRight, Layers, Loader2, Trash2 } from "lucide-react"
import { useForm } from "react-hook-form"
import { Link, useNavigate, useParams } from "react-router"
import { AsyncBoundary } from "@/components/async-boundary"
import { FieldEditor } from "@/components/field-editor"
import { PageBreadcrumb } from "@/components/page-breadcrumb"
import { PageContainer } from "@/components/page-container"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import {
  useContentType,
  useDeleteContentType,
  useUpdateContentType,
} from "@/hooks/use-content-types"

type EditNameForm = { name: string }

function ContentTypeDetailContent({ id }: { id: string }) {
  const { data } = useContentType(id)
  const contentType = data?.data
  const navigate = useNavigate()
  const updateContentType = useUpdateContentType()
  const deleteContentType = useDeleteContentType()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EditNameForm>({
    defaultValues: { name: contentType?.name ?? "" },
  })

  if (!contentType) {
    return (
      <div className="text-center py-20">
        <Layers className="h-8 w-8 mx-auto text-muted-foreground/30 mb-4" />
        <p className="text-sm font-medium mb-1">コンテンツタイプが見つかりません</p>
        <Link to="/content-types">
          <Button variant="outline" size="sm" className="h-8 text-[13px] mt-4">
            一覧に戻る
          </Button>
        </Link>
      </div>
    )
  }

  const handleUpdateName = async (data: EditNameForm) => {
    try {
      await updateContentType.mutateAsync({ id, data })
    } catch (err) {
      console.error(err)
    }
  }

  const handleDelete = async () => {
    if (
      !window.confirm(
        `「${contentType.name}」を削除しますか？関連するフィールドとエントリも削除されます。`,
      )
    )
      return
    try {
      await deleteContentType.mutateAsync(id)
      navigate("/content-types")
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="space-y-8">
      {/* Basic info */}
      <div className="border rounded-lg p-5">
        <h2 className="text-sm font-semibold mb-4">基本情報</h2>
        <form onSubmit={handleSubmit(handleUpdateName)} className="space-y-4 max-w-sm">
          <div className="space-y-1.5">
            <Label className="text-xs">スラッグ</Label>
            <p className="text-sm font-mono text-muted-foreground">{contentType.slug}</p>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="ct-name" className="text-xs">
              表示名
            </Label>
            <Input
              id="ct-name"
              className="h-8 text-[13px]"
              {...register("name", { required: "表示名は必須です" })}
            />
            {errors.name ? <p className="text-xs text-destructive">{errors.name.message}</p> : null}
          </div>
          <Button
            type="submit"
            size="sm"
            className="h-7 text-xs"
            disabled={updateContentType.isPending}
          >
            {updateContentType.isPending ? (
              <>
                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                保存中...
              </>
            ) : (
              "保存"
            )}
          </Button>
        </form>
      </div>

      {/* Field definitions */}
      <div className="border rounded-lg p-5">
        <FieldEditor contentTypeId={id} fields={contentType.fields} />
      </div>

      {/* Entries link */}
      <Link
        to={`/content-types/${id}/entries`}
        className="flex items-center justify-between border rounded-lg p-5 hover:border-foreground/20 transition-colors duration-150 group"
      >
        <div>
          <p className="text-[13px] font-medium">エントリを管理</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            「{contentType.name}」のエントリ一覧を見る
          </p>
        </div>
        <ChevronRight className="h-4 w-4 text-muted-foreground/30 group-hover:text-muted-foreground transition-colors duration-150 flex-shrink-0 ml-3" />
      </Link>

      {/* Danger zone */}
      <div className="border border-destructive/30 rounded-lg p-5">
        <h2 className="text-sm font-semibold text-destructive mb-2">危険な操作</h2>
        <p className="text-xs text-muted-foreground mb-4">
          コンテンツタイプを削除すると、関連するすべてのフィールドとエントリも削除されます。
        </p>
        <Button
          variant="destructive"
          size="sm"
          className="h-7 text-xs"
          onClick={handleDelete}
          disabled={deleteContentType.isPending}
        >
          <Trash2 className="h-3 w-3 mr-1" />
          削除する
        </Button>
      </div>
    </div>
  )
}

export function ContentTypeDetailPage() {
  const { id } = useParams<{ id: string }>()

  if (!id) return null

  return (
    <PageContainer>
      <AsyncBoundary
        fallback={
          <>
            <Skeleton className="h-3 w-40 mb-6" />
            <Skeleton className="h-6 w-48 mb-8" />
            <Skeleton className="h-[200px] rounded-lg" />
          </>
        }
      >
        <ContentTypeDetailInner id={id} />
      </AsyncBoundary>
    </PageContainer>
  )
}

function ContentTypeDetailInner({ id }: { id: string }) {
  const { data } = useContentType(id)
  const name = data?.data?.name ?? "コンテンツタイプ"

  return (
    <>
      <PageBreadcrumb
        items={[
          { label: "ダッシュボード", to: "/dashboard" },
          { label: "コンテンツ", to: "/content-types" },
          { label: name },
        ]}
      />
      <h1 className="text-lg font-semibold mb-8">{name}</h1>
      <ContentTypeDetailContent id={id} />
    </>
  )
}
