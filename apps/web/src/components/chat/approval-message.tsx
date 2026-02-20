import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useDeleteArticle } from "@/hooks/use-articles"
import { useChatStore } from "@/stores/chat-store"

type ApprovalMessageProps = {
	readonly articleId: string
	readonly articleTitle: string
	readonly status: "pending" | "approved" | "cancelled"
}

export function ApprovalMessage({ articleId, articleTitle, status }: ApprovalMessageProps) {
	const deleteArticle = useDeleteArticle()
	const { updateLastApproval, addMessage } = useChatStore()

	const handleApprove = async () => {
		try {
			await deleteArticle.mutateAsync(articleId)
			updateLastApproval("approved")
			addMessage({
				type: "text",
				role: "assistant",
				content: `[システム] 記事を削除しました（タイトル: ${articleTitle}）`,
			})
		} catch {
			addMessage({
				type: "text",
				role: "assistant",
				content: "記事の削除に失敗しました。",
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
					「{articleTitle}」を削除しました。
				</CardContent>
			</Card>
		)
	}

	if (status === "cancelled") {
		return (
			<Card className="bg-muted">
				<CardContent className="p-3 text-sm text-muted-foreground">
					「{articleTitle}」の削除をキャンセルしました。
				</CardContent>
			</Card>
		)
	}

	return (
		<Card>
			<CardContent className="p-3 space-y-3">
				<p className="text-sm">この記事を削除します「{articleTitle}」</p>
				<div className="flex gap-2">
					<Button
						size="sm"
						variant="destructive"
						onClick={handleApprove}
						disabled={deleteArticle.isPending}
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
