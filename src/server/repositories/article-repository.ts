import { nanoid } from "nanoid"
import type { CreateArticleInput, UpdateArticleInput } from "../../shared/index.js"
import { prisma } from "../lib/prisma.js"

const MAX_SLUG_RETRIES = 3

const generateUniqueSlug = async (): Promise<string> => {
  for (let i = 0; i < MAX_SLUG_RETRIES; i++) {
    const slug = nanoid(8)
    const existing = await prisma.article.findUnique({ where: { slug } })
    if (!existing) {
      return slug
    }
  }
  throw new Error("Failed to generate unique slug after retries")
}

export const articleRepository = {
  findAll: async (orgId: string, page: number, limit: number) => {
    const skip = (page - 1) * limit
    const [articles, total] = await Promise.all([
      prisma.article.findMany({
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
      prisma.article.count({ where: { orgId } }),
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
    return prisma.article.findFirst({
      where: { id, orgId },
    })
  },

  count: async (orgId: string) => {
    return prisma.article.count({ where: { orgId } })
  },

  create: async (orgId: string, authorId: string, data: CreateArticleInput) => {
    const slug = await generateUniqueSlug()
    return prisma.article.create({
      data: {
        slug,
        title: data.title,
        body: data.body,
        orgId,
        authorId,
      },
    })
  },

  update: async (id: string, orgId: string, data: UpdateArticleInput) => {
    const updated = await prisma.article.updateMany({
      where: { id, orgId, deletedAt: null },
      data: {
        ...(data.title !== undefined && { title: data.title }),
        ...(data.body !== undefined && { body: data.body }),
      },
    })
    if (updated.count === 0) return null
    return prisma.article.findFirst({ where: { id, orgId } })
  },

  findBySlug: async (slug: string, orgId: string) => {
    return prisma.article.findFirst({
      where: { slug, orgId, deletedAt: null },
    })
  },

  softDelete: async (id: string, orgId: string) => {
    const deleted = await prisma.article.updateMany({
      where: { id, orgId, deletedAt: null },
      data: { deletedAt: new Date() },
    })
    if (deleted.count === 0) return null
    return { id }
  },
} as const
