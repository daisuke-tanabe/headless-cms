import { z } from "zod"
import {
  FIELD_TYPES,
  MAX_CHAT_INPUT_LENGTH,
  MAX_HISTORY_CONTENT_LENGTH,
  MAX_HISTORY_LENGTH,
} from "../constants.js"

const fieldSchema = z.object({
  id: z.string(),
  contentTypeId: z.string(),
  slug: z.string(),
  name: z.string(),
  type: z.enum(FIELD_TYPES),
  required: z.boolean(),
  order: z.number().int(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

const pageContextSchema = z.discriminatedUnion("page", [
  z.object({ page: z.literal("dashboard") }),
  z.object({ page: z.literal("content_type_list") }),
  z.object({
    page: z.literal("content_type_detail"),
    contentTypeId: z.string(),
    contentTypeName: z.string(),
  }),
  z.object({
    page: z.literal("entry_list"),
    contentTypeId: z.string(),
    contentTypeName: z.string(),
    pageNum: z.number().int().min(1),
  }),
  z.object({
    page: z.literal("entry_new"),
    contentTypeId: z.string(),
    contentTypeName: z.string(),
    fields: z.array(fieldSchema),
    editor: z.record(z.string(), z.unknown()),
  }),
  z.object({
    page: z.literal("entry_edit"),
    contentTypeId: z.string(),
    contentTypeName: z.string(),
    fields: z.array(fieldSchema),
    entry: z.object({
      id: z.string(),
      data: z.record(z.string(), z.unknown()),
    }),
  }),
])

export const chatRequestSchema = z.object({
  message: z
    .string()
    .min(1, "メッセージは必須です")
    .max(MAX_CHAT_INPUT_LENGTH, `メッセージは${MAX_CHAT_INPUT_LENGTH}文字以内です`),
  history: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().max(MAX_HISTORY_CONTENT_LENGTH),
      }),
    )
    .max(MAX_HISTORY_LENGTH),
  context: pageContextSchema,
})

export type ChatRequestInput = z.infer<typeof chatRequestSchema>
