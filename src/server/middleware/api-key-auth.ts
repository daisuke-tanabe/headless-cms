import { createMiddleware } from "hono/factory"
import { HTTPException } from "hono/http-exception"
import { hashApiKey } from "../lib/api-key.js"
import type { ApiKeyRepository } from "../repositories/api-key-repository.js"

type ApiKeyAuthEnv = {
  Variables: {
    userId: string
    orgId: string
  }
}

export const createRequireApiKey = (apiKeyRepo: ApiKeyRepository) =>
  createMiddleware<ApiKeyAuthEnv>(async (c, next) => {
    const authHeader = c.req.header("Authorization")
    if (!authHeader?.startsWith("Bearer ")) {
      throw new HTTPException(401, { message: "Missing or invalid Authorization header" })
    }

    const token = authHeader.slice(7)
    if (!token.startsWith("sk_cms_")) {
      throw new HTTPException(401, { message: "Invalid API key format" })
    }

    const hashedKey = hashApiKey(token)
    const apiKey = await apiKeyRepo.findByHash(hashedKey)

    if (!apiKey) {
      throw new HTTPException(401, { message: "Invalid API key" })
    }

    c.set("orgId", apiKey.orgId)
    c.set("userId", apiKey.userId)

    // Update lastUsedAt in background (don't block the response)
    apiKeyRepo.updateLastUsed(apiKey.id).catch((err) => {
      console.error(
        "Failed to update lastUsedAt:",
        err instanceof Error ? err.message : "Unknown error",
      )
    })

    await next()
  })
