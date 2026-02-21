import Anthropic from "@anthropic-ai/sdk"
import { zValidator } from "@hono/zod-validator"
import { Hono } from "hono"
import { chatRequestSchema } from "../../shared"
import { getUserId, requireAuth } from "../middleware/auth"
import { processChat } from "../services/ai-service"

export const chatRoute = new Hono()
  .use("*", requireAuth)
  .post("/", zValidator("json", chatRequestSchema), async (c) => {
    const userId = getUserId(c)
    const request = c.req.valid("json")

    try {
      const response = await processChat(request, userId)
      return c.json(response)
    } catch (error) {
      if (error instanceof Anthropic.RateLimitError) {
        return c.json(
          { error: "リクエストが集中しています。しばらくお待ちください。", action: null },
          503,
        )
      }

      console.error("Chat error:", error instanceof Error ? error.message : "Unknown error")
      return c.json({ error: "AIの処理中にエラーが発生しました。", action: null }, 503)
    }
  })
