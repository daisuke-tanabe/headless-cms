import type { CreateContentTypeInput, UpdateContentTypeInput } from "../../shared/index.js"
import type { Database } from "../lib/prisma.js"

export const createContentTypeRepository = (db: Database) => ({
  findAll: async (orgId: string) => {
    return db.contentType.findMany({
      where: { orgId },
      orderBy: { createdAt: "desc" },
    })
  },

  findById: async (id: string, orgId: string) => {
    return db.contentType.findFirst({
      where: { id, orgId },
      include: { fields: { orderBy: { order: "asc" } } },
    })
  },

  findBySlug: async (slug: string, orgId: string) => {
    return db.contentType.findFirst({
      where: { slug, orgId },
      include: { fields: { orderBy: { order: "asc" } } },
    })
  },

  create: async (orgId: string, data: CreateContentTypeInput) => {
    return db.contentType.create({
      data: {
        slug: data.slug,
        name: data.name,
        orgId,
      },
    })
  },

  update: async (id: string, orgId: string, data: UpdateContentTypeInput) => {
    try {
      return await db.contentType.update({
        where: { id, orgId },
        data: { name: data.name },
      })
    } catch {
      return null
    }
  },

  delete: async (id: string, orgId: string) => {
    try {
      await db.contentType.delete({ where: { id, orgId } })
      return { id }
    } catch {
      return null
    }
  },
})

export type ContentTypeRepository = ReturnType<typeof createContentTypeRepository>
