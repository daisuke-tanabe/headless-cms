import { z } from "zod"
import { MAX_BODY_LENGTH, MAX_TITLE_LENGTH } from "../../shared"

const articleIdSchema = z.string().uuid()

export const getArticlesInputSchema = z.object({
  page: z.number().int().positive().optional(),
})

export const getArticleInputSchema = z.object({ id: articleIdSchema })

export const createArticleInputSchema = z.object({
  title: z.string().min(1).max(MAX_TITLE_LENGTH),
  body: z.string().max(MAX_BODY_LENGTH),
})

export const updateArticleInputSchema = z.object({
  id: articleIdSchema,
  title: z.string().min(1).max(MAX_TITLE_LENGTH).optional(),
  body: z.string().max(MAX_BODY_LENGTH).optional(),
})

export const deleteArticleInputSchema = z.object({ id: articleIdSchema })
