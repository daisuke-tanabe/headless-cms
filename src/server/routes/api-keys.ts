import { zValidator } from "@hono/zod-validator"
import { Hono } from "hono"
import { deleteApiKeyParamSchema } from "../../shared/index"
import { extractPrefix, generateApiKey, hashApiKey } from "../lib/api-key"
import { getUserId, requireAuth } from "../middleware/auth"
import { apiKeyRepository } from "../repositories/api-key-repository"

export const apiKeysRoute = new Hono()
  .use("*", requireAuth)
  .get("/", async (c) => {
    const userId = getUserId(c)
    try {
      const keys = await apiKeyRepository.findAll(userId)
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
    const userId = getUserId(c)
    try {
      const rawKey = generateApiKey()
      const hashedKey = hashApiKey(rawKey)
      const prefix = extractPrefix(rawKey)
      const apiKey = await apiKeyRepository.create(userId, hashedKey, prefix)
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
    const userId = getUserId(c)
    const { id } = c.req.valid("param")
    try {
      const result = await apiKeyRepository.deleteKey(id, userId)
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
