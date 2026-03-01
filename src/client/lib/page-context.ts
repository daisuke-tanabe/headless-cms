import { match } from "ts-pattern"
import type { Field, PageContext } from "~/shared"

export const buildPageContext = (
  pathname: string,
  extras?: {
    contentTypeId?: string
    contentTypeName?: string
    fields?: Field[]
    entryId?: string
    entryData?: Record<string, unknown>
    editorData?: Record<string, unknown>
    pageNum?: number
  },
): PageContext => {
  const result = match(pathname)
    .with("/dashboard", () => ({ page: "dashboard" as const }))
    .with("/content-types", () => ({ page: "content_type_list" as const }))
    .when(
      (p) => /^\/content-types\/[^/]+$/.test(p),
      () => ({
        page: "content_type_detail" as const,
        contentTypeId: extras?.contentTypeId ?? "",
        contentTypeName: extras?.contentTypeName ?? "",
      }),
    )
    .when(
      (p) => /^\/content-types\/[^/]+\/entries$/.test(p),
      () => ({
        page: "entry_list" as const,
        contentTypeId: extras?.contentTypeId ?? "",
        contentTypeName: extras?.contentTypeName ?? "",
        fields: extras?.fields ?? ([] as Field[]),
        pageNum: extras?.pageNum ?? 1,
      }),
    )
    .when(
      (p) => /^\/content-types\/[^/]+\/entries\/new$/.test(p),
      () => ({
        page: "entry_new" as const,
        contentTypeId: extras?.contentTypeId ?? "",
        contentTypeName: extras?.contentTypeName ?? "",
        fields: extras?.fields ?? ([] as Field[]),
        editor: extras?.editorData ?? {},
      }),
    )
    .when(
      (p) => /^\/content-types\/[^/]+\/entries\/[^/]+$/.test(p) && !p.endsWith("/new"),
      () => ({
        page: "entry_edit" as const,
        contentTypeId: extras?.contentTypeId ?? "",
        contentTypeName: extras?.contentTypeName ?? "",
        fields: extras?.fields ?? ([] as Field[]),
        entry: {
          id: extras?.entryId ?? "",
          data: extras?.entryData ?? {},
        },
      }),
    )
    .otherwise((p) => {
      if (import.meta.env.DEV) {
        console.warn(`[page-context] unrecognized path: "${p}", falling back to dashboard`)
      }
      return { page: "dashboard" as const }
    })

  return result as PageContext
}
