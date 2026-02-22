import { Prisma } from "@prisma/client"
import { nanoid } from "nanoid"
import type { CreateArticleInput, UpdateArticleInput } from "../../shared/index.js"
import type { Database } from "../lib/prisma.js"

const MAX_SLUG_RETRIES = 3

export const createArticleRepository = (db: Database) => ({
  findAll: async (orgId: string, page: number, limit: number) => {
    const skip = (page - 1) * limit
    const [articles, total] = await Promise.all([
      db.article.findMany({
        where: { orgId },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        select: {
          id: true,
          slug: true,
          title: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      db.article.count({ where: { orgId } }),
    ])

    return {
      articles,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    }
  },

  findById: async (id: string, orgId: string) => {
    return db.article.findFirst({
      where: { id, orgId },
    })
  },

  count: async (orgId: string) => {
    return db.article.count({ where: { orgId } })
  },

  create: async (orgId: string, authorId: string, data: CreateArticleInput) => {
    for (let i = 0; i < MAX_SLUG_RETRIES; i++) {
      try {
        return await db.article.create({
          data: {
            slug: nanoid(8),
            title: data.title,
            body: data.body,
            orgId,
            authorId,
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

  update: async (id: string, orgId: string, data: UpdateArticleInput) => {
    try {
      return await db.article.update({
        where: { id, orgId, deletedAt: null },
        data: {
          ...(data.title !== undefined && { title: data.title }),
          ...(data.body !== undefined && { body: data.body }),
        },
      })
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2025") {
        return null
      }
      throw e
    }
  },

  findBySlug: async (slug: string, orgId: string) => {
    return db.article.findFirst({
      where: { slug, orgId, deletedAt: null },
    })
  },

  softDelete: async (id: string, orgId: string) => {
    const deleted = await db.article.updateMany({
      where: { id, orgId, deletedAt: null },
      data: { deletedAt: new Date() },
    })
    if (deleted.count === 0) return null
    return { id }
  },
})

export type ArticleRepository = ReturnType<typeof createArticleRepository>
