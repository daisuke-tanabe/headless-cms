import { clerkMiddleware, getAuth } from "@hono/clerk-auth"
import { createMiddleware } from "hono/factory"
import { HTTPException } from "hono/http-exception"

export { clerkMiddleware }

type AuthEnv = {
  Variables: {
    userId: string
    orgId: string
  }
}

export const requireAuth = createMiddleware<AuthEnv>(async (c, next) => {
  const auth = getAuth(c)
  if (!auth?.userId) {
    throw new HTTPException(401, { message: "Unauthorized" })
  }
  c.set("userId", auth.userId)
  await next()
})

export const requireOrg = createMiddleware<AuthEnv>(async (c, next) => {
  const auth = getAuth(c)
  if (!auth?.userId) {
    throw new HTTPException(401, { message: "Unauthorized" })
  }
  if (!auth.orgId) {
    throw new HTTPException(403, { message: "Organization required" })
  }
  c.set("userId", auth.userId)
  c.set("orgId", auth.orgId)
  await next()
})

export const getUserId = (c: { get: (key: "userId") => string }): string => {
  return c.get("userId")
}

export const getOrgId = (c: { get: (key: "orgId") => string }): string => {
  return c.get("orgId")
}
