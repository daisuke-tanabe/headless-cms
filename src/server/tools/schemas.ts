import { z } from "zod"

const entryIdSchema = z.string().uuid()

export const getEntriesInputSchema = z.object({
  page: z.number().int().positive().optional(),
})

export const getEntryInputSchema = z.object({ id: entryIdSchema })

export const createEntryInputSchema = z.object({
  contentTypeId: z.string().uuid(),
  data: z.record(z.string(), z.unknown()),
})

export const updateEntryInputSchema = z.object({
  id: entryIdSchema,
  contentTypeId: z.string().uuid(),
  data: z.record(z.string(), z.unknown()),
})

export const deleteEntryInputSchema = z.object({ id: entryIdSchema })
