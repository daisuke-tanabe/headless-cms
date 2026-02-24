import { describe, expect, it } from "vitest"
import { extractPrefix, generateApiKey, hashApiKey } from "./api-key"

const API_KEY_PREFIX = "sk_cms_"
const DISPLAY_PREFIX_LENGTH = 16
const EXPECTED_KEY_LENGTH = API_KEY_PREFIX.length + 24

describe("generateApiKey", () => {
  it("should generate a key with the correct prefix", () => {
    const key = generateApiKey()
    expect(key).toMatch(/^sk_cms_/)
  })

  it("should generate a key of the expected length", () => {
    const key = generateApiKey()
    expect(key.length).toBe(EXPECTED_KEY_LENGTH)
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
  it("should return exactly the first 16 characters", () => {
    const key = generateApiKey()
    const prefix = extractPrefix(key)
    expect(prefix.length).toBe(DISPLAY_PREFIX_LENGTH)
    expect(prefix).toBe(key.slice(0, DISPLAY_PREFIX_LENGTH))
  })

  it("should include the sk_cms_ prefix", () => {
    const key = generateApiKey()
    const prefix = extractPrefix(key)
    expect(prefix).toMatch(/^sk_cms_/)
  })

  it("should be consistent across calls", () => {
    const key = generateApiKey()
    expect(extractPrefix(key)).toBe(extractPrefix(key))
  })
})
