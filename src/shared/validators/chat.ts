import { z } from "zod"
import {
  MAX_BODY_LENGTH,
  MAX_CHAT_INPUT_LENGTH,
  MAX_HISTORY_CONTENT_LENGTH,
  MAX_HISTORY_LENGTH,
  MAX_TITLE_LENGTH,
} from "../constants.js"

const pageContextSchema = z.discriminatedUnion("page", [
  z.object({ page: z.literal("dashboard") }),
  z.object({ page: z.literal("articles"), pageNum: z.number().int().min(1) }),
  z.object({
    page: z.literal("article_new"),
    editor: z.object({ title: z.string().max(MAX_TITLE_LENGTH), body: z.string().max(MAX_BODY_LENGTH) }),
  }),
  z.object({
    page: z.literal("article_edit"),
    article: z.object({
      id: z.string().uuid(),
      title: z.string().max(MAX_TITLE_LENGTH),
      body: z.string().max(MAX_BODY_LENGTH),
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
