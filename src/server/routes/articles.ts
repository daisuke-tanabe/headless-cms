import { zValidator } from "@hono/zod-validator"
import { Hono } from "hono"
import { z } from "zod"
import { createArticleSchema, paginationSchema, updateArticleSchema } from "../../shared/index.js"
import { getOrgId, getUserId, requireOrg } from "../middleware/auth.js"
import type { ArticleRepository } from "../repositories/article-repository.js"

const idParamSchema = z.object({ id: z.string().uuid() })

export const createArticlesRoute = (articleRepo: ArticleRepository) =>
  new Hono()
    .use("*", requireOrg)
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
          "Articles findAll error:",
          error instanceof Error ? error.message : "Unknown error",
        )
        return c.json({ error: "Failed to fetch articles" }, 500)
      }
    })
    .get("/count", async (c) => {
      const orgId = getOrgId(c)
      const count = await articleRepo.count(orgId)
      return c.json({ data: { count } })
    })
    .get("/:id", zValidator("param", idParamSchema), async (c) => {
      const orgId = getOrgId(c)
      const { id } = c.req.valid("param")
      const article = await articleRepo.findById(id, orgId)

      if (!article) {
        return c.json({ error: "Not Found" }, 404)
      }

      return c.json({ data: article })
    })
    .post("/", zValidator("json", createArticleSchema), async (c) => {
      const orgId = getOrgId(c)
      const userId = getUserId(c)
      const data = c.req.valid("json")
      const article = await articleRepo.create(orgId, userId, data)
      return c.json({ data: article }, 201)
    })
    .patch(
      "/:id",
      zValidator("param", idParamSchema),
      zValidator("json", updateArticleSchema),
      async (c) => {
        const orgId = getOrgId(c)
        const { id } = c.req.valid("param")
        const data = c.req.valid("json")
        const article = await articleRepo.update(id, orgId, data)

        if (!article) {
          return c.json({ error: "Not Found" }, 404)
        }

        return c.json({ data: article })
      },
    )
    .delete("/:id", zValidator("param", idParamSchema), async (c) => {
      const orgId = getOrgId(c)
      const { id } = c.req.valid("param")
      const article = await articleRepo.softDelete(id, orgId)

      if (!article) {
        return c.json({ error: "Not Found" }, 404)
      }

      return c.json({ data: { success: true } })
    })
