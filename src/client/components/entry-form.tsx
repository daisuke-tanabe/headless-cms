import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { match } from "ts-pattern"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useEditorStore } from "@/stores/editor-store"
import type { Field } from "~/shared"

type EntryFormProps = {
  readonly formId: string
  readonly fields: readonly Field[]
  readonly defaultValues?: Record<string, unknown>
  readonly onSubmit: (data: Record<string, unknown>) => void
  readonly isSubmitting?: boolean
  readonly onPendingContentConsumed?: (values: Record<string, unknown>) => void
}

export function EntryForm({
  formId,
  fields,
  defaultValues,
  onSubmit,
  isSubmitting = false,
  onPendingContentConsumed,
}: EntryFormProps) {
  const { pendingContent, clearPendingContent } = useEditorStore()
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    getValues,
    formState: { errors },
  } = useForm<Record<string, unknown>>({
    defaultValues: buildDefaultValues(fields, defaultValues),
  })

  useEffect(() => {
    if (defaultValues !== undefined) {
      reset(buildDefaultValues(fields, defaultValues))
    }
  }, [defaultValues, fields, reset])

  useEffect(() => {
    if (!pendingContent) return
    const newValues = buildDefaultValues(fields, { ...getValues(), ...pendingContent })
    reset(newValues)
    onPendingContentConsumed?.(newValues)
    clearPendingContent()
  }, [pendingContent, fields, reset, getValues, clearPendingContent, onPendingContentConsumed])

  return (
    <form
      id={formId}
      onSubmit={handleSubmit((raw) => {
        const clean = Object.fromEntries(
          Object.entries(raw).filter(
            ([, v]) => v !== "" && v !== null && !(typeof v === "number" && Number.isNaN(v)),
          ),
        )
        onSubmit(clean)
      })}
      className="flex flex-col flex-1 max-w-3xl mx-auto w-full px-6 md:px-12 py-8 gap-6"
    >
      <fieldset disabled={isSubmitting} className="flex flex-col gap-6">
        {fields.map((field) => (
          <div key={field.id} className="flex flex-col gap-1.5">
            <Label htmlFor={field.slug}>
              {field.name}
              {field.required ? <span className="text-destructive ml-1">*</span> : null}
              <span className="text-xs text-muted-foreground ml-2">({field.type})</span>
            </Label>

            {match(field.type)
              .with("text", () => (
                <Input id={field.slug} {...register(field.slug)} placeholder={field.name} />
              ))
              .with("richtext", () => (
                <Textarea
                  id={field.slug}
                  {...register(field.slug)}
                  placeholder={field.name}
                  className="min-h-[200px] resize-y"
                />
              ))
              .with("number", () => (
                <Input
                  id={field.slug}
                  type="number"
                  {...register(field.slug, { valueAsNumber: true })}
                  placeholder="例: 100"
                />
              ))
              .with("date", () => <Input id={field.slug} type="date" {...register(field.slug)} />)
              .with("boolean", () => (
                <div className="flex items-center gap-2">
                  <Checkbox
                    id={field.slug}
                    checked={Boolean(watch(field.slug))}
                    onCheckedChange={(checked) => setValue(field.slug, checked === true)}
                  />
                  <Label htmlFor={field.slug} className="font-normal cursor-pointer">
                    有効にする
                  </Label>
                </div>
              ))
              .exhaustive()}

            {errors[field.slug] ? (
              <p className="text-xs text-destructive">
                {String(errors[field.slug]?.message ?? "入力エラー")}
              </p>
            ) : null}
          </div>
        ))}

        {fields.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            フィールドが定義されていません。コンテンツタイプ詳細でフィールドを追加してください。
          </p>
        ) : null}
      </fieldset>
    </form>
  )
}

function buildDefaultValues(
  fields: readonly Field[],
  overrides?: Record<string, unknown>,
): Record<string, unknown> {
  const defaults = Object.fromEntries(
    fields.map((field) => [
      field.slug,
      match(field.type)
        .with("boolean", () => false as unknown)
        .with("text", "richtext", "number", "date", () => "" as unknown)
        .exhaustive(),
    ]),
  )
  if (!overrides) return defaults
  const filtered = Object.fromEntries(
    Object.entries(overrides).filter(([, value]) => value !== undefined && value !== null),
  )
  return { ...defaults, ...filtered }
}
