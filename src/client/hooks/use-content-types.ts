import {
  type QueryClient,
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query"
import { toast } from "sonner"
import { apiClient } from "@/lib/api-client"
import type { FieldType } from "~/shared"

const contentTypeKeys = {
  all: ["content-types"] as const,
  lists: () => [...contentTypeKeys.all, "list"] as const,
  details: () => [...contentTypeKeys.all, "detail"] as const,
  detail: (id: string) => [...contentTypeKeys.details(), id] as const,
}

const invalidateLists = (queryClient: QueryClient) => {
  queryClient.invalidateQueries({ queryKey: contentTypeKeys.lists() })
}

export function useContentTypes() {
  return useSuspenseQuery({
    queryKey: contentTypeKeys.lists(),
    queryFn: async () => {
      const res = await apiClient.api["content-types"].$get()
      if (!res.ok) throw res
      return res.json()
    },
  })
}

export function useContentType(id: string) {
  return useSuspenseQuery({
    queryKey: contentTypeKeys.detail(id),
    queryFn: async () => {
      const res = await apiClient.api["content-types"][":id"].$get({ param: { id } })
      if (res.status === 404) return null
      if (!res.ok) throw res
      return res.json()
    },
  })
}

export function useCreateContentType() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: { slug: string; name: string }) => {
      const res = await apiClient.api["content-types"].$post({ json: data })
      if (!res.ok) throw res
      return res.json()
    },
    onSuccess: (_data, variables) => {
      invalidateLists(queryClient)
      toast.success("コンテンツタイプを作成しました", {
        description: `「${variables.name}」を作成しました。`,
      })
    },
    onError: () => {
      toast.error("コンテンツタイプの作成に失敗しました", {
        description: "ネットワーク接続を確認して、もう一度お試しください。",
      })
    },
  })
}

export function useUpdateContentType() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: { name: string } }) => {
      const res = await apiClient.api["content-types"][":id"].$patch({
        param: { id },
        json: data,
      })
      if (!res.ok) throw res
      return res.json()
    },
    onSuccess: (result, variables) => {
      queryClient.invalidateQueries({ queryKey: contentTypeKeys.detail(variables.id) })
      invalidateLists(queryClient)
      toast.success("コンテンツタイプを更新しました", {
        description: `「${result.data.name}」を更新しました。`,
      })
    },
    onError: () => {
      toast.error("コンテンツタイプの更新に失敗しました", {
        description: "ネットワーク接続を確認して、もう一度お試しください。",
      })
    },
  })
}

export function useDeleteContentType() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await apiClient.api["content-types"][":id"].$delete({ param: { id } })
      if (!res.ok) throw res
      return res.json()
    },
    onSuccess: (_data, id) => {
      invalidateLists(queryClient)
      queryClient.removeQueries({ queryKey: contentTypeKeys.detail(id) })
      toast.success("コンテンツタイプを削除しました")
    },
    onError: () => {
      toast.error("コンテンツタイプの削除に失敗しました", {
        description: "ネットワーク接続を確認して、もう一度お試しください。",
      })
    },
  })
}

export function useCreateField() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      contentTypeId,
      data,
    }: {
      contentTypeId: string
      data: { slug: string; name: string; type: FieldType; required: boolean; order: number }
    }) => {
      const res = await apiClient.api["content-types"][":id"].fields.$post({
        param: { id: contentTypeId },
        json: data,
      })
      if (!res.ok) throw res
      return res.json()
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: contentTypeKeys.detail(variables.contentTypeId) })
      toast.success("フィールドを追加しました")
    },
    onError: () => {
      toast.error("フィールドの追加に失敗しました")
    },
  })
}

export function useUpdateField() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      contentTypeId,
      fieldId,
      data,
    }: {
      contentTypeId: string
      fieldId: string
      data: { name?: string; required?: boolean; order?: number }
    }) => {
      const res = await apiClient.api["content-types"][":id"].fields[":fieldId"].$patch({
        param: { id: contentTypeId, fieldId },
        json: data,
      })
      if (!res.ok) throw res
      return res.json()
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: contentTypeKeys.detail(variables.contentTypeId) })
      toast.success("フィールドを更新しました")
    },
    onError: () => {
      toast.error("フィールドの更新に失敗しました")
    },
  })
}

export function useDeleteField() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ contentTypeId, fieldId }: { contentTypeId: string; fieldId: string }) => {
      const res = await apiClient.api["content-types"][":id"].fields[":fieldId"].$delete({
        param: { id: contentTypeId, fieldId },
      })
      if (!res.ok) throw res
      return res.json()
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: contentTypeKeys.detail(variables.contentTypeId) })
      toast.success("フィールドを削除しました")
    },
    onError: () => {
      toast.error("フィールドの削除に失敗しました")
    },
  })
}
