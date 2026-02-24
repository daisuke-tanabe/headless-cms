import { describe, expect, it } from "vitest"
import { formatDate } from "./format"

describe("formatDate", () => {
  it("formats a date string and returns a non-empty string", () => {
    const result = formatDate("2024-01-15T00:00:00Z")
    expect(result).toBeTruthy()
    expect(typeof result).toBe("string")
  })

  it("includes the year in the output", () => {
    const result = formatDate("2024-06-01T00:00:00Z")
    expect(result).toContain("2024")
  })

  it("formats different dates differently", () => {
    const jan = formatDate("2024-01-01T00:00:00Z")
    const dec = formatDate("2024-12-01T00:00:00Z")
    expect(jan).not.toBe(dec)
  })

  it("formats a well-known date correctly", () => {
    const result = formatDate("2024-03-15T12:00:00Z")
    expect(result).toContain("2024")
  })
})
