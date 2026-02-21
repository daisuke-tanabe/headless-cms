import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect } from "react"
import { useForm } from "react-hook-form"
import type { z } from "zod"
import { createArticleSchema } from "~/shared"

type ArticleFormData = z.infer<typeof createArticleSchema>

type ArticleEditorProps = {
  readonly formId: string
  readonly defaultValues?: { readonly title?: string; readonly body?: string }
  readonly onSubmit: (data: ArticleFormData) => void
  readonly isSubmitting?: boolean
}

export function ArticleEditor({
  formId,
  defaultValues,
  onSubmit,
  isSubmitting = false,
}: ArticleEditorProps) {
  const {
    register,
    handleSubmit,
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

  return (
    <form
      id={formId}
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col flex-1 max-w-3xl mx-auto w-full px-6 md:px-12 py-8"
    >
      <fieldset disabled={isSubmitting} className="flex flex-col flex-1 gap-1">
        <div>
          <input
            placeholder="タイトル"
            className="w-full text-2xl font-bold bg-transparent border-none outline-none placeholder:text-muted-foreground/40"
            {...register("title")}
          />
          {errors.title ? (
            <p className="text-xs text-destructive mt-1">{errors.title.message}</p>
          ) : null}
        </div>

        <div className="flex flex-col flex-1">
          <textarea
            placeholder="ここに本文を書く..."
            className="w-full flex-1 min-h-[300px] resize-none text-base leading-relaxed bg-transparent border-none outline-none placeholder:text-muted-foreground/40 mt-4"
            {...register("body")}
          />
          {errors.body ? (
            <p className="text-xs text-destructive mt-1">{errors.body.message}</p>
          ) : null}
        </div>
      </fieldset>
    </form>
  )
}
