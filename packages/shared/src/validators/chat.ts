import { z } from "zod"
import { MAX_CHAT_INPUT_LENGTH } from "../constants.js"

const pageContextSchema = z.discriminatedUnion("page", [
	z.object({ page: z.literal("dashboard") }),
	z.object({ page: z.literal("articles"), pageNum: z.number().int().min(1) }),
	z.object({
		page: z.literal("article_new"),
		editor: z.object({ title: z.string(), body: z.string() }),
	}),
	z.object({
		page: z.literal("article_edit"),
		article: z.object({ id: z.string(), title: z.string(), body: z.string() }),
	}),
])

export const chatRequestSchema = z.object({
	message: z
		.string()
		.min(1, "メッセージは必須です")
		.max(MAX_CHAT_INPUT_LENGTH, `メッセージは${MAX_CHAT_INPUT_LENGTH}文字以内です`),
	history: z.array(
		z.object({
			role: z.enum(["user", "assistant"]),
			content: z.string(),
		}),
	),
	context: pageContextSchema,
})

export type ChatRequestInput = z.infer<typeof chatRequestSchema>
