import { describe, expect, it } from "vitest"
import { MAX_BODY_LENGTH, MAX_TITLE_LENGTH } from "../constants.js"
import { createArticleSchema, paginationSchema, updateArticleSchema } from "./article.js"

describe("createArticleSchema", () => {
  it("validates valid input", () => {
    const result = createArticleSchema.safeParse({ title: "Hello", body: "World" })
    expect(result.success).toBe(true)
  })

  it("rejects empty title", () => {
    const result = createArticleSchema.safeParse({ title: "", body: "World" })
    expect(result.success).toBe(false)
  })

  it("rejects empty body", () => {
    const result = createArticleSchema.safeParse({ title: "Hello", body: "" })
    expect(result.success).toBe(false)
  })

  it("rejects title exceeding max length", () => {
    const result = createArticleSchema.safeParse({
      title: "a".repeat(MAX_TITLE_LENGTH + 1),
      body: "World",
    })
    expect(result.success).toBe(false)
  })

  it("accepts title at exactly max length", () => {
    const result = createArticleSchema.safeParse({
      title: "a".repeat(MAX_TITLE_LENGTH),
      body: "World",
    })
    expect(result.success).toBe(true)
  })

  it("rejects body exceeding max length", () => {
    const result = createArticleSchema.safeParse({
      title: "Hello",
      body: "a".repeat(MAX_BODY_LENGTH + 1),
    })
    expect(result.success).toBe(false)
  })

  it("accepts body at exactly max length", () => {
    const result = createArticleSchema.safeParse({
      title: "Hello",
      body: "a".repeat(MAX_BODY_LENGTH),
    })
    expect(result.success).toBe(true)
  })

  it("rejects missing title", () => {
    const result = createArticleSchema.safeParse({ body: "World" })
    expect(result.success).toBe(false)
  })

  it("rejects missing body", () => {
    const result = createArticleSchema.safeParse({ title: "Hello" })
    expect(result.success).toBe(false)
  })
})

describe("updateArticleSchema", () => {
  it("accepts partial update with title only", () => {
    const result = updateArticleSchema.safeParse({ title: "New Title" })
    expect(result.success).toBe(true)
  })

  it("accepts partial update with body only", () => {
    const result = updateArticleSchema.safeParse({ body: "New Body" })
    expect(result.success).toBe(true)
  })

  it("accepts empty object (no-op update)", () => {
    const result = updateArticleSchema.safeParse({})
    expect(result.success).toBe(true)
  })

  it("rejects empty string title", () => {
    const result = updateArticleSchema.safeParse({ title: "" })
    expect(result.success).toBe(false)
  })

  it("rejects empty string body", () => {
    const result = updateArticleSchema.safeParse({ body: "" })
    expect(result.success).toBe(false)
  })

  it("rejects title exceeding max length", () => {
    const result = updateArticleSchema.safeParse({ title: "a".repeat(MAX_TITLE_LENGTH + 1) })
    expect(result.success).toBe(false)
  })
})

describe("paginationSchema", () => {
  it("defaults page to 1 and limit to 20 when empty", () => {
    const result = paginationSchema.safeParse({})
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.page).toBe(1)
      expect(result.data.limit).toBe(20)
    }
  })

  it("coerces string numbers to integers", () => {
    const result = paginationSchema.safeParse({ page: "3", limit: "50" })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.page).toBe(3)
      expect(result.data.limit).toBe(50)
    }
  })

  it("rejects page < 1", () => {
    const result = paginationSchema.safeParse({ page: "0" })
    expect(result.success).toBe(false)
  })

  it("rejects limit > 100", () => {
    const result = paginationSchema.safeParse({ limit: "101" })
    expect(result.success).toBe(false)
  })

  it("accepts limit of exactly 100", () => {
    const result = paginationSchema.safeParse({ limit: "100" })
    expect(result.success).toBe(true)
  })

  it("accepts page of exactly 1", () => {
    const result = paginationSchema.safeParse({ page: "1" })
    expect(result.success).toBe(true)
  })
})
