import type { AppType } from "@ai-cms/api/src/app.js"
import { hc } from "hono/client"

// 同一オリジン（Vercel）では Clerk の __session Cookie がブラウザの fetch で自動送信される
// @hono/clerk-auth がこの Cookie から認証情報を読み取るため、明示的なトークン付与は不要
export const apiClient = hc<AppType>("/")
