import { z } from "zod"

const envSchema = z.object({
	DATABASE_URL: z.string().min(1),
	DIRECT_URL: z.string().min(1),
	CLERK_SECRET_KEY: z.string().min(1),
	CLERK_PUBLISHABLE_KEY: z.string().min(1),
	ANTHROPIC_API_KEY: z.string().min(1),
})

const parseEnv = () => {
	const result = envSchema.safeParse(process.env)
	if (!result.success) {
		const formatted = result.error.format()
		throw new Error(
			`Missing required environment variables:\n${JSON.stringify(formatted, null, 2)}`,
		)
	}
	return result.data
}

export const env = parseEnv()
