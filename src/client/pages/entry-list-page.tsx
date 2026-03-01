import { ChevronRight, FileText, Plus } from "lucide-react"
import { parseAsInteger, useQueryState } from "nuqs"
import { useEffect, useTransition } from "react"
import { Link, useParams } from "react-router"
import { AsyncBoundary } from "@/components/async-boundary"
import { EntryPagination } from "@/components/entry-pagination"
import { PageBreadcrumb } from "@/components/page-breadcrumb"
import { PageContainer } from "@/components/page-container"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useContentType } from "@/hooks/use-content-types"
import { useEntries } from "@/hooks/use-entries"
import { formatDate } from "@/lib/format"
import { usePageContextStore } from "@/stores/page-context-store"

function EntryListContent({
  contentTypeId,
  page,
  onPageChange,
}: {
  contentTypeId: string
  page: number
  onPageChange: (page: number) => void
}) {
  const { data: ctData } = useContentType(contentTypeId)
  const { data } = useEntries(contentTypeId, page)
  const contentType = ctData?.data
  const titleField = contentType?.fields.find((f) => f.slug === "title") ?? contentType?.fields[0]

  if (!data.data || data.data.length === 0) {
    return (
      <div className="text-center py-20 border border-dashed rounded-lg">
        <FileText className="h-8 w-8 mx-auto text-muted-foreground/30 mb-4" />
        <p className="text-sm font-medium mb-1">エントリがありません</p>
        <p className="text-[13px] text-muted-foreground mb-4">最初のエントリを作成しましょう</p>
        <Link to={`/content-types/${contentTypeId}/entries/new`}>
          <Button size="sm" className="h-8 text-[13px]">
            <Plus className="h-3.5 w-3.5 mr-1.5" />
            作成する
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <>
      <div className="border rounded-lg divide-y">
        {data.data.map((entry) => {
          const label = titleField
            ? String((entry.data as Record<string, unknown>)[titleField.slug] ?? entry.slug)
            : entry.slug

          return (
            <Link
              key={entry.id}
              to={`/content-types/${contentTypeId}/entries/${entry.id}`}
              className="flex items-center justify-between px-4 py-3 hover:bg-secondary/50 transition-colors duration-150 group"
            >
              <div className="min-w-0">
                <p className="text-[13px] font-medium truncate">{label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {formatDate(entry.createdAt)}
                </p>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground/30 group-hover:text-muted-foreground transition-colors duration-150 flex-shrink-0 ml-3" />
            </Link>
          )
        })}
      </div>
      {data.meta ? (
        <EntryPagination
          page={page}
          totalPages={data.meta.totalPages}
          onPageChange={onPageChange}
        />
      ) : null}
    </>
  )
}

export function EntryListPage() {
  const { id: contentTypeId } = useParams<{ id: string }>()
  const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1))
  const [isPending, startTransition] = useTransition()

  const handlePageChange = (newPage: number) => {
    startTransition(() => {
      setPage(newPage)
    })
  }

  if (!contentTypeId) return null

  return (
    <AsyncBoundary
      fallback={
        <PageContainer>
          <Skeleton className="h-3 w-48 mb-6" />
          <Skeleton className="h-6 w-48 mb-6" />
          <div className="border rounded-lg divide-y">
            {Array.from({ length: 5 }).map((_, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: static skeleton list
              <div key={`skeleton-${i}`} className="px-4 py-3">
                <Skeleton className="h-4 w-1/2 mb-2" />
                <Skeleton className="h-3 w-24" />
              </div>
            ))}
          </div>
        </PageContainer>
      }
    >
      <EntryListInner
        contentTypeId={contentTypeId}
        page={page}
        isPending={isPending}
        onPageChange={handlePageChange}
      />
    </AsyncBoundary>
  )
}

function EntryListInner({
  contentTypeId,
  page,
  isPending,
  onPageChange,
}: {
  contentTypeId: string
  page: number
  isPending: boolean
  onPageChange: (page: number) => void
}) {
  const { data: ctData } = useContentType(contentTypeId)
  const contentType = ctData?.data
  const name = contentType?.name ?? "エントリ"
  const setExtras = usePageContextStore((s) => s.setExtras)
  const clearExtras = usePageContextStore((s) => s.clearExtras)

  useEffect(() => {
    if (contentType) {
      setExtras({
        contentTypeId,
        contentTypeName: contentType.name,
        fields: contentType.fields,
        pageNum: page,
      })
    }
    return () => clearExtras()
  }, [contentTypeId, contentType, page, setExtras, clearExtras])

  return (
    <PageContainer>
      <PageBreadcrumb
        items={[
          { label: "ダッシュボード", to: "/dashboard" },
          { label: "コンテンツ", to: "/content-types" },
          { label: name, to: `/content-types/${contentTypeId}` },
          { label: "エントリ" },
        ]}
      />
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-lg font-semibold">{name}</h1>
        <Link to={`/content-types/${contentTypeId}/entries/new`}>
          <Button size="sm" className="h-8 text-[13px]">
            <Plus className="h-3.5 w-3.5 mr-1.5" />
            新規作成
          </Button>
        </Link>
      </div>

      <div className={isPending ? "opacity-50 transition-opacity duration-150" : undefined}>
        <AsyncBoundary
          fallback={
            <div className="border rounded-lg divide-y">
              {Array.from({ length: 5 }).map((_, i) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: static skeleton list
                <div key={`skeleton-${i}`} className="px-4 py-3">
                  <Skeleton className="h-4 w-1/2 mb-2" />
                  <Skeleton className="h-3 w-24" />
                </div>
              ))}
            </div>
          }
        >
          <EntryListContent contentTypeId={contentTypeId} page={page} onPageChange={onPageChange} />
        </AsyncBoundary>
      </div>
    </PageContainer>
  )
}
