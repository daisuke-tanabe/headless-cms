import { describe, expect, it } from "vitest"
import { buildPageContext } from "./page-context"

describe("buildPageContext", () => {
  it("returns dashboard context for /dashboard", () => {
    expect(buildPageContext("/dashboard")).toEqual({ page: "dashboard" })
  })

  it("returns articles context for /articles", () => {
    expect(buildPageContext("/articles")).toEqual({ page: "articles", pageNum: 1 })
  })

  it("returns article_new context for /articles/new", () => {
    expect(buildPageContext("/articles/new")).toEqual({
      page: "article_new",
      editor: { title: "", body: "" },
    })
  })

  it("returns article_edit context for /articles/:id", () => {
    expect(buildPageContext("/articles/some-id-123")).toEqual({
      page: "article_edit",
      article: { id: "some-id-123", title: "", body: "" },
    })
  })

  it("falls back to dashboard for unknown paths", () => {
    expect(buildPageContext("/unknown")).toEqual({ page: "dashboard" })
  })

  it("falls back to dashboard for root path", () => {
    expect(buildPageContext("/")).toEqual({ page: "dashboard" })
  })

  it("falls back to dashboard for empty string", () => {
    expect(buildPageContext("")).toEqual({ page: "dashboard" })
  })

  it("falls back to dashboard for trailing slash /articles/", () => {
    expect(buildPageContext("/articles/")).toEqual({ page: "dashboard" })
  })
})
