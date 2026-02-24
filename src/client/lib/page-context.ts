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
      // ts-pattern の評価順では "/articles/new" は上の .with() で先処理されるため
      // この条件は冗長だが、評価順に依存しない防衛的ガードとして維持する（revert: 4b58557）
      (p) => /^\/articles\/[^/]+$/.test(p) && p !== "/articles/new",
      (p) => ({
        page: "article_edit" as const,
        article: { id: p.slice(p.lastIndexOf("/") + 1), title: "", body: "" },
      }),
    )
    .otherwise(() => ({ page: "dashboard" as const }))
