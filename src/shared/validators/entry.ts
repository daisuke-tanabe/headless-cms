import { z } from "zod"

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
})

export const createEntrySchema = z.object({
  data: z.record(z.string(), z.unknown()),
})

export const updateEntrySchema = z.object({
  data: z.record(z.string(), z.unknown()),
})

export type PaginationInput = z.infer<typeof paginationSchema>
export type CreateEntryInput = z.infer<typeof createEntrySchema>
export type UpdateEntryInput = z.infer<typeof updateEntrySchema>
