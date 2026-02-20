import type { AppType } from "@ai-cms/api/src/app.js"
import { hc } from "hono/client"

// TODO: Clerk getToken() を Authorization ヘッダーに付与
// 後続フェーズで Clerk 統合後に実装
export const apiClient = hc<AppType>("/")
