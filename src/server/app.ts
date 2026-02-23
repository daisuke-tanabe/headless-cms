import Anthropic from "@anthropic-ai/sdk"
import { Hono } from "hono"
import { cors } from "hono/cors"
import { HTTPException } from "hono/http-exception"
import { secureHeaders } from "hono/secure-headers"
import { CORS_MAX_AGE, DEFAULT_DEV_ORIGIN } from "./lib/constants.js"
import { prisma } from "./lib/prisma.js"
import { createRequireApiKey } from "./middleware/api-key-auth.js"
import { clerkMiddleware } from "./middleware/auth.js"
import { createApiKeyRepository } from "./repositories/api-key-repository.js"
import { createArticleRepository } from "./repositories/article-repository.js"
import { createApiKeysRoute } from "./routes/api-keys.js"
import { createArticlesRoute } from "./routes/articles.js"
import { createChatRoute } from "./routes/chat.js"
import { createV1ArticlesRoute } from "./routes/v1/articles.js"
import { createProcessChat } from "./services/ai-service.js"
import { createToolExecutor } from "./tools/executor.js"

// --- Dependency injection ---

const articleRepo = createArticleRepository(prisma)
const apiKeyRepo = createApiKeyRepository(prisma)

const executeToolUse = createToolExecutor({ articleRepo })
const processChat = createProcessChat({ anthropic: new Anthropic(), executeToolUse })

// --- App setup ---

const buildAllowedOrigins = (): string[] => {
  if (process.env.ALLOWED_ORIGINS) {
    return process.env.ALLOWED_ORIGINS.split(",")
  }
  if (process.env.VERCEL_URL) {
    return [`https://${process.env.VERCEL_URL}`]
  }
  return [DEFAULT_DEV_ORIGIN]
}

const allowedOrigins = buildAllowedOrigins()

const app = new Hono().basePath("/api")

app.use(
  "*",
  cors({
    origin: allowedOrigins,
    allowMethods: ["GET", "POST", "PATCH", "DELETE"],
    allowHeaders: ["Content-Type", "Authorization"],
    maxAge: CORS_MAX_AGE,
  }),
)
app.use("*", secureHeaders())
app.use("*", clerkMiddleware())

// TODO: Vercel サーバーレス環境では外部ストア（Upstash Redis 等）が必要
// 本番トラフィック増加時に hono-rate-limiter + Upstash を導入すること

// Public API (v1) — CORS: allow all origins, auth via API key
app.use(
  "/v1/*",
  cors({
    origin: "*",
    allowMethods: ["GET"],
    allowHeaders: ["Content-Type", "Authorization"],
    maxAge: CORS_MAX_AGE,
  }),
)
app.use("/v1/*", createRequireApiKey(apiKeyRepo))

const routes = app
  // Public endpoint — no auth required
  .get("/health", (c) => {
    return c.json({ status: "ok" })
  })
  .route("/articles", createArticlesRoute(articleRepo))
  .route("/chat", createChatRoute(processChat))
  .route("/api-keys", createApiKeysRoute(apiKeyRepo))
  .route("/v1/articles", createV1ArticlesRoute(articleRepo))

app.onError((err, c) => {
  if (err instanceof HTTPException) {
    return c.json({ error: err.message }, err.status)
  }
  console.error("Unhandled error:", err instanceof Error ? err.message : "Unknown error")
  return c.json({ error: "Internal Server Error" }, 500)
})

export type AppType = typeof routes

export { app }
