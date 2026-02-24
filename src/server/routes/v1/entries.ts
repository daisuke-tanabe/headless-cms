import { zValidator } from "@hono/zod-validator"
import { Hono } from "hono"
import { z } from "zod"
import { paginationSchema } from "../../../shared/index.js"
import { getOrgId } from "../../middleware/auth.js"
import type { ContentTypeRepository } from "../../repositories/content-type-repository.js"
import type { EntryRepository } from "../../repositories/entry-repository.js"

const contentTypeParamSchema = z.object({ contentType: z.string().min(1) })
const slugParamSchema = z.object({ contentType: z.string().min(1), slug: z.string().min(1) })

type Deps = {
  readonly contentTypeRepo: ContentTypeRepository
  readonly entryRepo: EntryRepository
}

export const createV1EntriesRoute = (deps: Deps) =>
  new Hono()
    .get(
      "/:contentType",
      zValidator("param", contentTypeParamSchema),
      zValidator("query", paginationSchema),
      async (c) => {
        const orgId = getOrgId(c)
        const { contentType: contentTypeSlug } = c.req.valid("param")
        const { page, limit } = c.req.valid("query")

        const contentType = await deps.contentTypeRepo.findBySlug(contentTypeSlug, orgId)
        if (!contentType) return c.json({ error: "Not Found" }, 404)

        const result = await deps.entryRepo.findAll(contentType.id, orgId, page, limit)
        return c.json({
          data: result.entries,
          meta: {
            total: result.total,
            page: result.page,
            limit: result.limit,
            totalPages: result.totalPages,
          },
        })
      },
    )
    .get("/:contentType/:slug", zValidator("param", slugParamSchema), async (c) => {
      const orgId = getOrgId(c)
      const { contentType: contentTypeSlug, slug } = c.req.valid("param")

      const contentType = await deps.contentTypeRepo.findBySlug(contentTypeSlug, orgId)
      if (!contentType) return c.json({ error: "Not Found" }, 404)

      const entry = await deps.entryRepo.findBySlug(slug, orgId)
      if (!entry) return c.json({ error: "Not Found" }, 404)

      return c.json({ data: entry })
    })
