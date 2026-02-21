export const config = {
	maxDuration: 60,
}

// Vercel ランタイムが CJS として実行するため、ESM モジュールを動的 import で読み込む
export default async function handler(request: Request) {
	const { handle } = await import("hono/vercel")
	const { app } = await import("../src/server/app.js")
	return handle(app)(request)
}
