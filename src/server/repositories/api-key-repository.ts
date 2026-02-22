import type { Database } from "../lib/prisma.js"

export const createApiKeyRepository = (db: Database) => ({
  findAll: async (orgId: string) => {
    return db.apiKey.findMany({
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
    return db.apiKey.create({
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
    const deleted = await db.apiKey.deleteMany({
      where: { id, orgId },
    })
    if (deleted.count === 0) return null
    return { id }
  },

  findByHash: async (hashedKey: string) => {
    return db.apiKey.findUnique({
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
    return db.apiKey.update({
      where: { id },
      data: { lastUsedAt: new Date() },
    })
  },
})

export type ApiKeyRepository = ReturnType<typeof createApiKeyRepository>
