import { Plus, Trash2 } from "lucide-react"
import { useState } from "react"
import { useForm } from "react-hook-form"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useCreateField, useDeleteField } from "@/hooks/use-content-types"
import type { Field, FieldType } from "~/shared"
import { FIELD_TYPES } from "~/shared"

type FieldEditorProps = {
  readonly contentTypeId: string
  readonly fields: readonly Field[]
}

type NewFieldForm = {
  slug: string
  name: string
  type: FieldType
  required: boolean
}

const FIELD_TYPE_LABELS: Record<string, string> = {
  text: "テキスト",
  richtext: "リッチテキスト",
  number: "数値",
  date: "日付",
  boolean: "真偽値",
}

export function FieldEditor({ contentTypeId, fields }: FieldEditorProps) {
  const [isAdding, setIsAdding] = useState(false)
  const [fieldToDelete, setFieldToDelete] = useState<string | null>(null)
  const createField = useCreateField()
  const deleteField = useDeleteField()

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<NewFieldForm>({
    defaultValues: { slug: "", name: "", type: "text" as FieldType, required: false },
  })

  const handleAdd = async (data: NewFieldForm) => {
    try {
      await createField.mutateAsync({
        contentTypeId,
        data: {
          slug: data.slug,
          name: data.name,
          type: data.type,
          required: data.required,
          order: fields.length,
        },
      })
      reset()
      setIsAdding(false)
    } catch (err) {
      console.error(err)
    }
  }

  const handleDelete = (fieldId: string) => {
    setFieldToDelete(fieldId)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">フィールド定義</h3>
        {!isAdding ? (
          <Button
            size="sm"
            variant="outline"
            className="h-7 text-xs"
            onClick={() => setIsAdding(true)}
          >
            <Plus className="h-3 w-3 mr-1" />
            フィールド追加
          </Button>
        ) : null}
      </div>

      {/* Field list */}
      {fields.length > 0 ? (
        <div className="border rounded-lg divide-y">
          {fields.map((field) => (
            <div key={field.id} className="flex items-center justify-between px-4 py-3">
              <div className="min-w-0">
                <p className="text-[13px] font-medium">{field.name}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {field.slug} · {FIELD_TYPE_LABELS[field.type] ?? field.type}
                  {field.required ? " · 必須" : ""}
                </p>
              </div>
              <Button
                size="sm"
                variant="ghost"
                className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                onClick={() => handleDelete(field.id)}
                disabled={deleteField.isPending}
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span className="sr-only">削除</span>
              </Button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs text-muted-foreground text-center py-4 border border-dashed rounded-lg">
          フィールドがありません
        </p>
      )}

      <AlertDialog
        open={fieldToDelete !== null}
        onOpenChange={(open) => {
          if (!open) setFieldToDelete(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>フィールドを削除しますか？</AlertDialogTitle>
            <AlertDialogDescription>
              削除するとエントリデータに影響する場合があります。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>キャンセル</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (fieldToDelete) {
                  try {
                    await deleteField.mutateAsync({ contentTypeId, fieldId: fieldToDelete })
                  } catch (err) {
                    console.error(err)
                  }
                }
              }}
            >
              削除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Add field form */}
      {isAdding ? (
        <form onSubmit={handleSubmit(handleAdd)} className="border rounded-lg p-4 space-y-3">
          <p className="text-xs font-semibold">新しいフィールド</p>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">スラッグ</Label>
              <Input
                className="h-8 text-xs"
                placeholder="例: title"
                {...register("slug", {
                  required: "スラッグは必須です",
                  pattern: {
                    value: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
                    message: "スラッグは小文字英数字とハイフンのみ使用できます",
                  },
                })}
              />
              {errors.slug ? (
                <p className="text-xs text-destructive">{errors.slug.message}</p>
              ) : null}
            </div>
            <div className="space-y-1">
              <Label className="text-xs">表示名</Label>
              <Input
                className="h-8 text-xs"
                placeholder="例: タイトル"
                {...register("name", { required: "表示名は必須です" })}
              />
              {errors.name ? (
                <p className="text-xs text-destructive">{errors.name.message}</p>
              ) : null}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">タイプ</Label>
              <Select value={watch("type")} onValueChange={(v) => setValue("type", v as FieldType)}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FIELD_TYPES.map((t) => (
                    <SelectItem key={t} value={t} className="text-xs">
                      {FIELD_TYPE_LABELS[t]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">必須</Label>
              <div className="flex items-center h-8">
                <Checkbox
                  id="field-required"
                  checked={watch("required")}
                  onCheckedChange={(checked) => setValue("required", checked === true)}
                />
                <Label htmlFor="field-required" className="text-xs ml-2 font-normal cursor-pointer">
                  必須フィールドにする
                </Label>
              </div>
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="h-7 text-xs"
              onClick={() => {
                reset()
                setIsAdding(false)
              }}
            >
              キャンセル
            </Button>
            <Button
              type="submit"
              size="sm"
              className="h-7 text-xs"
              disabled={createField.isPending}
            >
              追加
            </Button>
          </div>
        </form>
      ) : null}
    </div>
  )
}
