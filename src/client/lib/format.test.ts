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

  // ICU データに依存: full-icu を含む Node.js 環境でのみ "月" / "日" が出力される
  // Vercel/GitHub Actions では問題ないが、最小ビルドの Node.js では失敗する可能性がある
  it("formats in Japanese locale (contains 月 and 日)", () => {
    const result = formatDate("2024-03-15T12:00:00Z")
    expect(result).toContain("月")
    expect(result).toContain("日")
  })

  it("formats different dates differently", () => {
    const jan = formatDate("2024-01-01T00:00:00Z")
    const dec = formatDate("2024-12-01T00:00:00Z")
    expect(jan).not.toBe(dec)
  })
})
