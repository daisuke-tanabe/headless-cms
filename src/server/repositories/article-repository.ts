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
	findAll: async (authorId: string, page: number, limit: number) => {
		const skip = (page - 1) * limit
		const [articles, total] = await Promise.all([
			prisma.article.findMany({
				where: { authorId },
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
			prisma.article.count({ where: { authorId } }),
		])

		return {
			articles,
			total,
			page,
			limit,
			totalPages: Math.ceil(total / limit),
		}
	},

	findById: async (id: string, authorId: string) => {
		return prisma.article.findFirst({
			where: { id, authorId },
		})
	},

	count: async (authorId: string) => {
		return prisma.article.count({ where: { authorId } })
	},

	create: async (authorId: string, data: CreateArticleInput) => {
		const slug = await generateUniqueSlug()
		return prisma.article.create({
			data: {
				slug,
				title: data.title,
				body: data.body,
				authorId,
			},
		})
	},

	update: async (id: string, authorId: string, data: UpdateArticleInput) => {
		const article = await prisma.article.findFirst({ where: { id, authorId } })
		if (!article) {
			return null
		}

		return prisma.article.update({
			where: { id },
			data: {
				...(data.title !== undefined && { title: data.title }),
				...(data.body !== undefined && { body: data.body }),
			},
		})
	},

	softDelete: async (id: string, authorId: string) => {
		const article = await prisma.article.findFirst({ where: { id, authorId } })
		if (!article) {
			return null
		}

		return prisma.article.delete({ where: { id } })
	},
} as const
