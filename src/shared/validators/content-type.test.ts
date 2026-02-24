import { describe, expect, it } from "vitest"
import {
  createContentTypeSchema,
  createFieldSchema,
  updateContentTypeSchema,
  updateFieldSchema,
} from "./content-type.js"

describe("createContentTypeSchema", () => {
  it("accepts valid slug and name", () => {
    const result = createContentTypeSchema.safeParse({ slug: "blog-post", name: "ブログ記事" })
    expect(result.success).toBe(true)
  })

  it("accepts slug with only alphanumeric characters", () => {
    const result = createContentTypeSchema.safeParse({ slug: "article", name: "記事" })
    expect(result.success).toBe(true)
  })

  it("accepts slug with hyphens between segments", () => {
    const result = createContentTypeSchema.safeParse({ slug: "my-content-type", name: "My Type" })
    expect(result.success).toBe(true)
  })

  it("rejects empty slug", () => {
    const result = createContentTypeSchema.safeParse({ slug: "", name: "記事" })
    expect(result.success).toBe(false)
  })

  it("rejects slug exceeding 64 characters", () => {
    const longSlug = "a".repeat(65)
    const result = createContentTypeSchema.safeParse({ slug: longSlug, name: "記事" })
    expect(result.success).toBe(false)
  })

  it("accepts slug at exactly 64 characters", () => {
    // 64 chars: segments joined by hyphens must still match pattern
    const slug = "a".repeat(64)
    const result = createContentTypeSchema.safeParse({ slug, name: "記事" })
    expect(result.success).toBe(true)
  })

  it("rejects slug with uppercase letters", () => {
    const result = createContentTypeSchema.safeParse({ slug: "BlogPost", name: "記事" })
    expect(result.success).toBe(false)
  })

  it("rejects slug with leading hyphens", () => {
    const result = createContentTypeSchema.safeParse({ slug: "-blog-post", name: "記事" })
    expect(result.success).toBe(false)
  })

  it("rejects slug with trailing hyphens", () => {
    const result = createContentTypeSchema.safeParse({ slug: "blog-post-", name: "記事" })
    expect(result.success).toBe(false)
  })

  it("rejects slug with consecutive hyphens", () => {
    const result = createContentTypeSchema.safeParse({ slug: "blog--post", name: "記事" })
    expect(result.success).toBe(false)
  })

  it("rejects slug with underscores", () => {
    const result = createContentTypeSchema.safeParse({ slug: "blog_post", name: "記事" })
    expect(result.success).toBe(false)
  })

  it("rejects empty name", () => {
    const result = createContentTypeSchema.safeParse({ slug: "blog-post", name: "" })
    expect(result.success).toBe(false)
  })

  it("rejects name exceeding 64 characters", () => {
    const longName = "あ".repeat(65)
    const result = createContentTypeSchema.safeParse({ slug: "blog-post", name: longName })
    expect(result.success).toBe(false)
  })

  it("accepts name at exactly 64 characters", () => {
    const name = "a".repeat(64)
    const result = createContentTypeSchema.safeParse({ slug: "blog-post", name })
    expect(result.success).toBe(true)
  })

  it("rejects missing slug", () => {
    const result = createContentTypeSchema.safeParse({ name: "記事" })
    expect(result.success).toBe(false)
  })

  it("rejects missing name", () => {
    const result = createContentTypeSchema.safeParse({ slug: "blog-post" })
    expect(result.success).toBe(false)
  })
})

describe("updateContentTypeSchema", () => {
  it("accepts valid name", () => {
    const result = updateContentTypeSchema.safeParse({ name: "更新後の名前" })
    expect(result.success).toBe(true)
  })

  it("rejects empty name", () => {
    const result = updateContentTypeSchema.safeParse({ name: "" })
    expect(result.success).toBe(false)
  })

  it("rejects name exceeding 64 characters", () => {
    const longName = "a".repeat(65)
    const result = updateContentTypeSchema.safeParse({ name: longName })
    expect(result.success).toBe(false)
  })

  it("accepts name at exactly 64 characters", () => {
    const name = "a".repeat(64)
    const result = updateContentTypeSchema.safeParse({ name })
    expect(result.success).toBe(true)
  })

  it("rejects missing name", () => {
    const result = updateContentTypeSchema.safeParse({})
    expect(result.success).toBe(false)
  })
})

describe("createFieldSchema", () => {
  it("accepts valid field with all required properties", () => {
    const result = createFieldSchema.safeParse({
      slug: "title",
      name: "タイトル",
      type: "text",
    })
    expect(result.success).toBe(true)
  })

  it("applies default required=false when omitted", () => {
    const result = createFieldSchema.safeParse({
      slug: "title",
      name: "タイトル",
      type: "text",
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.required).toBe(false)
    }
  })

  it("applies default order=0 when omitted", () => {
    const result = createFieldSchema.safeParse({
      slug: "title",
      name: "タイトル",
      type: "text",
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.order).toBe(0)
    }
  })

  it("accepts required=true", () => {
    const result = createFieldSchema.safeParse({
      slug: "title",
      name: "タイトル",
      type: "text",
      required: true,
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.required).toBe(true)
    }
  })

  it("accepts each valid field type: richtext", () => {
    const result = createFieldSchema.safeParse({ slug: "body", name: "本文", type: "richtext" })
    expect(result.success).toBe(true)
  })

  it("accepts each valid field type: number", () => {
    const result = createFieldSchema.safeParse({ slug: "count", name: "数量", type: "number" })
    expect(result.success).toBe(true)
  })

  it("accepts each valid field type: date", () => {
    const result = createFieldSchema.safeParse({
      slug: "published-at",
      name: "公開日",
      type: "date",
    })
    expect(result.success).toBe(true)
  })

  it("accepts each valid field type: boolean", () => {
    const result = createFieldSchema.safeParse({
      slug: "is-active",
      name: "有効",
      type: "boolean",
    })
    expect(result.success).toBe(true)
  })

  it("rejects unknown field type", () => {
    const result = createFieldSchema.safeParse({ slug: "title", name: "タイトル", type: "image" })
    expect(result.success).toBe(false)
  })

  it("rejects empty slug", () => {
    const result = createFieldSchema.safeParse({ slug: "", name: "タイトル", type: "text" })
    expect(result.success).toBe(false)
  })

  it("rejects slug with uppercase letters", () => {
    const result = createFieldSchema.safeParse({ slug: "Title", name: "タイトル", type: "text" })
    expect(result.success).toBe(false)
  })

  it("rejects slug exceeding 64 characters", () => {
    const result = createFieldSchema.safeParse({
      slug: "a".repeat(65),
      name: "タイトル",
      type: "text",
    })
    expect(result.success).toBe(false)
  })

  it("rejects empty name", () => {
    const result = createFieldSchema.safeParse({ slug: "title", name: "", type: "text" })
    expect(result.success).toBe(false)
  })

  it("rejects name exceeding 64 characters", () => {
    const result = createFieldSchema.safeParse({
      slug: "title",
      name: "a".repeat(65),
      type: "text",
    })
    expect(result.success).toBe(false)
  })

  it("rejects negative order", () => {
    const result = createFieldSchema.safeParse({
      slug: "title",
      name: "タイトル",
      type: "text",
      order: -1,
    })
    expect(result.success).toBe(false)
  })

  it("accepts order=0 (minimum)", () => {
    const result = createFieldSchema.safeParse({
      slug: "title",
      name: "タイトル",
      type: "text",
      order: 0,
    })
    expect(result.success).toBe(true)
  })

  it("rejects non-integer order", () => {
    const result = createFieldSchema.safeParse({
      slug: "title",
      name: "タイトル",
      type: "text",
      order: 1.5,
    })
    expect(result.success).toBe(false)
  })

  it("rejects missing type", () => {
    const result = createFieldSchema.safeParse({ slug: "title", name: "タイトル" })
    expect(result.success).toBe(false)
  })
})

describe("updateFieldSchema", () => {
  it("accepts all optional fields provided", () => {
    const result = updateFieldSchema.safeParse({ name: "更新名", required: true, order: 2 })
    expect(result.success).toBe(true)
  })

  it("accepts empty object (all fields optional)", () => {
    const result = updateFieldSchema.safeParse({})
    expect(result.success).toBe(true)
  })

  it("accepts name only", () => {
    const result = updateFieldSchema.safeParse({ name: "新しい名前" })
    expect(result.success).toBe(true)
  })

  it("accepts required only", () => {
    const result = updateFieldSchema.safeParse({ required: false })
    expect(result.success).toBe(true)
  })

  it("accepts order only", () => {
    const result = updateFieldSchema.safeParse({ order: 5 })
    expect(result.success).toBe(true)
  })

  it("rejects empty name when provided", () => {
    const result = updateFieldSchema.safeParse({ name: "" })
    expect(result.success).toBe(false)
  })

  it("rejects name exceeding 64 characters when provided", () => {
    const result = updateFieldSchema.safeParse({ name: "a".repeat(65) })
    expect(result.success).toBe(false)
  })

  it("rejects negative order when provided", () => {
    const result = updateFieldSchema.safeParse({ order: -1 })
    expect(result.success).toBe(false)
  })

  it("rejects non-integer order when provided", () => {
    const result = updateFieldSchema.safeParse({ order: 0.5 })
    expect(result.success).toBe(false)
  })
})
