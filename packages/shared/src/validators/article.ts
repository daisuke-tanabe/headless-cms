import { z } from "zod"
import { MAX_BODY_LENGTH, MAX_TITLE_LENGTH } from "../constants.js"

export const createArticleSchema = z.object({
	title: z
		.string()
		.min(1, "タイトルは必須です")
		.max(MAX_TITLE_LENGTH, `タイトルは${MAX_TITLE_LENGTH}文字以内です`),
	body: z
		.string()
		.min(1, "本文は必須です")
		.max(MAX_BODY_LENGTH, `本文は${MAX_BODY_LENGTH}文字以内です`),
})

export const updateArticleSchema = z.object({
	title: z
		.string()
		.min(1, "タイトルは必須です")
		.max(MAX_TITLE_LENGTH, `タイトルは${MAX_TITLE_LENGTH}文字以内です`)
		.optional(),
	body: z
		.string()
		.min(1, "本文は必須です")
		.max(MAX_BODY_LENGTH, `本文は${MAX_BODY_LENGTH}文字以内です`)
		.optional(),
})

export const paginationSchema = z.object({
	page: z.coerce.number().int().min(1).default(1),
	limit: z.coerce.number().int().min(1).max(100).default(20),
})

export type CreateArticleInput = z.infer<typeof createArticleSchema>
export type UpdateArticleInput = z.infer<typeof updateArticleSchema>
export type PaginationInput = z.infer<typeof paginationSchema>
