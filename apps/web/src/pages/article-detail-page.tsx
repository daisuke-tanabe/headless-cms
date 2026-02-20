import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router"
import { ArticleEditor } from "@/components/article-editor"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useArticle, useDeleteArticle, useUpdateArticle } from "@/hooks/use-articles"
import { useEditorStore } from "@/stores/editor-store"

export function ArticleDetailPage() {
	const { id } = useParams<{ id: string }>()
	const navigate = useNavigate()
	const { data, isLoading } = useArticle(id ?? "")
	const updateArticle = useUpdateArticle()
	const deleteArticle = useDeleteArticle()
	const { pendingContent, clearPendingContent } = useEditorStore()

	const [isEditing, setIsEditing] = useState(false)
	const [editDefaults, setEditDefaults] = useState<{ title?: string; body?: string }>()

	useEffect(() => {
		if (pendingContent && data?.data) {
			setEditDefaults({
				title: pendingContent.title ?? data.data.title,
				body: pendingContent.body ?? data.data.body,
			})
			clearPendingContent()
			setIsEditing(true)
		}
	}, [pendingContent, data, clearPendingContent])

	if (!id) return null

	if (isLoading) {
		return (
			<div className="container mx-auto px-4 py-8 max-w-2xl space-y-4">
				<Skeleton className="h-8 w-1/2" />
				<Skeleton className="h-40 w-full" />
			</div>
		)
	}

	if (!data?.data) {
		return (
			<div className="container mx-auto px-4 py-8">
				<p className="text-muted-foreground">記事が見つかりません。</p>
			</div>
		)
	}

	const article = data.data

	if (isEditing) {
		return (
			<div className="container mx-auto px-4 py-8 max-w-2xl">
				<h1 className="text-2xl font-bold mb-6">記事編集</h1>
				<ArticleEditor
					defaultValues={editDefaults ?? { title: article.title, body: article.body }}
					isSubmitting={updateArticle.isPending}
					submitLabel="更新"
					onSubmit={async (formData) => {
						await updateArticle.mutateAsync({ id, data: formData })
						setIsEditing(false)
					}}
				/>
				<Button variant="ghost" className="mt-4" onClick={() => setIsEditing(false)}>
					キャンセル
				</Button>
			</div>
		)
	}

	return (
		<div className="container mx-auto px-4 py-8 max-w-2xl">
			<h1 className="text-2xl font-bold mb-4">{article.title}</h1>
			<p className="text-sm text-muted-foreground mb-6">
				{new Date(article.createdAt).toLocaleDateString("ja-JP")}
			</p>
			<div className="prose max-w-none mb-8">
				<p className="whitespace-pre-wrap">{article.body}</p>
			</div>
			<div className="flex gap-2">
				<Button onClick={() => setIsEditing(true)}>編集</Button>
				<Button
					variant="destructive"
					disabled={deleteArticle.isPending}
					onClick={async () => {
						if (window.confirm(`「${article.title}」を削除しますか？`)) {
							await deleteArticle.mutateAsync(id)
							navigate("/articles")
						}
					}}
				>
					削除
				</Button>
			</div>
		</div>
	)
}
