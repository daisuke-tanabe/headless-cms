import { useAuth } from "@clerk/clerk-react"
import { Navigate, Outlet } from "react-router"
import { Skeleton } from "@/components/ui/skeleton"

export function EditorLayout() {
  const { isSignedIn, isLoaded } = useAuth()

  if (!isLoaded) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Skeleton className="h-8 w-48" />
      </div>
    )
  }

  if (!isSignedIn) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}
