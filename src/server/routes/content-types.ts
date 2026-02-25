import { zValidator } from "@hono/zod-validator"
import { Hono } from "hono"
import { z } from "zod"
import {
  createContentTypeSchema,
  createEntrySchema,
  createFieldSchema,
  paginationSchema,
  updateContentTypeSchema,
  updateEntrySchema,
  updateFieldSchema,
} from "../../shared/index.js"
import { getOrgId, getUserId, requireOrg } from "../middleware/auth.js"
import type { ContentTypeRepository } from "../repositories/content-type-repository.js"
import type { EntryRepository } from "../repositories/entry-repository.js"
import type { FieldRepository } from "../repositories/field-repository.js"
import { validateEntryData } from "./entry-validator.js"

const idParamSchema = z.object({ id: z.string().uuid() })
const fieldParamSchema = z.object({ id: z.string().uuid(), fieldId: z.string().uuid() })
const entryParamSchema = z.object({ id: z.string().uuid(), entryId: z.string().uuid() })

type Deps = {
  readonly contentTypeRepo: ContentTypeRepository
  readonly fieldRepo: FieldRepository
  readonly entryRepo: EntryRepository
}

export const createContentTypesRoute = (deps: Deps) =>
  new Hono()
    .use("*", requireOrg)
    // ContentType CRUD
    .get("/", async (c) => {
      const orgId = getOrgId(c)
      const contentTypes = await deps.contentTypeRepo.findAll(orgId)
      return c.json({ data: contentTypes })
    })
    .post("/", zValidator("json", createContentTypeSchema), async (c) => {
      const orgId = getOrgId(c)
      const data = c.req.valid("json")
      const contentType = await deps.contentTypeRepo.create(orgId, data)
      return c.json({ data: contentType }, 201)
    })
    .get("/:id", zValidator("param", idParamSchema), async (c) => {
      const orgId = getOrgId(c)
      const { id } = c.req.valid("param")
      const contentType = await deps.contentTypeRepo.findById(id, orgId)
      if (!contentType) return c.json({ error: "Not Found" }, 404)
      return c.json({ data: contentType })
    })
    .patch(
      "/:id",
      zValidator("param", idParamSchema),
      zValidator("json", updateContentTypeSchema),
      async (c) => {
        const orgId = getOrgId(c)
        const { id } = c.req.valid("param")
        const data = c.req.valid("json")
        const contentType = await deps.contentTypeRepo.update(id, orgId, data)
        if (!contentType) return c.json({ error: "Not Found" }, 404)
        return c.json({ data: contentType })
      },
    )
    .delete("/:id", zValidator("param", idParamSchema), async (c) => {
      const orgId = getOrgId(c)
      const { id } = c.req.valid("param")
      const result = await deps.contentTypeRepo.delete(id, orgId)
      if (!result) return c.json({ error: "Not Found" }, 404)
      return c.json({ data: { success: true } })
    })
    // Field CRUD
    .get("/:id/fields", zValidator("param", idParamSchema), async (c) => {
      const orgId = getOrgId(c)
      const { id } = c.req.valid("param")
      const contentType = await deps.contentTypeRepo.findById(id, orgId)
      if (!contentType) return c.json({ error: "Not Found" }, 404)
      const fields = await deps.fieldRepo.findByContentType(id)
      return c.json({ data: fields })
    })
    .post(
      "/:id/fields",
      zValidator("param", idParamSchema),
      zValidator("json", createFieldSchema),
      async (c) => {
        const orgId = getOrgId(c)
        const { id } = c.req.valid("param")
        const data = c.req.valid("json")
        const contentType = await deps.contentTypeRepo.findById(id, orgId)
        if (!contentType) return c.json({ error: "Not Found" }, 404)
        const field = await deps.fieldRepo.create(id, data)
        return c.json({ data: field }, 201)
      },
    )
    .patch(
      "/:id/fields/:fieldId",
      zValidator("param", fieldParamSchema),
      zValidator("json", updateFieldSchema),
      async (c) => {
        const orgId = getOrgId(c)
        const { id, fieldId } = c.req.valid("param")
        const data = c.req.valid("json")
        const contentType = await deps.contentTypeRepo.findById(id, orgId)
        if (!contentType) return c.json({ error: "Not Found" }, 404)
        const field = await deps.fieldRepo.update(fieldId, id, data)
        if (!field) return c.json({ error: "Not Found" }, 404)
        return c.json({ data: field })
      },
    )
    .delete("/:id/fields/:fieldId", zValidator("param", fieldParamSchema), async (c) => {
      const orgId = getOrgId(c)
      const { id, fieldId } = c.req.valid("param")
      const contentType = await deps.contentTypeRepo.findById(id, orgId)
      if (!contentType) return c.json({ error: "Not Found" }, 404)
      const result = await deps.fieldRepo.delete(fieldId, id)
      if (!result) return c.json({ error: "Not Found" }, 404)
      return c.json({ data: { success: true } })
    })
    // Entry endpoints under content-types
    .get(
      "/:id/entries",
      zValidator("param", idParamSchema),
      zValidator("query", paginationSchema),
      async (c) => {
        const orgId = getOrgId(c)
        const { id } = c.req.valid("param")
        const { page, limit } = c.req.valid("query")
        const contentType = await deps.contentTypeRepo.findById(id, orgId)
        if (!contentType) return c.json({ error: "Not Found" }, 404)
        const result = await deps.entryRepo.findAll(id, orgId, page, limit)
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
    .get("/:id/entries/count", zValidator("param", idParamSchema), async (c) => {
      const orgId = getOrgId(c)
      const { id } = c.req.valid("param")
      const contentType = await deps.contentTypeRepo.findById(id, orgId)
      if (!contentType) return c.json({ error: "Not Found" }, 404)
      const count = await deps.entryRepo.count(id, orgId)
      return c.json({ data: { count } })
    })
    .get("/:id/entries/:entryId", zValidator("param", entryParamSchema), async (c) => {
      const orgId = getOrgId(c)
      const { id, entryId } = c.req.valid("param")
      const contentType = await deps.contentTypeRepo.findById(id, orgId)
      if (!contentType) return c.json({ error: "Not Found" }, 404)
      const entry = await deps.entryRepo.findById(entryId, orgId)
      if (!entry || entry.contentTypeId !== id) return c.json({ error: "Not Found" }, 404)
      return c.json({ data: entry })
    })
    .post(
      "/:id/entries",
      zValidator("param", idParamSchema),
      zValidator("json", createEntrySchema),
      async (c) => {
        const orgId = getOrgId(c)
        const userId = getUserId(c)
        const { id } = c.req.valid("param")
        const { data } = c.req.valid("json")
        const contentType = await deps.contentTypeRepo.findById(id, orgId)
        if (!contentType) return c.json({ error: "Not Found" }, 404)

        const validationError = validateEntryData(data, contentType.fields)
        if (validationError) return c.json({ error: validationError }, 422)

        const entry = await deps.entryRepo.create(id, orgId, userId, { data })
        return c.json({ data: entry }, 201)
      },
    )
    .patch(
      "/:id/entries/:entryId",
      zValidator("param", entryParamSchema),
      zValidator("json", updateEntrySchema),
      async (c) => {
        const orgId = getOrgId(c)
        const { id, entryId } = c.req.valid("param")
        const { data } = c.req.valid("json")
        const contentType = await deps.contentTypeRepo.findById(id, orgId)
        if (!contentType) return c.json({ error: "Not Found" }, 404)

        const existingEntry = await deps.entryRepo.findById(entryId, orgId)
        if (!existingEntry || existingEntry.contentTypeId !== id)
          return c.json({ error: "Not Found" }, 404)

        const validationError = validateEntryData(data, contentType.fields, false)
        if (validationError) return c.json({ error: validationError }, 422)

        const entry = await deps.entryRepo.update(entryId, orgId, { data })
        if (!entry) return c.json({ error: "Not Found" }, 404)
        return c.json({ data: entry })
      },
    )
    .delete("/:id/entries/:entryId", zValidator("param", entryParamSchema), async (c) => {
      const orgId = getOrgId(c)
      const { id, entryId } = c.req.valid("param")
      const contentType = await deps.contentTypeRepo.findById(id, orgId)
      if (!contentType) return c.json({ error: "Not Found" }, 404)
      const entry = await deps.entryRepo.findById(entryId, orgId)
      if (!entry || entry.contentTypeId !== id) return c.json({ error: "Not Found" }, 404)
      const result = await deps.entryRepo.softDelete(entryId, orgId)
      if (!result) return c.json({ error: "Not Found" }, 404)
      return c.json({ data: { success: true } })
    })
