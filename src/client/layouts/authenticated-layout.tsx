import { Skeleton } from "@/components/ui/skeleton"
import { useAuth } from "@clerk/clerk-react"
import { Navigate, Outlet } from "react-router"

function AuthLoadingSkeleton() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <Skeleton className="h-3 w-24 mb-6" />
      <Skeleton className="h-6 w-48 mb-8" />
      <div className="grid gap-4 sm:grid-cols-3">
        <Skeleton className="h-[120px] rounded-lg" />
        <Skeleton className="h-[120px] rounded-lg" />
        <Skeleton className="h-[120px] rounded-lg" />
      </div>
    </div>
  )
}

export function AuthenticatedLayout() {
  const { isSignedIn, isLoaded } = useAuth()

  if (!isLoaded) {
    return <AuthLoadingSkeleton />
  }

  if (!isSignedIn) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}
