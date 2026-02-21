import { z } from "zod"

const safePathSchema = z
  .string()
  .regex(/^\/(?:dashboard|articles(?:\/new|\/[\w-]+)?)$/, "Invalid navigation path")

const articleIdSchema = z.string().uuid()

export const navigateInputSchema = z.object({ to: safePathSchema })

export const getArticlesInputSchema = z.object({
  page: z.number().int().positive().optional(),
})

export const getArticleInputSchema = z.object({ id: articleIdSchema })

export const createArticleInputSchema = z.object({
  title: z.string().min(1).max(200),
  body: z.string().max(50000),
})

export const updateArticleInputSchema = z.object({
  id: articleIdSchema,
  title: z.string().min(1).max(200).optional(),
  body: z.string().max(50000).optional(),
})

export const deleteArticleInputSchema = z.object({ id: articleIdSchema })
