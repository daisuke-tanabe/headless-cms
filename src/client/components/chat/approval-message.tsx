import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useDeleteEntry } from "@/hooks/use-entries"
import { useChatStore } from "@/stores/chat-store"

type ApprovalMessageProps = {
  readonly entryId: string
  readonly entryLabel: string
  readonly contentTypeId: string
  readonly status: "pending" | "approved" | "cancelled"
}

export function ApprovalMessage({
  entryId,
  entryLabel,
  contentTypeId,
  status,
}: ApprovalMessageProps) {
  const deleteEntry = useDeleteEntry()
  const { updateLastApproval, addMessage } = useChatStore()

  const handleApprove = async () => {
    try {
      await deleteEntry.mutateAsync({ contentTypeId, entryId })
      updateLastApproval("approved")
      addMessage({
        type: "text",
        role: "assistant",
        content: `[システム] エントリを削除しました（${entryLabel}）`,
      })
    } catch {
      addMessage({
        type: "text",
        role: "assistant",
        content: "エントリの削除に失敗しました。",
      })
    }
  }

  const handleCancel = () => {
    updateLastApproval("cancelled")
  }

  if (status === "approved") {
    return (
      <Card className="bg-muted">
        <CardContent className="p-3 text-sm text-muted-foreground">
          「{entryLabel}」を削除しました。
        </CardContent>
      </Card>
    )
  }

  if (status === "cancelled") {
    return (
      <Card className="bg-muted">
        <CardContent className="p-3 text-sm text-muted-foreground">
          「{entryLabel}」の削除をキャンセルしました。
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className="p-3 space-y-3">
        <p className="text-sm">このエントリを削除します「{entryLabel}」</p>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="destructive"
            onClick={handleApprove}
            disabled={deleteEntry.isPending}
          >
            削除する
          </Button>
          <Button size="sm" variant="outline" onClick={handleCancel}>
            キャンセル
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
