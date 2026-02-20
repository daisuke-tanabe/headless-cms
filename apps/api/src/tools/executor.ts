import type { ChatAction } from "@ai-cms/shared"
import type Anthropic from "@anthropic-ai/sdk"
import { match } from "ts-pattern"
import { articleRepository } from "../repositories/article-repository.js"

type ToolInput = Record<string, unknown>

export const executeToolUse = async (
	toolUse: Anthropic.ContentBlockParam & { type: "tool_use" },
	userId: string,
): Promise<ChatAction | null> => {
	const input = toolUse.input as ToolInput

	return match(toolUse.name)
		.with("navigate", () => {
			const to = input.to as string
			return { type: "navigate" as const, to }
		})
		.with("get_articles", () => {
			// get_articles はアクションを伴わない（テキスト応答のみ）
			return null
		})
		.with("get_article", () => {
			// get_article はアクションを伴わない（テキスト応答のみ）
			return null
		})
		.with("create_article", () => {
			const title = input.title as string
			const body = input.body as string
			return {
				type: "open_editor" as const,
				to: "/articles/new",
				mode: "create" as const,
				data: { title, body },
			}
		})
		.with("update_article", () => {
			const id = input.id as string
			const title = input.title as string | undefined
			const body = input.body as string | undefined
			return {
				type: "open_editor" as const,
				to: `/articles/${id}`,
				mode: "edit" as const,
				data: { id, title, body },
			}
		})
		.with("delete_article", async () => {
			const id = input.id as string
			const article = await articleRepository.findById(id, userId)
			const title = article?.title ?? "不明な記事"
			return {
				type: "delete_article" as const,
				data: { id, title },
				requiresApproval: true as const,
			}
		})
		.otherwise(() => null)
}
