import type { Field } from "../../shared/index.js"

type FieldLike = Pick<Field, "slug" | "type" | "required">

/**
 * ContentType の Field 定義に基づいて entry.data をバリデーションします。
 * @param data - エントリのデータ（Record<string, unknown>）
 * @param fields - フィールド定義一覧
 * @param checkRequired - true の場合は required フィールドの存在チェックを行う
 * @returns エラーメッセージ（問題なければ null）
 */
export const validateEntryData = (
  data: unknown,
  fields: readonly FieldLike[],
  checkRequired = true,
): string | null => {
  if (data === null || data === undefined || typeof data !== "object" || Array.isArray(data)) {
    return "data は object である必要があります"
  }

  const record = data as Record<string, unknown>

  for (const field of fields) {
    const value = record[field.slug]

    if (
      checkRequired &&
      field.required &&
      (value === undefined || value === null || value === "")
    ) {
      return `フィールド「${field.slug}」は必須です`
    }

    if (value === undefined || value === null) continue

    const typeError = checkFieldType(field.slug, field.type, value)
    if (typeError) return typeError
  }

  return null
}

const checkFieldType = (slug: string, type: Field["type"], value: unknown): string | null => {
  switch (type) {
    case "text":
    case "richtext":
      if (typeof value !== "string") {
        return `フィールド「${slug}」は文字列である必要があります`
      }
      break
    case "number":
      if (typeof value !== "number") {
        return `フィールド「${slug}」は数値である必要があります`
      }
      break
    case "date":
      if (typeof value !== "string" || Number.isNaN(Date.parse(value))) {
        return `フィールド「${slug}」は有効な日付文字列である必要があります`
      }
      break
    case "boolean":
      if (typeof value !== "boolean") {
        return `フィールド「${slug}」は真偽値である必要があります`
      }
      break
  }
  return null
}
