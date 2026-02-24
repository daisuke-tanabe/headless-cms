import { describe, expect, it } from "vitest"
import { formatDate } from "./format"

// full-icu を含む Node.js 環境でのみ "月" / "日" が出力される。
// 最小ビルドの Node.js では Intl サポートが不完全なためテストをスキップする。
const supportsJapaneseLocale = new Intl.DateTimeFormat("ja-JP", { month: "short" })
  .format(new Date("2024-03-01"))
  .includes("月")

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

  it.skipIf(!supportsJapaneseLocale)("formats in Japanese locale (contains 月 and 日)", () => {
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
