import { prisma } from "../lib/prisma.js"

export const apiKeyRepository = {
  findAll: async (userId: string) => {
    return prisma.apiKey.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        prefix: true,
        lastUsedAt: true,
        createdAt: true,
      },
    })
  },

  create: async (userId: string, hashedKey: string, prefix: string) => {
    return prisma.apiKey.create({
      data: { userId, hashedKey, prefix },
      select: {
        id: true,
        prefix: true,
        lastUsedAt: true,
        createdAt: true,
      },
    })
  },

  deleteKey: async (id: string, userId: string) => {
    const deleted = await prisma.apiKey.deleteMany({
      where: { id, userId },
    })
    if (deleted.count === 0) return null
    return { id }
  },

  findByHash: async (hashedKey: string) => {
    return prisma.apiKey.findUnique({
      where: { hashedKey },
      select: {
        id: true,
        userId: true,
        lastUsedAt: true,
      },
    })
  },

  updateLastUsed: async (id: string) => {
    return prisma.apiKey.update({
      where: { id },
      data: { lastUsedAt: new Date() },
    })
  },
} as const
