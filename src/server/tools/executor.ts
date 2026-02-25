import type Anthropic from "@anthropic-ai/sdk"
import { match } from "ts-pattern"
import type { ZodType } from "zod"
import type { ChatAction } from "../../shared/index.js"
import type { EntryRepository } from "../repositories/entry-repository.js"
import {
  createEntryInputSchema,
  deleteEntryInputSchema,
  updateEntryInputSchema,
} from "./schemas.js"

type ToolExecutorDeps = {
  readonly entryRepo: EntryRepository
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
    return await match(toolUse.name)
      .with("create_entry", async () => {
        const data = parseToolInput(createEntryInputSchema, toolUse.input, "create_entry")
        if (!data) return null
        return {
          type: "open_editor",
          to: `/content-types/${data.contentTypeId}/entries/new`,
          mode: "create",
          data: data.data,
        } satisfies ChatAction
      })
      .with("update_entry", async () => {
        const data = parseToolInput(updateEntryInputSchema, toolUse.input, "update_entry")
        if (!data) return null
        return {
          type: "open_editor",
          to: `/content-types/${data.contentTypeId}/entries/${data.id}`,
          mode: "edit",
          data: data.data,
        } satisfies ChatAction
      })
      .with("delete_entry", async () => {
        const data = parseToolInput(deleteEntryInputSchema, toolUse.input, "delete_entry")
        if (!data) return null
        const { id } = data
        const entry = await deps.entryRepo.findById(id, orgId)
        if (!entry) return null
        const label = String((entry.data as { title?: unknown })?.title ?? entry.slug)
        const { contentTypeId } = entry
        return {
          type: "delete_entry",
          data: { id, label, contentTypeId },
          requiresApproval: true as const,
        } satisfies ChatAction
      })
      .otherwise(async () => null)
  }

export type ToolExecutor = ReturnType<typeof createToolExecutor>
