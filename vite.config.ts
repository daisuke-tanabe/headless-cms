import { resolve } from "node:path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vitest/config"

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src/client"),
      "~/shared": resolve(__dirname, "./src/shared"),
      "~/server": resolve(__dirname, "./src/server"),
    },
  },
  build: {
    outDir: "dist/client",
  },
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
      },
    },
  },
  test: {
    environment: "node",
    coverage: {
      provider: "v8",
      include: [
        "src/client/lib/**",
        "src/server/lib/**",
        "src/shared/constants.ts",
        "src/shared/validators/**",
      ],
      exclude: [
        "src/client/lib/api-client.ts", // browser fetch singleton（hono/client）
        "src/client/lib/query-client.ts", // QueryClient singleton（副作用モジュール）
        "src/server/lib/constants.ts", // 純粋定数のみ（ロジックなし）
        "src/server/lib/prisma.ts", // DB singleton（要 DB 接続、UT 不可）
      ],
      thresholds: {
        statements: 100,
        functions: 100,
        lines: 100,
        branches: 100,
      },
    },
  },
})
