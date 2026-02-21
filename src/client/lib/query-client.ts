import { QueryClient } from "@tanstack/react-query"

const NON_RETRYABLE_STATUS = new Set([400, 401, 403, 404])

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        if (error instanceof Response && NON_RETRYABLE_STATUS.has(error.status)) {
          return false
        }
        return failureCount < 3
      },
      staleTime: 1000 * 60,
    },
    mutations: {
      retry: false,
    },
  },
})
