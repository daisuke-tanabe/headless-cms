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

  it("validates articles context with pageNum", () => {
    const result = chatRequestSchema.safeParse({
      message: "Show articles",
      history: [],
      context: { page: "articles", pageNum: 2 },
    })
    expect(result.success).toBe(true)
  })

  it("validates article_new context", () => {
    const result = chatRequestSchema.safeParse({
      message: "Create",
      history: [],
      context: { page: "article_new", editor: { title: "Draft", body: "Content" } },
    })
    expect(result.success).toBe(true)
  })

  it("validates article_edit context with valid UUID", () => {
    const result = chatRequestSchema.safeParse({
      message: "Edit",
      history: [],
      context: {
        page: "article_edit",
        article: {
          id: "550e8400-e29b-41d4-a716-446655440000",
          title: "Test",
          body: "Body",
        },
      },
    })
    expect(result.success).toBe(true)
  })

  it("rejects article_edit context with non-UUID id", () => {
    const result = chatRequestSchema.safeParse({
      message: "Edit",
      history: [],
      context: {
        page: "article_edit",
        article: { id: "not-a-uuid", title: "Test", body: "Body" },
      },
    })
    expect(result.success).toBe(false)
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
