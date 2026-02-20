import { ClerkProvider } from "@clerk/clerk-react"
import { QueryClientProvider } from "@tanstack/react-query"
import { RouterProvider } from "react-router"
import { queryClient } from "./lib/query-client"
import { router } from "./router"

// TODO: 環境変数未設定のため実行時エラーになる。後続フェーズで設定
const CLERK_PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY ?? ""

export function App() {
	return (
		<ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY}>
			<QueryClientProvider client={queryClient}>
				<RouterProvider router={router} />
			</QueryClientProvider>
		</ClerkProvider>
	)
}
