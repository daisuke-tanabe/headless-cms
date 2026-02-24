import { createHash, randomBytes } from "node:crypto"

export const API_KEY_PREFIX = "sk_cms_"
export const RANDOM_BYTES_LENGTH = 24

const BASE62_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"

// 256 ÷ 62 = 4 余り 8 → byte >= 248 を棄却することでモジュラスバイアスを除去する
const REJECTION_THRESHOLD = Math.floor(256 / BASE62_CHARS.length) * BASE62_CHARS.length // 248
// 棄却率 ≈ 3.1% を補うため余分なバイトを用意する
const BUFFER_SIZE = RANDOM_BYTES_LENGTH + 8

const toBase62 = (bytes: Buffer, desiredLength: number): string => {
  const result: string[] = []
  for (const byte of bytes) {
    if (result.length >= desiredLength) break
    if (byte < REJECTION_THRESHOLD) {
      // biome-ignore lint/style/noNonNullAssertion: byte % BASE62_CHARS.length は常に有効なインデックス
      result.push(BASE62_CHARS[byte % BASE62_CHARS.length]!)
    }
  }
  return result.join("")
}

export const generateApiKey = (): string => {
  const bytes = randomBytes(BUFFER_SIZE)
  return `${API_KEY_PREFIX}${toBase62(bytes, RANDOM_BYTES_LENGTH)}`
}

export const hashApiKey = (key: string): string => {
  return createHash("sha256").update(key).digest("hex")
}

export const DISPLAY_PREFIX_LENGTH = 16

export const extractPrefix = (key: string): string => {
  return key.slice(0, DISPLAY_PREFIX_LENGTH)
}
