import type { MiddlewareHandler } from "hono"
import { HTTPException } from "hono/http-exception"
import { hashApiKey } from "../lib/api-key"
import { apiKeyRepository } from "../repositories/api-key-repository"

export const requireApiKey: MiddlewareHandler = async (c, next) => {
  const authHeader = c.req.header("Authorization")
  if (!authHeader?.startsWith("Bearer ")) {
    throw new HTTPException(401, { message: "Missing or invalid Authorization header" })
  }

  const token = authHeader.slice(7)
  if (!token.startsWith("sk_cms_")) {
    throw new HTTPException(401, { message: "Invalid API key format" })
  }

  const hashedKey = hashApiKey(token)
  const apiKey = await apiKeyRepository.findByHash(hashedKey)

  if (!apiKey) {
    throw new HTTPException(401, { message: "Invalid API key" })
  }

  c.set("userId" as never, apiKey.userId)

  // Update lastUsedAt in background (don't block the response)
  apiKeyRepository.updateLastUsed(apiKey.id).catch((err) => {
    console.error(
      "Failed to update lastUsedAt:",
      err instanceof Error ? err.message : "Unknown error",
    )
  })

  await next()
}
