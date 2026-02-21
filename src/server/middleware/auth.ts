import { clerkMiddleware, getAuth } from "@hono/clerk-auth"
import type { Context, MiddlewareHandler } from "hono"
import { HTTPException } from "hono/http-exception"

export { clerkMiddleware }

export const requireAuth: MiddlewareHandler = async (c, next) => {
  const auth = getAuth(c)
  if (!auth?.userId) {
    throw new HTTPException(401, { message: "Unauthorized" })
  }
  c.set("userId" as never, auth.userId)
  await next()
}

export const getUserId = (c: Context): string => {
  const userId = c.get("userId" as never) as string | undefined
  if (!userId) {
    throw new HTTPException(401, { message: "Unauthorized" })
  }
  return userId
}
