import { PrismaClient } from "@prisma/client"

const createPrismaClient = () => {
  const baseClient = new PrismaClient()

  const extendedClient = baseClient.$extends({
    query: {
      entry: {
        // Soft delete: delete → update(deletedAt = now)
        async delete({ args, query: _query }) {
          return baseClient.entry.update({
            where: args.where,
            data: { deletedAt: new Date() },
          })
        },

        // Soft delete: deleteMany → updateMany(deletedAt = now)
        async deleteMany({ args, query: _query }) {
          return baseClient.entry.updateMany({
            where: args.where,
            data: { deletedAt: new Date() },
          }) as never
        },

        // Auto-filter: findMany → add deletedAt: null
        async findMany({ args, query }) {
          const where = args.where ?? {}
          if (where.deletedAt === undefined) {
            args.where = { ...where, deletedAt: null }
          }
          return query(args)
        },

        // Auto-filter: findFirst → add deletedAt: null
        async findFirst({ args, query }) {
          const where = args.where ?? {}
          if (where.deletedAt === undefined) {
            args.where = { ...where, deletedAt: null }
          }
          return query(args)
        },

        // Auto-filter: findUnique → findFirst with deletedAt: null
        async findUnique({ args, query }) {
          const where = args.where as Record<string, unknown>
          if (where.deletedAt === undefined) {
            args.where = { ...where, deletedAt: null } as typeof args.where
          }
          return query(args)
        },

        // Auto-filter: count → add deletedAt: null
        async count({ args, query }) {
          const where = args.where ?? {}
          if (where.deletedAt === undefined) {
            args.where = { ...where, deletedAt: null }
          }
          return query(args)
        },
      },
    },
  })

  return extendedClient
}

const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof createPrismaClient> | undefined
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma
}

export type Database = typeof prisma
