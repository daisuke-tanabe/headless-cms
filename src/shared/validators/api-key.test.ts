import { describe, expect, it } from "vitest"
import { deleteApiKeyParamSchema } from "./api-key.js"

describe("deleteApiKeyParamSchema", () => {
  it("accepts valid UUID", () => {
    const result = deleteApiKeyParamSchema.safeParse({
      id: "550e8400-e29b-41d4-a716-446655440000",
    })
    expect(result.success).toBe(true)
  })
  it("rejects non-UUID id", () => {
    const result = deleteApiKeyParamSchema.safeParse({ id: "not-a-uuid" })
    expect(result.success).toBe(false)
  })
})
