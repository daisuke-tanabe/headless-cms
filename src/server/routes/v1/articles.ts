import { zValidator } from "@hono/zod-validator"
import { Hono } from "hono"
import { z } from "zod"
import { paginationSchema } from "../../../shared/index.js"
import { getOrgId } from "../../middleware/auth.js"
import type { ArticleRepository } from "../../repositories/article-repository.js"

const slugParamSchema = z.object({
  slug: z.string().min(1),
})

export const createV1ArticlesRoute = (articleRepo: ArticleRepository) =>
  new Hono()
    .get("/", zValidator("query", paginationSchema), async (c) => {
      const orgId = getOrgId(c)
      const { page, limit } = c.req.valid("query")
      try {
        const result = await articleRepo.findAll(orgId, page, limit)
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
      const orgId = getOrgId(c)
      const { slug } = c.req.valid("param")
      const article = await articleRepo.findBySlug(slug, orgId)

      if (!article) {
        return c.json({ error: "Not Found" }, 404)
      }

      return c.json({ data: article })
    })
