import {
  type QueryClient,
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query"
import { toast } from "sonner"
import { apiClient } from "@/lib/api-client"

const entryKeys = {
  all: (contentTypeId: string) => ["entries", contentTypeId] as const,
  lists: (contentTypeId: string) => [...entryKeys.all(contentTypeId), "list"] as const,
  list: (contentTypeId: string, page: number) => [...entryKeys.lists(contentTypeId), page] as const,
  details: (contentTypeId: string) => [...entryKeys.all(contentTypeId), "detail"] as const,
  detail: (contentTypeId: string, id: string) => [...entryKeys.details(contentTypeId), id] as const,
  count: (contentTypeId: string) => [...entryKeys.all(contentTypeId), "count"] as const,
}

const invalidateListsAndCount = (queryClient: QueryClient, contentTypeId: string) => {
  queryClient.invalidateQueries({ queryKey: entryKeys.lists(contentTypeId) })
  queryClient.invalidateQueries({ queryKey: entryKeys.count(contentTypeId) })
}

const DEFAULT_ENTRIES_PAGE_LIMIT = 20

export function useEntries(contentTypeId: string, page: number) {
  return useSuspenseQuery({
    queryKey: entryKeys.list(contentTypeId, page),
    queryFn: async () => {
      const res = await apiClient.api["content-types"][":id"].entries.$get({
        param: { id: contentTypeId },
        query: { page: String(page), limit: String(DEFAULT_ENTRIES_PAGE_LIMIT) },
      })
      if (!res.ok) throw res
      return res.json()
    },
  })
}

export function useEntry(contentTypeId: string, entryId: string) {
  return useSuspenseQuery({
    queryKey: entryKeys.detail(contentTypeId, entryId),
    queryFn: async () => {
      const res = await apiClient.api["content-types"][":id"].entries[":entryId"].$get({
        param: { id: contentTypeId, entryId },
      })
      if (res.status === 404) return null
      if (!res.ok) throw res
      return res.json()
    },
  })
}

export function useEntryCount(contentTypeId: string) {
  return useSuspenseQuery({
    queryKey: entryKeys.count(contentTypeId),
    queryFn: async () => {
      const res = await apiClient.api["content-types"][":id"].entries.count.$get({
        param: { id: contentTypeId },
      })
      if (!res.ok) throw res
      return res.json()
    },
  })
}

export function useCreateEntry(contentTypeId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const res = await apiClient.api["content-types"][":id"].entries.$post({
        param: { id: contentTypeId },
        json: { data },
      })
      if (!res.ok) throw res
      return res.json()
    },
    onSuccess: () => {
      invalidateListsAndCount(queryClient, contentTypeId)
      toast.success("エントリを作成しました")
    },
    onError: () => {
      toast.error("エントリの作成に失敗しました", {
        description: "ネットワーク接続を確認して、もう一度お試しください。",
      })
    },
  })
}

export function useUpdateEntry(contentTypeId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ entryId, data }: { entryId: string; data: Record<string, unknown> }) => {
      const res = await apiClient.api["content-types"][":id"].entries[":entryId"].$patch({
        param: { id: contentTypeId, entryId },
        json: { data },
      })
      if (!res.ok) throw res
      return res.json()
    },
    onSuccess: (_result, variables) => {
      queryClient.invalidateQueries({
        queryKey: entryKeys.detail(contentTypeId, variables.entryId),
      })
      queryClient.invalidateQueries({ queryKey: entryKeys.lists(contentTypeId) })
      toast.success("エントリを更新しました")
    },
    onError: () => {
      toast.error("エントリの更新に失敗しました", {
        description: "ネットワーク接続を確認して、もう一度お試しください。",
      })
    },
  })
}

export function useDeleteEntry() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ contentTypeId, entryId }: { contentTypeId: string; entryId: string }) => {
      const res = await apiClient.api["content-types"][":id"].entries[":entryId"].$delete({
        param: { id: contentTypeId, entryId },
      })
      if (!res.ok) throw res
      return res.json()
    },
    onSuccess: (_result, variables) => {
      queryClient.invalidateQueries({ queryKey: entryKeys.lists(variables.contentTypeId) })
      queryClient.invalidateQueries({ queryKey: entryKeys.count(variables.contentTypeId) })
      toast.success("エントリを削除しました")
    },
    onError: () => {
      toast.error("エントリの削除に失敗しました", {
        description: "ネットワーク接続を確認して、もう一度お試しください。",
      })
    },
  })
}
