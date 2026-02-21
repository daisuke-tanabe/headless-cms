import { Hono } from "hono"
import { HTTPException } from "hono/http-exception"
import { secureHeaders } from "hono/secure-headers"
import { clerkMiddleware } from "./middleware/auth.js"
import { articlesRoute } from "./routes/articles.js"
import { chatRoute } from "./routes/chat.js"

const app = new Hono().basePath("/api")

app.use("*", secureHeaders())
app.use("*", clerkMiddleware())

// TODO: Vercel サーバーレス環境では外部ストア（Upstash Redis 等）が必要
// 本番トラフィック増加時に hono-rate-limiter + Upstash を導入すること

const routes = app
	// Public endpoint — no auth required
	.get("/health", (c) => {
		return c.json({ status: "ok" })
	})
	.route("/articles", articlesRoute)
	.route("/chat", chatRoute)

app.onError((err, c) => {
	if (err instanceof HTTPException) {
		return err.getResponse()
	}
	console.error("Unhandled error:", err instanceof Error ? err.message : "Unknown error")
	return c.json({ error: "Internal Server Error" }, 500)
})

export type AppType = typeof routes

export { app }
