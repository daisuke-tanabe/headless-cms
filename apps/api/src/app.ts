import { Hono } from "hono"
import { clerkMiddleware } from "./middleware/auth.js"
import { articlesRoute } from "./routes/articles.js"

const app = new Hono().basePath("/api")

app.use("*", clerkMiddleware())

const routes = app
	.get("/health", (c) => {
		return c.json({ status: "ok" })
	})
	.route("/articles", articlesRoute)

app.onError((err, c) => {
	console.error("Unhandled error:", err)
	return c.json({ error: "Internal Server Error" }, 500)
})

export type AppType = typeof routes

export { app }
