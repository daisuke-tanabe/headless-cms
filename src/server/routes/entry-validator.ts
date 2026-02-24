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

  const allowedSlugs = new Set(fields.map((f) => f.slug))
  for (const key of Object.keys(record)) {
    if (!allowedSlugs.has(key)) {
      return `フィールド「${key}」はこのコンテンツタイプに存在しません`
    }
  }

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

const TEXT_MAX_LENGTH = 100_000
const RICHTEXT_MAX_LENGTH = 500_000
const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:\d{2})?)?$/

const checkFieldType = (slug: string, type: Field["type"], value: unknown): string | null => {
  switch (type) {
    case "text":
      if (typeof value !== "string") return `フィールド「${slug}」は文字列である必要があります`
      if (value.length > TEXT_MAX_LENGTH)
        return `フィールド「${slug}」は${TEXT_MAX_LENGTH}文字以内である必要があります`
      break
    case "richtext":
      if (typeof value !== "string") return `フィールド「${slug}」は文字列である必要があります`
      if (value.length > RICHTEXT_MAX_LENGTH)
        return `フィールド「${slug}」は${RICHTEXT_MAX_LENGTH}文字以内である必要があります`
      break
    case "number":
      if (typeof value !== "number" || !Number.isFinite(value)) {
        return `フィールド「${slug}」は有限の数値である必要があります`
      }
      break
    case "date":
      if (
        typeof value !== "string" ||
        !ISO_DATE_RE.test(value) ||
        Number.isNaN(Date.parse(value))
      ) {
        return `フィールド「${slug}」は ISO 8601 形式の日付文字列である必要があります`
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
