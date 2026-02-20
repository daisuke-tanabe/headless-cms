import { useEffect, useState } from "react"
import { useNavigate } from "react-router"
import { ArticleEditor } from "@/components/article-editor"
import { useCreateArticle } from "@/hooks/use-articles"
import { useEditorStore } from "@/stores/editor-store"

export function ArticleNewPage() {
	const navigate = useNavigate()
	const createArticle = useCreateArticle()
	const { pendingContent, clearPendingContent } = useEditorStore()
	const [defaultValues, setDefaultValues] = useState<{
		title?: string
		body?: string
	}>()

	useEffect(() => {
		if (pendingContent) {
			setDefaultValues({
				title: pendingContent.title,
				body: pendingContent.body,
			})
			clearPendingContent()
		}
	}, [pendingContent, clearPendingContent])

	return (
		<div className="container mx-auto px-4 py-8 max-w-2xl">
			<h1 className="text-2xl font-bold mb-6">記事作成</h1>
			<ArticleEditor
				defaultValues={defaultValues}
				isSubmitting={createArticle.isPending}
				submitLabel="作成"
				onSubmit={async (data) => {
					const result = await createArticle.mutateAsync(data)
					navigate(`/articles/${result.data.id}`)
				}}
			/>
		</div>
	)
}
