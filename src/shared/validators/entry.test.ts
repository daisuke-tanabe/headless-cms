import { describe, expect, it } from "vitest"
import { createEntrySchema, paginationSchema, updateEntrySchema } from "./entry.js"

describe("paginationSchema", () => {
  it("accepts valid page and limit", () => {
    const result = paginationSchema.safeParse({ page: 2, limit: 50 })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.page).toBe(2)
      expect(result.data.limit).toBe(50)
    }
  })

  it("applies default page=1 when omitted", () => {
    const result = paginationSchema.safeParse({})
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.page).toBe(1)
    }
  })

  it("applies default limit=20 when omitted", () => {
    const result = paginationSchema.safeParse({})
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.limit).toBe(20)
    }
  })

  it("coerces string page to number", () => {
    const result = paginationSchema.safeParse({ page: "3" })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.page).toBe(3)
    }
  })

  it("coerces string limit to number", () => {
    const result = paginationSchema.safeParse({ limit: "10" })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.limit).toBe(10)
    }
  })

  it("rejects page=0 (below minimum)", () => {
    const result = paginationSchema.safeParse({ page: 0 })
    expect(result.success).toBe(false)
  })

  it("rejects page=-1 (negative)", () => {
    const result = paginationSchema.safeParse({ page: -1 })
    expect(result.success).toBe(false)
  })

  it("rejects limit=0 (below minimum)", () => {
    const result = paginationSchema.safeParse({ limit: 0 })
    expect(result.success).toBe(false)
  })

  it("rejects limit=101 (above maximum)", () => {
    const result = paginationSchema.safeParse({ limit: 101 })
    expect(result.success).toBe(false)
  })

  it("accepts limit=100 (at maximum)", () => {
    const result = paginationSchema.safeParse({ limit: 100 })
    expect(result.success).toBe(true)
  })

  it("accepts limit=1 (at minimum)", () => {
    const result = paginationSchema.safeParse({ limit: 1 })
    expect(result.success).toBe(true)
  })

  it("accepts page=1 (at minimum)", () => {
    const result = paginationSchema.safeParse({ page: 1 })
    expect(result.success).toBe(true)
  })

  it("rejects non-integer page", () => {
    const result = paginationSchema.safeParse({ page: 1.5 })
    expect(result.success).toBe(false)
  })

  it("rejects non-integer limit", () => {
    const result = paginationSchema.safeParse({ limit: 10.5 })
    expect(result.success).toBe(false)
  })
})

describe("createEntrySchema", () => {
  it("accepts a valid data object", () => {
    const result = createEntrySchema.safeParse({ data: { title: "Hello", count: 1 } })
    expect(result.success).toBe(true)
  })

  it("accepts an empty data object", () => {
    const result = createEntrySchema.safeParse({ data: {} })
    expect(result.success).toBe(true)
  })

  it("accepts data with mixed value types", () => {
    const result = createEntrySchema.safeParse({
      data: { text: "hello", num: 42, flag: true, date: "2024-01-01" },
    })
    expect(result.success).toBe(true)
  })

  it("rejects when data is missing", () => {
    const result = createEntrySchema.safeParse({})
    expect(result.success).toBe(false)
  })

  it("rejects when data is not an object", () => {
    const result = createEntrySchema.safeParse({ data: "string" })
    expect(result.success).toBe(false)
  })

  it("rejects when data is an array", () => {
    const result = createEntrySchema.safeParse({ data: [1, 2, 3] })
    expect(result.success).toBe(false)
  })

  it("rejects when data is null", () => {
    const result = createEntrySchema.safeParse({ data: null })
    expect(result.success).toBe(false)
  })
})

describe("updateEntrySchema", () => {
  it("accepts a valid data object", () => {
    const result = updateEntrySchema.safeParse({ data: { title: "Updated" } })
    expect(result.success).toBe(true)
  })

  it("accepts an empty data object", () => {
    const result = updateEntrySchema.safeParse({ data: {} })
    expect(result.success).toBe(true)
  })

  it("rejects when data is missing", () => {
    const result = updateEntrySchema.safeParse({})
    expect(result.success).toBe(false)
  })

  it("rejects when data is not an object", () => {
    const result = updateEntrySchema.safeParse({ data: 42 })
    expect(result.success).toBe(false)
  })

  it("rejects when data is null", () => {
    const result = updateEntrySchema.safeParse({ data: null })
    expect(result.success).toBe(false)
  })
})
