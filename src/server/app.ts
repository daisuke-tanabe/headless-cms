import { Hono } from "hono"
import { cors } from "hono/cors"
import { HTTPException } from "hono/http-exception"
import { secureHeaders } from "hono/secure-headers"
import { CORS_MAX_AGE, DEFAULT_DEV_ORIGIN } from "./lib/constants.js"
import { requireApiKey } from "./middleware/api-key-auth.js"
import { clerkMiddleware } from "./middleware/auth.js"
import { apiKeysRoute } from "./routes/api-keys.js"
import { articlesRoute } from "./routes/articles.js"
import { chatRoute } from "./routes/chat.js"
import { v1ArticlesRoute } from "./routes/v1/articles.js"

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
app.use("/v1/*", requireApiKey)

const routes = app
  // Public endpoint — no auth required
  .get("/health", (c) => {
    return c.json({ status: "ok" })
  })
  .route("/articles", articlesRoute)
  .route("/chat", chatRoute)
  .route("/api-keys", apiKeysRoute)
  .route("/v1/articles", v1ArticlesRoute)

app.onError((err, c) => {
  if (err instanceof HTTPException) {
    return err.getResponse()
  }
  console.error("Unhandled error:", err instanceof Error ? err.message : "Unknown error")
  return c.json({ error: "Internal Server Error" }, 500)
})

export type AppType = typeof routes

export { app }
