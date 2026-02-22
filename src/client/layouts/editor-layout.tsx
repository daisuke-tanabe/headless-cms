import { useAuth } from "@clerk/clerk-react"
import { Navigate, Outlet } from "react-router"
import { OrgRequiredPage } from "@/components/org-required-page"
import { Skeleton } from "@/components/ui/skeleton"

export function EditorLayout() {
  const { isSignedIn, isLoaded, orgId } = useAuth()

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

  if (!orgId) {
    return <OrgRequiredPage />
  }

  return <Outlet />
}
