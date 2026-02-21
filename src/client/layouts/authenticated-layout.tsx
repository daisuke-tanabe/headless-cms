import { useAuth } from "@clerk/clerk-react"
import { Navigate, Outlet } from "react-router"
import { PageContainer } from "@/components/page-container"
import { Skeleton } from "@/components/ui/skeleton"

function AuthLoadingSkeleton() {
  return (
    <PageContainer>
      <Skeleton className="h-3 w-24 mb-6" />
      <Skeleton className="h-6 w-48 mb-8" />
      <div className="grid gap-4 sm:grid-cols-3">
        <Skeleton className="h-[120px] rounded-lg" />
        <Skeleton className="h-[120px] rounded-lg" />
        <Skeleton className="h-[120px] rounded-lg" />
      </div>
    </PageContainer>
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
