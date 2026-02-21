import { zodResolver } from "@hookform/resolvers/zod"
import { MAX_BODY_LENGTH, MAX_TITLE_LENGTH, createArticleSchema } from "~/shared"
import { Loader2 } from "lucide-react"
import { useEffect } from "react"
import { useForm } from "react-hook-form"
import type { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

type ArticleFormData = z.infer<typeof createArticleSchema>

type ArticleEditorProps = {
  readonly defaultValues?: { readonly title?: string; readonly body?: string }
  readonly onSubmit: (data: ArticleFormData) => void
  readonly isSubmitting?: boolean
  readonly submitLabel?: string
}

export function ArticleEditor({
  defaultValues,
  onSubmit,
  isSubmitting = false,
  submitLabel = "保存",
}: ArticleEditorProps) {
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<ArticleFormData>({
    resolver: zodResolver(createArticleSchema),
    defaultValues: {
      title: defaultValues?.title ?? "",
      body: defaultValues?.body ?? "",
    },
  })

  useEffect(() => {
    if (defaultValues?.title || defaultValues?.body) {
      reset({
        title: defaultValues.title ?? "",
        body: defaultValues.body ?? "",
      })
    }
  }, [defaultValues, reset])

  const titleLength = watch("title")?.length ?? 0
  const bodyLength = watch("body")?.length ?? 0

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="title">タイトル</Label>
          <span className="text-xs text-muted-foreground">
            {titleLength}/{MAX_TITLE_LENGTH}
          </span>
        </div>
        <Input id="title" placeholder="タイトルを入力" {...register("title")} />
        {errors.title ? <p className="text-sm text-destructive">{errors.title.message}</p> : null}
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="body">本文</Label>
          <span className="text-xs text-muted-foreground">
            {bodyLength}/{MAX_BODY_LENGTH}
          </span>
        </div>
        <Textarea
          id="body"
          placeholder="本文を入力"
          className="min-h-[200px] sm:min-h-[300px]"
          rows={10}
          {...register("body")}
        />
        {errors.body ? <p className="text-sm text-destructive">{errors.body.message}</p> : null}
      </div>

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            保存中...
          </>
        ) : (
          submitLabel
        )}
      </Button>
    </form>
  )
}
