import type { ChatAction, ChatRequest, ChatResponse, PageContext } from "../../shared/index.js"
import { MAX_HISTORY_LENGTH } from "../../shared/index.js"
import Anthropic from "@anthropic-ai/sdk"
import { toolDefinitions } from "../tools/definitions.js"
import { executeToolUse } from "../tools/executor.js"

// TODO: ANTHROPIC_API_KEY 未設定のため実行時エラーになる
const anthropic = new Anthropic()

const buildSystemPrompt = (context: PageContext): string => {
	const contextDescription = buildContextDescription(context)

	return `あなたはCMS操作アシスタントです。ユーザーの指示に基づいて、記事の作成・編集・削除・ページ遷移を代行します。

## 現在のページ
${contextDescription}

## ルール
- 応答は100文字以内で簡潔に
- 記事を操作する際はIDを正確に追跡してください
- ユーザーの会話履歴にある[システム]メッセージから記事IDを参照できます
- 記事の削除は必ず delete_article ツールを使用してください（ユーザーの承認が必要です）
- 記事の作成は create_article ツールを使用してエディタに反映してください
- 記事の編集は update_article ツールを使用してエディタに反映してください
- ページ遷移は navigate ツールを使用してください`
}

const buildContextDescription = (context: PageContext): string => {
	switch (context.page) {
		case "dashboard":
			return "ダッシュボード"
		case "articles":
			return `記事一覧（ページ ${context.pageNum}）`
		case "article_new":
			return `記事作成エディタ（タイトル: "${context.editor.title}", 本文: "${context.editor.body}"）`
		case "article_edit":
			return `記事編集エディタ（ID: ${context.article.id}, タイトル: "${context.article.title}", 本文: "${context.article.body}"）`
	}
}

export const processChat = async (
	request: ChatRequest,
	userId: string,
): Promise<ChatResponse> => {
	const systemPrompt = buildSystemPrompt(request.context)

	const trimmedHistory = request.history.slice(-MAX_HISTORY_LENGTH)
	const messages: Anthropic.MessageParam[] = [
		...trimmedHistory.map(
			(h) =>
				({
					role: h.role,
					content: h.content,
				}) satisfies Anthropic.MessageParam,
		),
		{ role: "user", content: request.message },
	]

	const response = await anthropic.messages.create({
		model: "claude-sonnet-4-20250514",
		max_tokens: 1024,
		system: systemPrompt,
		tools: toolDefinitions,
		messages,
	})

	// テキスト応答を抽出
	const textBlock = response.content.find((block) => block.type === "text")
	const messageText = textBlock?.type === "text" ? textBlock.text : ""

	// tool_use ブロックを抽出（single-turn: 最初の1つのみ処理）
	const toolUseBlock = response.content.find((block) => block.type === "tool_use")

	let action: ChatAction | null = null
	if (toolUseBlock?.type === "tool_use") {
		action = await executeToolUse(
			toolUseBlock as Anthropic.ContentBlockParam & { type: "tool_use" },
			userId,
		)
	}

	return {
		message: messageText || "承知しました。",
		action,
	}
}
