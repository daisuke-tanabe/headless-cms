import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { apiClient } from "@/lib/api-client"

const apiKeyKeys = {
  all: ["api-keys"] as const,
  list: () => [...apiKeyKeys.all, "list"] as const,
}

export function useApiKeys() {
  return useQuery({
    queryKey: apiKeyKeys.list(),
    queryFn: async () => {
      const res = await apiClient.api["api-keys"].$get()
      if (!res.ok) throw res
      return res.json()
    },
  })
}

export function useCreateApiKey() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      const res = await apiClient.api["api-keys"].$post()
      if (!res.ok) throw res
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: apiKeyKeys.list() })
      toast.success("APIキーを作成しました")
    },
    onError: () => {
      toast.error("APIキーの作成に失敗しました", {
        description: "ネットワーク接続を確認して、もう一度お試しください。",
      })
    },
  })
}

export function useDeleteApiKey() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await apiClient.api["api-keys"][":id"].$delete({
        param: { id },
      })
      if (!res.ok) throw res
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: apiKeyKeys.list() })
      toast.success("APIキーを削除しました")
    },
    onError: () => {
      toast.error("APIキーの削除に失敗しました", {
        description: "ネットワーク接続を確認して、もう一度お試しください。",
      })
    },
  })
}
