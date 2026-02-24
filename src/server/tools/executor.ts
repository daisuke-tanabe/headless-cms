import type Anthropic from "@anthropic-ai/sdk"
import { match } from "ts-pattern"
import type { ZodType } from "zod"
import type { ChatAction } from "../../shared/index.js"
import type { ArticleRepository } from "../repositories/article-repository.js"
import {
  createArticleInputSchema,
  deleteArticleInputSchema,
  getArticleInputSchema,
  getArticlesInputSchema,
  updateArticleInputSchema,
} from "./schemas.js"

type ToolExecutorDeps = {
  readonly articleRepo: ArticleRepository
}

function parseToolInput<T>(schema: ZodType<T>, input: unknown, toolName: string): T | null {
  const parsed = schema.safeParse(input)
  if (!parsed.success) {
    console.warn(`Invalid ${toolName} input:`, parsed.error.message)
    return null
  }
  return parsed.data
}

export const createToolExecutor =
  (deps: ToolExecutorDeps) =>
  async (
    toolUse: Anthropic.ContentBlockParam & { type: "tool_use" },
    orgId: string,
  ): Promise<ChatAction | null> => {
    return match(toolUse.name)
      .with("get_articles", () => {
        parseToolInput(getArticlesInputSchema, toolUse.input, "get_articles")
        return null
      })
      .with("get_article", () => {
        parseToolInput(getArticleInputSchema, toolUse.input, "get_article")
        return null
      })
      .with("create_article", () => {
        const data = parseToolInput(createArticleInputSchema, toolUse.input, "create_article")
        if (!data) return null
        return {
          type: "open_editor" as const,
          to: "/articles/new",
          mode: "create" as const,
          data: { title: data.title, body: data.body },
        }
      })
      .with("update_article", () => {
        const data = parseToolInput(updateArticleInputSchema, toolUse.input, "update_article")
        if (!data) return null
        const { id, title, body } = data
        return {
          type: "open_editor" as const,
          to: `/articles/${id}`,
          mode: "edit" as const,
          data: { id, title, body },
        }
      })
      .with("delete_article", async () => {
        const data = parseToolInput(deleteArticleInputSchema, toolUse.input, "delete_article")
        if (!data) return null
        const { id } = data
        const article = await deps.articleRepo.findById(id, orgId)
        const title = article?.title ?? "不明な記事"
        return {
          type: "delete_article" as const,
          data: { id, title },
          requiresApproval: true as const,
        }
      })
      .otherwise(() => null)
  }

export type ToolExecutor = ReturnType<typeof createToolExecutor>
