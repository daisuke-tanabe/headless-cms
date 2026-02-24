import {
  type QueryClient,
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query"
import { toast } from "sonner"
import { apiClient } from "@/lib/api-client"

const articleKeys = {
  all: ["articles"] as const,
  lists: () => [...articleKeys.all, "list"] as const,
  list: (page: number) => [...articleKeys.lists(), page] as const,
  details: () => [...articleKeys.all, "detail"] as const,
  detail: (id: string) => [...articleKeys.details(), id] as const,
  count: () => [...articleKeys.all, "count"] as const,
}

const invalidateListsAndCount = (queryClient: QueryClient) => {
  queryClient.invalidateQueries({ queryKey: articleKeys.lists() })
  queryClient.invalidateQueries({ queryKey: articleKeys.count() })
}

export function useArticles(page: number) {
  return useSuspenseQuery({
    queryKey: articleKeys.list(page),
    queryFn: async () => {
      const res = await apiClient.api.articles.$get({
        query: { page: String(page), limit: "20" },
      })
      if (!res.ok) throw res
      return res.json()
    },
  })
}

export function useArticle(id: string) {
  return useSuspenseQuery({
    queryKey: articleKeys.detail(id),
    queryFn: async () => {
      const res = await apiClient.api.articles[":id"].$get({
        param: { id },
      })
      if (res.status === 404) return null
      if (!res.ok) throw res
      return res.json()
    },
  })
}

export function useArticleCount() {
  return useSuspenseQuery({
    queryKey: articleKeys.count(),
    queryFn: async () => {
      const res = await apiClient.api.articles.count.$get()
      if (!res.ok) throw res
      return res.json()
    },
  })
}

export function useCreateArticle() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: { title: string; body: string }) => {
      const res = await apiClient.api.articles.$post({
        json: data,
      })
      if (!res.ok) throw res
      return res.json()
    },
    onSuccess: (_data, variables) => {
      invalidateListsAndCount(queryClient)
      toast.success("記事を作成しました", {
        description: `「${variables.title}」を作成しました。`,
      })
    },
    onError: () => {
      toast.error("記事の作成に失敗しました", {
        description: "ネットワーク接続を確認して、もう一度お試しください。",
      })
    },
  })
}

export function useUpdateArticle() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: { title?: string; body?: string } }) => {
      const res = await apiClient.api.articles[":id"].$patch({
        param: { id },
        json: data,
      })
      if (!res.ok) throw res
      return res.json()
    },
    onSuccess: (result, variables) => {
      queryClient.invalidateQueries({ queryKey: articleKeys.detail(variables.id) })
      queryClient.invalidateQueries({ queryKey: articleKeys.lists() })
      // count（記事件数）は更新で変わらないため invalidate 不要
      toast.success("記事を更新しました", {
        description: `「${result.data.title}」を更新しました。`,
      })
    },
    onError: () => {
      toast.error("記事の更新に失敗しました", {
        description: "ネットワーク接続を確認して、もう一度お試しください。",
      })
    },
  })
}

export function useDeleteArticle() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await apiClient.api.articles[":id"].$delete({
        param: { id },
      })
      if (!res.ok) throw res
      return res.json()
    },
    onSuccess: () => {
      invalidateListsAndCount(queryClient)
      toast.success("記事を削除しました", {
        description: "記事を完全に削除しました。",
      })
    },
    onError: () => {
      toast.error("記事の削除に失敗しました", {
        description: "ネットワーク接続を確認して、もう一度お試しください。",
      })
    },
  })
}
