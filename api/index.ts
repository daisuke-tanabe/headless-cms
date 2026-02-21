import { handle } from "hono/vercel"
import { app } from "../apps/api/src/app.js"

export const config = {
	maxDuration: 60,
}

export default handle(app)
