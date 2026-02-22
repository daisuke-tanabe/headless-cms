import { useAuth } from "@clerk/clerk-react"
import { useQueryClient } from "@tanstack/react-query"
import { useEffect, useRef } from "react"
import { useChatStore } from "@/stores/chat-store"

export function useOrgSwitch() {
  const { orgId } = useAuth()
  const queryClient = useQueryClient()
  const prevOrgId = useRef(orgId)
  const clearMessages = useChatStore((s) => s.clearMessages)

  useEffect(() => {
    if (prevOrgId.current && orgId && prevOrgId.current !== orgId) {
      queryClient.invalidateQueries()
      clearMessages()
    }
    prevOrgId.current = orgId
  }, [orgId, queryClient, clearMessages])
}
