import { describe, expect, it } from "vitest"
import {
  API_KEY_PREFIX,
  DISPLAY_PREFIX_LENGTH,
  extractPrefix,
  generateApiKey,
  hashApiKey,
  RANDOM_BYTES_LENGTH,
} from "./api-key"

describe("generateApiKey", () => {
  it("should generate a key with the correct prefix", () => {
    const key = generateApiKey()
    expect(key).toMatch(/^sk_cms_/)
  })

  it("should generate a key of the expected length", () => {
    const key = generateApiKey()
    expect(key.length).toBe(API_KEY_PREFIX.length + RANDOM_BYTES_LENGTH)
  })

  it("should generate unique keys", () => {
    const keys = Array.from({ length: 20 }, () => generateApiKey())
    const unique = new Set(keys)
    expect(unique.size).toBe(20)
  })

  it("should only contain alphanumeric characters after the prefix", () => {
    const key = generateApiKey()
    const suffix = key.slice(API_KEY_PREFIX.length)
    expect(suffix).toMatch(/^[A-Za-z0-9]+$/)
  })

  // rejection sampling によりモジュラスバイアスが除去されていることを確認する。
  // 厳密な統計検定ではなく、先頭8文字 (A〜H) の出現率が均一に近いかを確認するレベル。
  it("should not have significant bias toward the first 8 characters (A-H)", () => {
    const BASE62_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
    const BIASED_CHARS = new Set("ABCDEFGH") // rejection sampling なしで高頻度になる文字
    const SAMPLE_COUNT = 1000

    let biasedCount = 0
    let totalChars = 0

    for (let i = 0; i < SAMPLE_COUNT; i++) {
      const suffix = generateApiKey().slice(API_KEY_PREFIX.length)
      for (const char of suffix) {
        totalChars++
        if (BIASED_CHARS.has(char)) biasedCount++
      }
    }

    const biasedRate = biasedCount / totalChars
    // 期待値: 8/62 ≈ 0.129。許容範囲: ±0.03（バイアスがあれば ~5/256 * 8 ≈ 0.156 になる）
    const EXPECTED_RATE = BIASED_CHARS.size / BASE62_CHARS.length
    expect(biasedRate).toBeGreaterThan(EXPECTED_RATE - 0.03)
    expect(biasedRate).toBeLessThan(EXPECTED_RATE + 0.03)
  })
})

describe("hashApiKey", () => {
  it("should return a 64-character hex string (SHA-256)", () => {
    const hash = hashApiKey("test-key")
    expect(hash).toMatch(/^[0-9a-f]{64}$/)
  })

  it("should be deterministic for the same input", () => {
    const key = "sk_cms_abc123"
    expect(hashApiKey(key)).toBe(hashApiKey(key))
  })

  it("should return different hashes for different keys", () => {
    expect(hashApiKey("key1")).not.toBe(hashApiKey("key2"))
  })

  it("should produce different hashes for generated keys", () => {
    const key1 = generateApiKey()
    const key2 = generateApiKey()
    expect(hashApiKey(key1)).not.toBe(hashApiKey(key2))
  })
})

describe("extractPrefix", () => {
  it("should return exactly the first DISPLAY_PREFIX_LENGTH characters", () => {
    const key = generateApiKey()
    const prefix = extractPrefix(key)
    expect(prefix.length).toBe(DISPLAY_PREFIX_LENGTH)
    expect(prefix).toBe(key.slice(0, DISPLAY_PREFIX_LENGTH))
  })

  it("should include the API_KEY_PREFIX", () => {
    const key = generateApiKey()
    const prefix = extractPrefix(key)
    expect(prefix.startsWith(API_KEY_PREFIX)).toBe(true)
  })

  it("should be consistent across calls", () => {
    const key = generateApiKey()
    expect(extractPrefix(key)).toBe(extractPrefix(key))
  })
})
