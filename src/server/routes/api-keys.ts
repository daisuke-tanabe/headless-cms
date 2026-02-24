import { zValidator } from "@hono/zod-validator"
import type { Context } from "hono"
import { Hono } from "hono"
import { deleteApiKeyParamSchema } from "../../shared/index.js"
import { extractPrefix, generateApiKey, hashApiKey } from "../lib/api-key.js"
import { getOrgId, getUserId, requireOrg } from "../middleware/auth.js"
import type { ApiKeyRepository } from "../repositories/api-key-repository.js"

const handleError = (c: Context, error: unknown, action: "fetch" | "create" | "delete") => {
  console.error(
    `ApiKeys ${action} error:`,
    error instanceof Error ? error.message : "Unknown error",
  )
  return c.json({ error: `Failed to ${action}` }, 500)
}

export const createApiKeysRoute = (apiKeyRepo: ApiKeyRepository) =>
  new Hono()
    .use("*", requireOrg)
    .get("/", async (c) => {
      const orgId = getOrgId(c)
      try {
        const keys = await apiKeyRepo.findAll(orgId)
        return c.json({ data: keys })
      } catch (error) {
        return handleError(c, error, "fetch")
      }
    })
    .post("/", async (c) => {
      const orgId = getOrgId(c)
      const userId = getUserId(c)
      try {
        const rawKey = generateApiKey()
        const hashedKey = hashApiKey(rawKey)
        const prefix = extractPrefix(rawKey)
        const apiKey = await apiKeyRepo.create(orgId, userId, hashedKey, prefix)
        return c.json({ data: { ...apiKey, key: rawKey } }, 201)
      } catch (error) {
        return handleError(c, error, "create")
      }
    })
    .delete("/:id", zValidator("param", deleteApiKeyParamSchema), async (c) => {
      const orgId = getOrgId(c)
      const { id } = c.req.valid("param")
      try {
        const result = await apiKeyRepo.deleteKey(id, orgId)
        if (!result) {
          return c.json({ error: "Not Found" }, 404)
        }
        return c.json({ data: { success: true } })
      } catch (error) {
        return handleError(c, error, "delete")
      }
    })
