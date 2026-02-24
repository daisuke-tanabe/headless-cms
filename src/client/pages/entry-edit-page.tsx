import { FileX, Loader2 } from "lucide-react"
import { useEffect, useState } from "react"
import { Link, useNavigate, useParams } from "react-router"
import { AsyncBoundary } from "@/components/async-boundary"
import { EntryEditorShell } from "@/components/entry-editor-layout"
import { EntryForm } from "@/components/entry-form"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useContentType } from "@/hooks/use-content-types"
import { useCreateEntry, useEntry, useUpdateEntry } from "@/hooks/use-entries"
import { useChatStore } from "@/stores/chat-store"
import { useEditorStore } from "@/stores/editor-store"
import { usePageContextStore } from "@/stores/page-context-store"

const NEW_FORM_ID = "entry-new-form"
const EDIT_FORM_ID = "entry-edit-form"

// --- New entry page ---

function EntryNewContent({ contentTypeId }: { contentTypeId: string }) {
  const { data: ctData } = useContentType(contentTypeId)
  const contentType = ctData?.data
  const navigate = useNavigate()
  const createEntry = useCreateEntry(contentTypeId)
  const { pendingContent, clearPendingContent } = useEditorStore()
  const addMessage = useChatStore((s) => s.addMessage)
  const setExtras = usePageContextStore((s) => s.setExtras)
  const clearExtras = usePageContextStore((s) => s.clearExtras)

  const [defaultValues] = useState<Record<string, unknown> | undefined>(() => {
    if (pendingContent) {
      clearPendingContent()
      return pendingContent
    }
    return undefined
  })

  useEffect(() => {
    if (contentType) {
      setExtras({
        contentTypeId,
        contentTypeName: contentType.name,
        fields: contentType.fields,
        editorData: defaultValues ?? {},
      })
    }
    return () => clearExtras()
  }, [contentTypeId, contentType, defaultValues, setExtras, clearExtras])

  if (!contentType) {
    return (
      <EntryEditorShell
        breadcrumbItems={[
          { label: "コンテンツ", to: "/content-types" },
          { label: "見つかりません" },
        ]}
        actionButton={null}
        closePath="/content-types"
      >
        <div className="text-center py-20">
          <FileX className="h-8 w-8 mx-auto text-muted-foreground/30 mb-4" />
          <p className="text-sm font-medium">コンテンツタイプが見つかりません</p>
        </div>
      </EntryEditorShell>
    )
  }

  return (
    <EntryEditorShell
      breadcrumbItems={[
        { label: "コンテンツ", to: "/content-types" },
        { label: contentType.name, to: `/content-types/${contentTypeId}` },
        { label: "エントリ", to: `/content-types/${contentTypeId}/entries` },
        { label: "新規作成" },
      ]}
      actionButton={
        <Button
          type="submit"
          form={NEW_FORM_ID}
          size="sm"
          disabled={createEntry.isPending}
          className="h-8 text-[13px]"
        >
          {createEntry.isPending ? (
            <>
              <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
              作成中...
            </>
          ) : (
            "作成"
          )}
        </Button>
      }
      closePath={`/content-types/${contentTypeId}/entries`}
    >
      <EntryForm
        formId={NEW_FORM_ID}
        fields={contentType.fields}
        defaultValues={defaultValues}
        isSubmitting={createEntry.isPending}
        onSubmit={async (data) => {
          const result = await createEntry.mutateAsync(data)
          addMessage({
            type: "text",
            role: "assistant",
            content: `[システム] エントリを保存しました（ID: ${result.data.id}）`,
          })
          navigate(`/content-types/${contentTypeId}/entries/${result.data.id}`)
        }}
      />
    </EntryEditorShell>
  )
}

// --- Edit entry page ---

function EntryEditContent({ contentTypeId, entryId }: { contentTypeId: string; entryId: string }) {
  const { data: ctData } = useContentType(contentTypeId)
  const { data: entryData } = useEntry(contentTypeId, entryId)
  const contentType = ctData?.data
  const entry = entryData?.data
  const updateEntry = useUpdateEntry(contentTypeId)
  const { pendingContent, clearPendingContent } = useEditorStore()
  const addMessage = useChatStore((s) => s.addMessage)
  const setExtras = usePageContextStore((s) => s.setExtras)
  const clearExtras = usePageContextStore((s) => s.clearExtras)

  const [defaultValues] = useState<Record<string, unknown> | undefined>(() => {
    if (!entry) return undefined
    const base = entry.data as Record<string, unknown>
    if (pendingContent) {
      clearPendingContent()
      return { ...base, ...pendingContent }
    }
    return base
  })

  useEffect(() => {
    if (contentType && entry) {
      setExtras({
        contentTypeId,
        contentTypeName: contentType.name,
        fields: contentType.fields,
        entryId: entry.id,
        entryData: entry.data as Record<string, unknown>,
      })
    }
    return () => clearExtras()
  }, [contentTypeId, contentType, entry, setExtras, clearExtras])

  if (!contentType || !entry) {
    return (
      <EntryEditorShell
        breadcrumbItems={[
          { label: "コンテンツ", to: "/content-types" },
          { label: "見つかりません" },
        ]}
        actionButton={null}
        closePath="/content-types"
      >
        <div className="text-center py-20">
          <FileX className="h-8 w-8 mx-auto text-muted-foreground/30 mb-4" />
          <p className="text-sm font-medium mb-1">エントリが見つかりません</p>
          <p className="text-[13px] text-muted-foreground mb-6">
            このエントリは削除されたか、存在しない可能性があります。
          </p>
          <Link to={`/content-types/${contentTypeId}/entries`}>
            <Button variant="outline" size="sm" className="h-8 text-[13px]">
              一覧に戻る
            </Button>
          </Link>
        </div>
      </EntryEditorShell>
    )
  }

  return (
    <EntryEditorShell
      breadcrumbItems={[
        { label: "コンテンツ", to: "/content-types" },
        { label: contentType.name, to: `/content-types/${contentTypeId}` },
        { label: "エントリ", to: `/content-types/${contentTypeId}/entries` },
        { label: entry.slug },
      ]}
      actionButton={
        <Button
          type="submit"
          form={EDIT_FORM_ID}
          size="sm"
          disabled={updateEntry.isPending}
          className="h-8 text-[13px]"
        >
          {updateEntry.isPending ? (
            <>
              <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
              保存中...
            </>
          ) : (
            "保存"
          )}
        </Button>
      }
      closePath={`/content-types/${contentTypeId}/entries`}
    >
      <EntryForm
        formId={EDIT_FORM_ID}
        fields={contentType.fields}
        defaultValues={defaultValues}
        isSubmitting={updateEntry.isPending}
        onSubmit={async (data) => {
          const result = await updateEntry.mutateAsync({ entryId, data })
          addMessage({
            type: "text",
            role: "assistant",
            content: `[システム] エントリを更新しました（ID: ${result.data.id}）`,
          })
        }}
      />
    </EntryEditorShell>
  )
}

// --- Page exports ---

export function EntryNewPage() {
  const { id: contentTypeId } = useParams<{ id: string }>()

  if (!contentTypeId) return null

  return (
    <AsyncBoundary
      fallback={
        <EntryEditorShell
          breadcrumbItems={[
            { label: "コンテンツ", to: "/content-types" },
            { label: "読み込み中..." },
          ]}
          actionButton={<Skeleton className="h-8 w-16" />}
          closePath="/content-types"
        >
          <div className="max-w-3xl mx-auto px-6 md:px-12 py-8 space-y-6">
            <Skeleton className="h-8 w-2/3" />
            <Skeleton className="h-48 w-full" />
          </div>
        </EntryEditorShell>
      }
    >
      <EntryNewContent contentTypeId={contentTypeId} />
    </AsyncBoundary>
  )
}

export function EntryEditPage() {
  const { id: contentTypeId, entryId } = useParams<{ id: string; entryId: string }>()

  if (!contentTypeId || !entryId) return null

  return (
    <AsyncBoundary
      fallback={
        <EntryEditorShell
          breadcrumbItems={[
            { label: "コンテンツ", to: "/content-types" },
            { label: "読み込み中..." },
          ]}
          actionButton={<Skeleton className="h-8 w-16" />}
          closePath="/content-types"
        >
          <div className="max-w-3xl mx-auto px-6 md:px-12 py-8 space-y-6">
            <Skeleton className="h-8 w-2/3" />
            <Skeleton className="h-48 w-full" />
          </div>
        </EntryEditorShell>
      }
    >
      <EntryEditContent contentTypeId={contentTypeId} entryId={entryId} />
    </AsyncBoundary>
  )
}
