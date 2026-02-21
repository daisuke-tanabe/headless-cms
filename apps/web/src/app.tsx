import { ClerkProvider } from "@clerk/clerk-react"
import { QueryClientProvider } from "@tanstack/react-query"
import { NuqsAdapter } from "nuqs/adapters/react-router/v7"
import { RouterProvider } from "react-router"
import { Toaster } from "@/components/ui/sonner"
import { queryClient } from "./lib/query-client"
import { router } from "./router"

const CLERK_PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY ?? ""

export function App() {
	return (
		<ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY}>
			<QueryClientProvider client={queryClient}>
				<NuqsAdapter>
					<RouterProvider router={router} />
					<Toaster richColors position="top-right" />
				</NuqsAdapter>
			</QueryClientProvider>
		</ClerkProvider>
	)
}
