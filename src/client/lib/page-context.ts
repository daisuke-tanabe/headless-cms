import type { PageContext } from "~/shared"

export const buildPageContext = (pathname: string): PageContext => {
  if (pathname === "/dashboard") {
    return { page: "dashboard" }
  }

  if (pathname === "/articles/new") {
    return { page: "article_new", editor: { title: "", body: "" } }
  }

  if (pathname.startsWith("/articles/") && pathname !== "/articles") {
    const id = pathname.split("/").pop() ?? ""
    return { page: "article_edit", article: { id, title: "", body: "" } }
  }

  if (pathname === "/articles") {
    return { page: "articles", pageNum: 1 }
  }

  return { page: "dashboard" }
}
