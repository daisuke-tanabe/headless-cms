import type Anthropic from "@anthropic-ai/sdk"
import { match } from "ts-pattern"
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

export const createToolExecutor =
  (deps: ToolExecutorDeps) =>
  async (
    toolUse: Anthropic.ContentBlockParam & { type: "tool_use" },
    orgId: string,
  ): Promise<ChatAction | null> => {
    return match(toolUse.name)
      .with("get_articles", () => {
        const parsed = getArticlesInputSchema.safeParse(toolUse.input)
        if (!parsed.success) {
          console.warn("Invalid get_articles input:", parsed.error.message)
        }
        return null
      })
      .with("get_article", () => {
        const parsed = getArticleInputSchema.safeParse(toolUse.input)
        if (!parsed.success) {
          console.warn("Invalid get_article input:", parsed.error.message)
        }
        return null
      })
      .with("create_article", () => {
        const parsed = createArticleInputSchema.safeParse(toolUse.input)
        if (!parsed.success) {
          console.warn("Invalid create_article input:", parsed.error.message)
          return null
        }
        return {
          type: "open_editor" as const,
          to: "/articles/new",
          mode: "create" as const,
          data: { title: parsed.data.title, body: parsed.data.body },
        }
      })
      .with("update_article", () => {
        const parsed = updateArticleInputSchema.safeParse(toolUse.input)
        if (!parsed.success) {
          console.warn("Invalid update_article input:", parsed.error.message)
          return null
        }
        const { id, title, body } = parsed.data
        return {
          type: "open_editor" as const,
          to: `/articles/${id}`,
          mode: "edit" as const,
          data: { id, title, body },
        }
      })
      .with("delete_article", async () => {
        const parsed = deleteArticleInputSchema.safeParse(toolUse.input)
        if (!parsed.success) {
          console.warn("Invalid delete_article input:", parsed.error.message)
          return null
        }
        const { id } = parsed.data
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
