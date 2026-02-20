import { Hono } from "hono"

const app = new Hono().basePath("/api")

const routes = app.get("/health", (c) => {
	return c.json({ status: "ok" })
})

export type AppType = typeof routes

export { app }
