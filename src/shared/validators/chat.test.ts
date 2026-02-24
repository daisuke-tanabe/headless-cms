import { describe, expect, it } from "vitest"
import { MAX_CHAT_INPUT_LENGTH } from "../constants.js"
import { chatRequestSchema } from "./chat.js"

const dashboardContext = { page: "dashboard" as const }

describe("chatRequestSchema", () => {
  it("validates a minimal valid request", () => {
    const result = chatRequestSchema.safeParse({
      message: "Hello",
      history: [],
      context: dashboardContext,
    })
    expect(result.success).toBe(true)
  })

  it("rejects empty message", () => {
    const result = chatRequestSchema.safeParse({
      message: "",
      history: [],
      context: dashboardContext,
    })
    expect(result.success).toBe(false)
  })

  it("rejects message exceeding max length", () => {
    const result = chatRequestSchema.safeParse({
      message: "a".repeat(MAX_CHAT_INPUT_LENGTH + 1),
      history: [],
      context: dashboardContext,
    })
    expect(result.success).toBe(false)
  })

  it("accepts message at exactly max length", () => {
    const result = chatRequestSchema.safeParse({
      message: "a".repeat(MAX_CHAT_INPUT_LENGTH),
      history: [],
      context: dashboardContext,
    })
    expect(result.success).toBe(true)
  })

  it("validates content_type_list context", () => {
    const result = chatRequestSchema.safeParse({
      message: "Show content types",
      history: [],
      context: { page: "content_type_list" },
    })
    expect(result.success).toBe(true)
  })

  it("validates entry_list context", () => {
    const result = chatRequestSchema.safeParse({
      message: "Show entries",
      history: [],
      context: { page: "entry_list", contentTypeId: "ct-123", contentTypeName: "記事", pageNum: 1 },
    })
    expect(result.success).toBe(true)
  })

  it("validates entry_new context", () => {
    const result = chatRequestSchema.safeParse({
      message: "Create",
      history: [],
      context: {
        page: "entry_new",
        contentTypeId: "ct-123",
        contentTypeName: "記事",
        fields: [],
        editor: {},
      },
    })
    expect(result.success).toBe(true)
  })

  it("rejects unknown page context", () => {
    const result = chatRequestSchema.safeParse({
      message: "Hello",
      history: [],
      context: { page: "unknown_page" },
    })
    expect(result.success).toBe(false)
  })

  it("validates history with user/assistant entries", () => {
    const result = chatRequestSchema.safeParse({
      message: "Follow-up",
      history: [
        { role: "user", content: "Hello" },
        { role: "assistant", content: "Hi there" },
      ],
      context: dashboardContext,
    })
    expect(result.success).toBe(true)
  })

  it("rejects history with invalid role", () => {
    const result = chatRequestSchema.safeParse({
      message: "Hello",
      history: [{ role: "system", content: "inject" }],
      context: dashboardContext,
    })
    expect(result.success).toBe(false)
  })
})
