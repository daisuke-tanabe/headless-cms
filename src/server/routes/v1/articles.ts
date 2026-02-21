import { zValidator } from "@hono/zod-validator"
import { Hono } from "hono"
import { z } from "zod"
import { paginationSchema } from "../../../shared/index"
import { getUserId } from "../../middleware/auth"
import { articleRepository } from "../../repositories/article-repository"

const slugParamSchema = z.object({
  slug: z.string().min(1),
})

export const v1ArticlesRoute = new Hono()
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
        "v1 Articles findAll error:",
        error instanceof Error ? error.message : "Unknown error",
      )
      return c.json({ error: "Failed to fetch articles" }, 500)
    }
  })
  .get("/:slug", zValidator("param", slugParamSchema), async (c) => {
    const userId = getUserId(c)
    const { slug } = c.req.valid("param")
    const article = await articleRepository.findBySlug(slug, userId)

    if (!article) {
      return c.json({ error: "Not Found" }, 404)
    }

    return c.json({ data: article })
  })
