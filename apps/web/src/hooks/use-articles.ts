import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { apiClient } from "@/lib/api-client"

const articleKeys = {
	all: ["articles"] as const,
	lists: () => [...articleKeys.all, "list"] as const,
	list: (page: number) => [...articleKeys.lists(), page] as const,
	details: () => [...articleKeys.all, "detail"] as const,
	detail: (id: string) => [...articleKeys.details(), id] as const,
	count: () => [...articleKeys.all, "count"] as const,
}

export function useArticles(page: number) {
	return useQuery({
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
	return useQuery({
		queryKey: articleKeys.detail(id),
		queryFn: async () => {
			const res = await apiClient.api.articles[":id"].$get({
				param: { id },
			})
			if (!res.ok) throw res
			return res.json()
		},
		enabled: !!id,
	})
}

export function useArticleCount() {
	return useQuery({
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
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: articleKeys.lists() })
			queryClient.invalidateQueries({ queryKey: articleKeys.count() })
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
		onSuccess: (_data, variables) => {
			queryClient.invalidateQueries({ queryKey: articleKeys.detail(variables.id) })
			queryClient.invalidateQueries({ queryKey: articleKeys.lists() })
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
			queryClient.invalidateQueries({ queryKey: articleKeys.lists() })
			queryClient.invalidateQueries({ queryKey: articleKeys.count() })
		},
	})
}
