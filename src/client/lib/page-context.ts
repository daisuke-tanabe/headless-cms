import { match } from "ts-pattern"
import type { PageContext } from "~/shared"

export const buildPageContext = (pathname: string): PageContext =>
  match(pathname)
    .with("/dashboard", () => ({ page: "dashboard" as const }))
    .with("/articles/new", () => ({
      page: "article_new" as const,
      editor: { title: "", body: "" },
    }))
    .with("/articles", () => ({ page: "articles" as const, pageNum: 1 }))
    .when(
      (p) => /^\/articles\/(?!new$)[^/]+$/.test(p),
      (p) => ({
        page: "article_edit" as const,
        article: { id: p.split("/").pop() ?? "", title: "", body: "" },
      }),
    )
    .otherwise(() => ({ page: "dashboard" as const }))
