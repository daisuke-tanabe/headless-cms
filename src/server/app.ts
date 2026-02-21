import { Hono } from "hono"
import { HTTPException } from "hono/http-exception"
import { clerkMiddleware } from "./middleware/auth.js"
import { articlesRoute } from "./routes/articles.js"
import { chatRoute } from "./routes/chat.js"

const app = new Hono().basePath("/api")

app.use("*", clerkMiddleware())

const routes = app
	.get("/health", (c) => {
		return c.json({ status: "ok" })
	})
	.route("/articles", articlesRoute)
	.route("/chat", chatRoute)

app.onError((err, c) => {
	if (err instanceof HTTPException) {
		return err.getResponse()
	}
	console.error("Unhandled error:", err)
	return c.json({ error: "Internal Server Error" }, 500)
})

export type AppType = typeof routes

export { app }
