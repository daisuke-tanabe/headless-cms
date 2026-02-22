import { prisma } from "../lib/prisma.js"

export const apiKeyRepository = {
  findAll: async (orgId: string) => {
    return prisma.apiKey.findMany({
      where: { orgId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        prefix: true,
        lastUsedAt: true,
        createdAt: true,
      },
    })
  },

  create: async (orgId: string, userId: string, hashedKey: string, prefix: string) => {
    return prisma.apiKey.create({
      data: { orgId, userId, hashedKey, prefix },
      select: {
        id: true,
        prefix: true,
        lastUsedAt: true,
        createdAt: true,
      },
    })
  },

  deleteKey: async (id: string, orgId: string) => {
    const deleted = await prisma.apiKey.deleteMany({
      where: { id, orgId },
    })
    if (deleted.count === 0) return null
    return { id }
  },

  findByHash: async (hashedKey: string) => {
    return prisma.apiKey.findUnique({
      where: { hashedKey },
      select: {
        id: true,
        orgId: true,
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
