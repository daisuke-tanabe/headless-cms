import { describe, expect, it } from "vitest"
import { validateEntryData } from "./entry-validator"

const TEXT_MAX_LENGTH = 100_000
const RICHTEXT_MAX_LENGTH = 500_000

// Helper: フィールド定義を簡潔に作るファクトリ
const field = (
  slug: string,
  type: "text" | "richtext" | "number" | "date" | "boolean",
  required = false,
) => ({ slug, type, required })

describe("validateEntryData — dataオブジェクト形式チェック", () => {
  it("data が null のとき null を返さずエラーを返す", () => {
    expect(validateEntryData(null, [])).toBe("data は object である必要があります")
  })

  it("data が undefined のときエラーを返す", () => {
    expect(validateEntryData(undefined, [])).toBe("data は object である必要があります")
  })

  it("data が文字列のときエラーを返す", () => {
    expect(validateEntryData("text", [])).toBe("data は object である必要があります")
  })

  it("data が数値のときエラーを返す", () => {
    expect(validateEntryData(42, [])).toBe("data は object である必要があります")
  })

  it("data が配列のときエラーを返す", () => {
    expect(validateEntryData([], [])).toBe("data は object である必要があります")
  })

  it("data が真偽値のときエラーを返す", () => {
    expect(validateEntryData(true, [])).toBe("data は object である必要があります")
  })

  it("フィールドが空でdataも空のオブジェクトのとき null を返す", () => {
    expect(validateEntryData({}, [])).toBeNull()
  })
})

describe("validateEntryData — 未定義フィールドの拒否", () => {
  it("スキーマに存在しないキーを含む場合エラーを返す", () => {
    const fields = [field("title", "text")]
    const result = validateEntryData({ title: "Hello", unknown: "extra" }, fields)
    expect(result).toBe("フィールド「unknown」はこのコンテンツタイプに存在しません")
  })

  it("フィールドが空なのにデータにキーがある場合エラーを返す", () => {
    const result = validateEntryData({ title: "Hello" }, [])
    expect(result).toBe("フィールド「title」はこのコンテンツタイプに存在しません")
  })

  it("定義されたキーのみのデータは null を返す", () => {
    const fields = [field("title", "text")]
    expect(validateEntryData({ title: "Hello" }, fields)).toBeNull()
  })
})

describe("validateEntryData — required チェック", () => {
  it("required フィールドが未定義のときエラーを返す", () => {
    const fields = [field("title", "text", true)]
    expect(validateEntryData({}, fields)).toBe("フィールド「title」は必須です")
  })

  it("required フィールドが null のときエラーを返す", () => {
    const fields = [field("title", "text", true)]
    expect(validateEntryData({ title: null }, fields)).toBe("フィールド「title」は必須です")
  })

  it("required フィールドが空文字のときエラーを返す", () => {
    const fields = [field("title", "text", true)]
    expect(validateEntryData({ title: "" }, fields)).toBe("フィールド「title」は必須です")
  })

  it("checkRequired=false のとき required チェックをスキップする", () => {
    const fields = [field("title", "text", true)]
    expect(validateEntryData({}, fields, false)).toBeNull()
  })

  it("required でないフィールドが未定義でも null を返す", () => {
    const fields = [field("title", "text", false)]
    expect(validateEntryData({}, fields)).toBeNull()
  })

  it("value が null のとき型チェックをスキップして null を返す", () => {
    const fields = [field("title", "text", false)]
    expect(validateEntryData({ title: null }, fields)).toBeNull()
  })

  it("value が undefined のとき型チェックをスキップして null を返す", () => {
    const fields = [field("title", "text", false)]
    expect(validateEntryData({ title: undefined }, fields)).toBeNull()
  })
})

describe("validateEntryData — text フィールドのバリデーション", () => {
  const fields = [field("title", "text")]

  it("正常な文字列を受け入れる", () => {
    expect(validateEntryData({ title: "Hello World" }, fields)).toBeNull()
  })

  it("空文字列を受け入れる（required でない場合）", () => {
    expect(validateEntryData({ title: "" }, fields)).toBeNull()
  })

  it("100,000文字の文字列を受け入れる（上限ちょうど）", () => {
    expect(validateEntryData({ title: "a".repeat(TEXT_MAX_LENGTH) }, fields)).toBeNull()
  })

  it("100,001文字の文字列を拒否する（上限超過）", () => {
    const result = validateEntryData({ title: "a".repeat(TEXT_MAX_LENGTH + 1) }, fields)
    expect(result).toBe(`フィールド「title」は${TEXT_MAX_LENGTH}文字以内である必要があります`)
  })

  it("数値を拒否する", () => {
    expect(validateEntryData({ title: 42 }, fields)).toBe(
      "フィールド「title」は文字列である必要があります",
    )
  })

  it("真偽値を拒否する", () => {
    expect(validateEntryData({ title: true }, fields)).toBe(
      "フィールド「title」は文字列である必要があります",
    )
  })

  it("配列を拒否する", () => {
    expect(validateEntryData({ title: [] }, fields)).toBe(
      "フィールド「title」は文字列である必要があります",
    )
  })

  it("オブジェクトを拒否する", () => {
    expect(validateEntryData({ title: {} }, fields)).toBe(
      "フィールド「title」は文字列である必要があります",
    )
  })
})

describe("validateEntryData — richtext フィールドのバリデーション", () => {
  const fields = [field("body", "richtext")]

  it("正常な文字列を受け入れる", () => {
    expect(validateEntryData({ body: "<p>Hello</p>" }, fields)).toBeNull()
  })

  it("500,000文字の文字列を受け入れる（上限ちょうど）", () => {
    expect(validateEntryData({ body: "a".repeat(RICHTEXT_MAX_LENGTH) }, fields)).toBeNull()
  })

  it("500,001文字の文字列を拒否する（上限超過）", () => {
    const result = validateEntryData({ body: "a".repeat(RICHTEXT_MAX_LENGTH + 1) }, fields)
    expect(result).toBe(`フィールド「body」は${RICHTEXT_MAX_LENGTH}文字以内である必要があります`)
  })

  it("数値を拒否する", () => {
    expect(validateEntryData({ body: 123 }, fields)).toBe(
      "フィールド「body」は文字列である必要があります",
    )
  })
})

describe("validateEntryData — number フィールドのバリデーション", () => {
  const fields = [field("count", "number")]

  it("整数を受け入れる", () => {
    expect(validateEntryData({ count: 42 }, fields)).toBeNull()
  })

  it("浮動小数点数を受け入れる", () => {
    expect(validateEntryData({ count: 3.14 }, fields)).toBeNull()
  })

  it("負の数を受け入れる", () => {
    expect(validateEntryData({ count: -1 }, fields)).toBeNull()
  })

  it("0 を受け入れる", () => {
    expect(validateEntryData({ count: 0 }, fields)).toBeNull()
  })

  it("NaN を拒否する", () => {
    expect(validateEntryData({ count: Number.NaN }, fields)).toBe(
      "フィールド「count」は有限の数値である必要があります",
    )
  })

  it("Infinity を拒否する", () => {
    expect(validateEntryData({ count: Number.POSITIVE_INFINITY }, fields)).toBe(
      "フィールド「count」は有限の数値である必要があります",
    )
  })

  it("-Infinity を拒否する", () => {
    expect(validateEntryData({ count: Number.NEGATIVE_INFINITY }, fields)).toBe(
      "フィールド「count」は有限の数値である必要があります",
    )
  })

  it("文字列を拒否する", () => {
    expect(validateEntryData({ count: "42" }, fields)).toBe(
      "フィールド「count」は有限の数値である必要があります",
    )
  })

  it("真偽値を拒否する", () => {
    expect(validateEntryData({ count: true }, fields)).toBe(
      "フィールド「count」は有限の数値である必要があります",
    )
  })
})

describe("validateEntryData — date フィールドのバリデーション (ISO 8601)", () => {
  const fields = [field("publishedAt", "date")]

  it("YYYY-MM-DD 形式を受け入れる", () => {
    expect(validateEntryData({ publishedAt: "2024-01-15" }, fields)).toBeNull()
  })

  it("YYYY-MM-DDTHH:MM:SS 形式を受け入れる", () => {
    expect(validateEntryData({ publishedAt: "2024-01-15T12:30:00" }, fields)).toBeNull()
  })

  it("YYYY-MM-DDTHH:MM:SSZ 形式を受け入れる", () => {
    expect(validateEntryData({ publishedAt: "2024-01-15T12:30:00Z" }, fields)).toBeNull()
  })

  it("タイムゾーンオフセット付き形式を受け入れる", () => {
    expect(validateEntryData({ publishedAt: "2024-01-15T12:30:00+09:00" }, fields)).toBeNull()
  })

  it("ミリ秒付き形式を受け入れる", () => {
    expect(validateEntryData({ publishedAt: "2024-01-15T12:30:00.123Z" }, fields)).toBeNull()
  })

  it("YYYY/MM/DD 形式（スラッシュ区切り）を拒否する", () => {
    expect(validateEntryData({ publishedAt: "2024/01/15" }, fields)).toBe(
      "フィールド「publishedAt」は ISO 8601 形式の日付文字列である必要があります",
    )
  })

  it("MM-DD-YYYY 形式を拒否する", () => {
    expect(validateEntryData({ publishedAt: "01-15-2024" }, fields)).toBe(
      "フィールド「publishedAt」は ISO 8601 形式の日付文字列である必要があります",
    )
  })

  it("不正な日付（月が13）を拒否する", () => {
    expect(validateEntryData({ publishedAt: "2024-13-01" }, fields)).toBe(
      "フィールド「publishedAt」は ISO 8601 形式の日付文字列である必要があります",
    )
  })

  it("数値を拒否する", () => {
    expect(validateEntryData({ publishedAt: 20240115 }, fields)).toBe(
      "フィールド「publishedAt」は ISO 8601 形式の日付文字列である必要があります",
    )
  })

  it("任意の文字列を拒否する", () => {
    expect(validateEntryData({ publishedAt: "not-a-date" }, fields)).toBe(
      "フィールド「publishedAt」は ISO 8601 形式の日付文字列である必要があります",
    )
  })

  it("空文字列を拒否する", () => {
    expect(validateEntryData({ publishedAt: "" }, fields)).toBe(
      "フィールド「publishedAt」は ISO 8601 形式の日付文字列である必要があります",
    )
  })
})

describe("validateEntryData — boolean フィールドのバリデーション", () => {
  const fields = [field("isActive", "boolean")]

  it("true を受け入れる", () => {
    expect(validateEntryData({ isActive: true }, fields)).toBeNull()
  })

  it("false を受け入れる", () => {
    expect(validateEntryData({ isActive: false }, fields)).toBeNull()
  })

  it("文字列 'true' を拒否する", () => {
    expect(validateEntryData({ isActive: "true" }, fields)).toBe(
      "フィールド「isActive」は真偽値である必要があります",
    )
  })

  it("数値 1 を拒否する", () => {
    expect(validateEntryData({ isActive: 1 }, fields)).toBe(
      "フィールド「isActive」は真偽値である必要があります",
    )
  })

  it("数値 0 を拒否する", () => {
    expect(validateEntryData({ isActive: 0 }, fields)).toBe(
      "フィールド「isActive」は真偽値である必要があります",
    )
  })
})

describe("validateEntryData — 複数フィールドの組み合わせ", () => {
  const fields = [
    field("title", "text", true),
    field("count", "number", false),
    field("publishedAt", "date", false),
    field("isActive", "boolean", true),
  ]

  it("全フィールドが正常な場合 null を返す", () => {
    expect(
      validateEntryData(
        { title: "Hello", count: 10, publishedAt: "2024-01-01", isActive: true },
        fields,
      ),
    ).toBeNull()
  })

  it("最初のエラーを返す（複数フィールドでも1つ目のエラー）", () => {
    // title が required でエラーが先に出る
    const result = validateEntryData({ count: "not-a-number", isActive: false }, fields)
    expect(result).toBe("フィールド「title」は必須です")
  })

  it("required フィールドのみ提供された場合 null を返す", () => {
    expect(validateEntryData({ title: "Hello", isActive: false }, fields)).toBeNull()
  })
})
