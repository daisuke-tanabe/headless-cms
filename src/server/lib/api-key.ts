import { createHash, randomBytes } from "node:crypto"

const API_KEY_PREFIX = "sk_cms_"
const RANDOM_BYTES_LENGTH = 24

const BASE62_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"

const toBase62 = (bytes: Buffer): string => {
  let result = ""
  for (const byte of bytes) {
    result += BASE62_CHARS[byte % BASE62_CHARS.length]
  }
  return result
}

export const generateApiKey = (): string => {
  const random = toBase62(randomBytes(RANDOM_BYTES_LENGTH))
  return `${API_KEY_PREFIX}${random}`
}

export const hashApiKey = (key: string): string => {
  return createHash("sha256").update(key).digest("hex")
}

const DISPLAY_PREFIX_LENGTH = 16

export const extractPrefix = (key: string): string => {
  return key.slice(0, DISPLAY_PREFIX_LENGTH)
}
