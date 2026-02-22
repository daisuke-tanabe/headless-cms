import { zValidator } from "@hono/zod-validator"
import { Hono } from "hono"
import { deleteApiKeyParamSchema } from "../../shared/index.js"
import { extractPrefix, generateApiKey, hashApiKey } from "../lib/api-key.js"
import { getOrgId, getUserId, requireOrg } from "../middleware/auth.js"
import type { ApiKeyRepository } from "../repositories/api-key-repository.js"

export const createApiKeysRoute = (apiKeyRepo: ApiKeyRepository) =>
  new Hono()
    .use("*", requireOrg)
    .get("/", async (c) => {
      const orgId = getOrgId(c)
      try {
        const keys = await apiKeyRepo.findAll(orgId)
        return c.json({ data: keys })
      } catch (error) {
        console.error(
          "ApiKeys findAll error:",
          error instanceof Error ? error.message : "Unknown error",
        )
        return c.json({ error: "Failed to fetch API keys" }, 500)
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
        console.error(
          "ApiKeys create error:",
          error instanceof Error ? error.message : "Unknown error",
        )
        return c.json({ error: "Failed to create API key" }, 500)
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
        console.error(
          "ApiKeys delete error:",
          error instanceof Error ? error.message : "Unknown error",
        )
        return c.json({ error: "Failed to delete API key" }, 500)
      }
    })
