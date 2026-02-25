import { z } from "zod"
import { FIELD_TYPES } from "../constants.js"

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

const slugSchema = z
  .string()
  .min(1, "スラッグは必須です")
  .max(64, "スラッグは64文字以内です")
  .regex(slugPattern, "スラッグは小文字英数字とハイフンのみ使用できます")

const nameSchema = z.string().min(1, "名前は必須です").max(64, "名前は64文字以内です")

export const createContentTypeSchema = z.object({
  slug: slugSchema,
  name: nameSchema,
})

export const updateContentTypeSchema = z.object({
  name: nameSchema,
})

export const createFieldSchema = z.object({
  slug: slugSchema,
  name: nameSchema,
  type: z.enum(FIELD_TYPES),
  required: z.boolean().default(false),
  order: z.number().int().min(0).default(0),
})

export const updateFieldSchema = z.object({
  name: z.string().min(1, "名前は必須です").max(64, "名前は64文字以内です").optional(),
  required: z.boolean().optional(),
  order: z.number().int().min(0).optional(),
})

export type CreateContentTypeInput = z.infer<typeof createContentTypeSchema>
export type UpdateContentTypeInput = z.infer<typeof updateContentTypeSchema>
export type CreateFieldInput = z.infer<typeof createFieldSchema>
export type UpdateFieldInput = z.infer<typeof updateFieldSchema>
