import "dotenv/config"
import { defineConfig } from "prisma/config"

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // Supabase: DIRECT_URL for CLI (migrate/push/introspect)
    url: process.env.DIRECT_URL,
  },
})
