import { Prisma } from "@prisma/client"
import type { CreateFieldInput, UpdateFieldInput } from "../../shared/index.js"
import type { Database } from "../lib/prisma.js"

export const createFieldRepository = (db: Database) => ({
  findByContentType: async (contentTypeId: string) => {
    return db.field.findMany({
      where: { contentTypeId },
      orderBy: { order: "asc" },
    })
  },

  create: async (contentTypeId: string, data: CreateFieldInput) => {
    return db.field.create({
      data: {
        contentTypeId,
        slug: data.slug,
        name: data.name,
        type: data.type,
        required: data.required,
        order: data.order,
      },
    })
  },

  update: async (id: string, contentTypeId: string, data: UpdateFieldInput) => {
    try {
      return await db.field.update({
        where: { id, contentTypeId },
        data: {
          ...(data.name !== undefined && { name: data.name }),
          ...(data.required !== undefined && { required: data.required }),
          ...(data.order !== undefined && { order: data.order }),
        },
      })
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2025") {
        return null
      }
      throw e
    }
  },

  delete: async (id: string, contentTypeId: string) => {
    try {
      await db.field.delete({ where: { id, contentTypeId } })
      return { id }
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2025") {
        return null
      }
      throw e
    }
  },
})

export type FieldRepository = ReturnType<typeof createFieldRepository>
