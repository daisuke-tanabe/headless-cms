import { Skeleton } from "@/components/ui/skeleton"
import { useAuth } from "@clerk/clerk-react"
import { Navigate, Outlet } from "react-router"

function AuthLoadingSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Skeleton className="h-8 w-48 mb-2" />
      <Skeleton className="h-5 w-64 mb-8" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
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
