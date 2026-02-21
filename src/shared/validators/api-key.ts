import { z } from "zod"

export const deleteApiKeyParamSchema = z.object({
  id: z.string().uuid(),
})
