import { Prisma } from "@prisma/client"
import { nanoid } from "nanoid"
import type { CreateEntryInput, UpdateEntryInput } from "../../shared/index.js"
import type { Database } from "../lib/prisma.js"

const MAX_SLUG_RETRIES = 3

export const createEntryRepository = (db: Database) => ({
  findAll: async (contentTypeId: string, orgId: string, page: number, limit: number) => {
    const skip = (page - 1) * limit
    const where = { contentTypeId, orgId, deletedAt: null }
    const [entries, total] = await Promise.all([
      db.entry.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        select: {
          id: true,
          slug: true,
          data: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      db.entry.count({ where }),
    ])

    return {
      entries,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    }
  },

  findById: async (id: string, orgId: string) => {
    return db.entry.findFirst({
      where: { id, orgId, deletedAt: null },
    })
  },

  findBySlug: async (slug: string, contentTypeId: string, orgId: string) => {
    return db.entry.findFirst({
      where: { slug, contentTypeId, orgId, deletedAt: null },
      select: {
        id: true,
        slug: true,
        data: true,
        createdAt: true,
        updatedAt: true,
      },
    })
  },

  count: async (contentTypeId: string, orgId: string) => {
    return db.entry.count({ where: { contentTypeId, orgId, deletedAt: null } })
  },

  create: async (
    contentTypeId: string,
    orgId: string,
    authorId: string,
    data: CreateEntryInput,
  ) => {
    // slug の衝突（P2002）は稀に発生するため、最大 MAX_SLUG_RETRIES 回リトライする
    for (let i = 0; i < MAX_SLUG_RETRIES; i++) {
      try {
        return await db.entry.create({
          data: {
            slug: nanoid(8),
            contentTypeId,
            orgId,
            authorId,
            data: data.data,
          },
        })
      } catch (e) {
        if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
          continue
        }
        throw e
      }
    }
    throw new Error("Failed to generate unique slug after retries")
  },

  update: async (id: string, orgId: string, data: UpdateEntryInput) => {
    try {
      return await db.entry.update({
        where: { id, orgId, deletedAt: null },
        data: { data: data.data },
      })
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2025") {
        return null
      }
      throw e
    }
  },

  softDelete: async (id: string, orgId: string) => {
    const deleted = await db.entry.updateMany({
      where: { id, orgId, deletedAt: null },
      data: { deletedAt: new Date() },
    })
    if (deleted.count === 0) return null
    return { id }
  },
})

export type EntryRepository = ReturnType<typeof createEntryRepository>
