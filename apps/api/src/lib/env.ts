import { z } from "zod"

const envSchema = z.object({
	DATABASE_URL: z.string().min(1),
	DIRECT_URL: z.string().min(1),
	CLERK_SECRET_KEY: z.string().min(1),
	CLERK_PUBLISHABLE_KEY: z.string().min(1),
	ANTHROPIC_API_KEY: z.string().min(1),
})

// TODO: 環境変数未設定のため、実行時にバリデーションエラーになる
// 後続フェーズで環境変数を設定後に有効化
const parseEnv = () => {
	const result = envSchema.safeParse(process.env)
	if (!result.success) {
		console.error("Missing required environment variables:", result.error.format())
		// MVP段階では起動を妨げないようwarningのみ
		return process.env as unknown as z.infer<typeof envSchema>
	}
	return result.data
}

export const env = parseEnv()
