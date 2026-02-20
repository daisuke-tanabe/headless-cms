import { useAuth } from "@clerk/clerk-react"
import { Navigate, Outlet } from "react-router"

export function AuthenticatedLayout() {
	const { isSignedIn, isLoaded } = useAuth()

	if (!isLoaded) {
		return (
			<div className="flex items-center justify-center min-h-[50vh]">
				<p className="text-muted-foreground">読み込み中...</p>
			</div>
		)
	}

	if (!isSignedIn) {
		return <Navigate to="/" replace />
	}

	return <Outlet />
}
