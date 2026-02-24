import { describe, expect, it } from "vitest"
import { buildPageContext } from "./page-context"

describe("buildPageContext", () => {
  it("returns dashboard context for /dashboard", () => {
    expect(buildPageContext("/dashboard")).toEqual({ page: "dashboard" })
  })

  it("returns content_type_list context for /content-types", () => {
    expect(buildPageContext("/content-types")).toEqual({ page: "content_type_list" })
  })

  it("returns content_type_detail context for /content-types/:id", () => {
    const result = buildPageContext("/content-types/ct-123", {
      contentTypeId: "ct-123",
      contentTypeName: "記事",
    })
    expect(result).toEqual({
      page: "content_type_detail",
      contentTypeId: "ct-123",
      contentTypeName: "記事",
    })
  })

  it("returns entry_list context for /content-types/:id/entries", () => {
    const result = buildPageContext("/content-types/ct-123/entries", {
      contentTypeId: "ct-123",
      contentTypeName: "記事",
      pageNum: 1,
    })
    expect(result).toEqual({
      page: "entry_list",
      contentTypeId: "ct-123",
      contentTypeName: "記事",
      pageNum: 1,
    })
  })

  it("returns entry_new context for /content-types/:id/entries/new", () => {
    const result = buildPageContext("/content-types/ct-123/entries/new", {
      contentTypeId: "ct-123",
      contentTypeName: "記事",
      fields: [],
    })
    expect(result).toEqual({
      page: "entry_new",
      contentTypeId: "ct-123",
      contentTypeName: "記事",
      fields: [],
      editor: {},
    })
  })

  it("returns entry_edit context for /content-types/:id/entries/:entryId", () => {
    const result = buildPageContext("/content-types/ct-123/entries/entry-456", {
      contentTypeId: "ct-123",
      contentTypeName: "記事",
      fields: [],
      entryId: "entry-456",
      entryData: { title: "Test" },
    })
    expect(result).toEqual({
      page: "entry_edit",
      contentTypeId: "ct-123",
      contentTypeName: "記事",
      fields: [],
      entry: { id: "entry-456", data: { title: "Test" } },
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
})
