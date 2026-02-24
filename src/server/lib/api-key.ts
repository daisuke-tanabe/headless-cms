import { createHash, randomBytes } from "node:crypto"

export const API_KEY_PREFIX = "sk_cms_"
export const RANDOM_BYTES_LENGTH = 24

const BASE62_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"

// 256 ÷ 62 = 4 余り 8 → byte >= 248 を棄却することでモジュラスバイアスを除去する
const REJECTION_THRESHOLD = Math.floor(256 / BASE62_CHARS.length) * BASE62_CHARS.length // 248

export const generateApiKey = (): string => {
  const chars: string[] = []
  while (chars.length < RANDOM_BYTES_LENGTH) {
    // 不足分 + 余裕バイトを要求し、棄却で足りない場合はループで再取得することで長さを保証する
    const bytes = randomBytes(RANDOM_BYTES_LENGTH - chars.length + 4)
    for (const byte of bytes) {
      if (chars.length >= RANDOM_BYTES_LENGTH) break
      if (byte < REJECTION_THRESHOLD) {
        // biome-ignore lint/style/noNonNullAssertion: byte % BASE62_CHARS.length は常に有効なインデックス
        chars.push(BASE62_CHARS[byte % BASE62_CHARS.length]!)
      }
    }
  }
  return `${API_KEY_PREFIX}${chars.join("")}`
}

export const hashApiKey = (key: string): string => {
  return createHash("sha256").update(key).digest("hex")
}

export const DISPLAY_PREFIX_LENGTH = 16

export const extractPrefix = (key: string): string => {
  return key.slice(0, DISPLAY_PREFIX_LENGTH)
}
