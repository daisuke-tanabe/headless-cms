import { zValidator } from "@hono/zod-validator"
import { createArticleSchema, paginationSchema, updateArticleSchema } from "@ai-cms/shared"
import { Hono } from "hono"
import { getUserId, requireAuth } from "../middleware/auth.js"
import { articleRepository } from "../repositories/article-repository.js"

export const articlesRoute = new Hono()
	.use("*", requireAuth)
	.get("/", zValidator("query", paginationSchema), async (c) => {
		const userId = getUserId(c)
		const { page, limit } = c.req.valid("query")
		const result = await articleRepository.findAll(userId, page, limit)

		return c.json({
			data: result.articles,
			meta: {
				total: result.total,
				page: result.page,
				limit: result.limit,
				totalPages: result.totalPages,
			},
		})
	})
	.get("/count", async (c) => {
		const userId = getUserId(c)
		const count = await articleRepository.count(userId)
		return c.json({ data: { count } })
	})
	.get("/:id", async (c) => {
		const userId = getUserId(c)
		const id = c.req.param("id")
		const article = await articleRepository.findById(id, userId)

		if (!article) {
			return c.json({ error: "Not Found" }, 404)
		}

		return c.json({ data: article })
	})
	.post("/", zValidator("json", createArticleSchema), async (c) => {
		const userId = getUserId(c)
		const data = c.req.valid("json")
		const article = await articleRepository.create(userId, data)
		return c.json({ data: article }, 201)
	})
	.patch("/:id", zValidator("json", updateArticleSchema), async (c) => {
		const userId = getUserId(c)
		const id = c.req.param("id")
		const data = c.req.valid("json")
		const article = await articleRepository.update(id, userId, data)

		if (!article) {
			return c.json({ error: "Not Found" }, 404)
		}

		return c.json({ data: article })
	})
	.delete("/:id", async (c) => {
		const userId = getUserId(c)
		const id = c.req.param("id")
		const article = await articleRepository.softDelete(id, userId)

		if (!article) {
			return c.json({ error: "Not Found" }, 404)
		}

		return c.json({ data: { success: true } })
	})
