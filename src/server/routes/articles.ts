import { zValidator } from "@hono/zod-validator"
import { Hono } from "hono"
import { z } from "zod"
import { createArticleSchema, paginationSchema, updateArticleSchema } from "../../shared/index"
import { getUserId, requireAuth } from "../middleware/auth"
import { articleRepository } from "../repositories/article-repository"

const idParamSchema = z.object({ id: z.string().uuid() })

export const articlesRoute = new Hono()
  .use("*", requireAuth)
  .get("/", zValidator("query", paginationSchema), async (c) => {
    const userId = getUserId(c)
    const { page, limit } = c.req.valid("query")
    try {
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
    } catch (error) {
      console.error(
        "Articles findAll error:",
        error instanceof Error ? error.message : "Unknown error",
      )
      return c.json({ error: "Failed to fetch articles" }, 500)
    }
  })
  .get("/count", async (c) => {
    const userId = getUserId(c)
    const count = await articleRepository.count(userId)
    return c.json({ data: { count } })
  })
  .get("/:id", zValidator("param", idParamSchema), async (c) => {
    const userId = getUserId(c)
    const { id } = c.req.valid("param")
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
  .patch(
    "/:id",
    zValidator("param", idParamSchema),
    zValidator("json", updateArticleSchema),
    async (c) => {
      const userId = getUserId(c)
      const { id } = c.req.valid("param")
      const data = c.req.valid("json")
      const article = await articleRepository.update(id, userId, data)

      if (!article) {
        return c.json({ error: "Not Found" }, 404)
      }

      return c.json({ data: article })
    },
  )
  .delete("/:id", zValidator("param", idParamSchema), async (c) => {
    const userId = getUserId(c)
    const { id } = c.req.valid("param")
    const article = await articleRepository.softDelete(id, userId)

    if (!article) {
      return c.json({ error: "Not Found" }, 404)
    }

    return c.json({ data: { success: true } })
  })
