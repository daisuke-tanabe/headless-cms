import type Anthropic from "@anthropic-ai/sdk"

export const toolDefinitions: Anthropic.Tool[] = [
	{
		name: "navigate",
		description: "指定したページに遷移します。",
		input_schema: {
			type: "object" as const,
			properties: {
				to: {
					type: "string",
					description: "遷移先のパス。例: /dashboard, /articles, /articles/new, /articles/:id",
				},
			},
			required: ["to"],
		},
	},
	{
		name: "get_articles",
		description: "記事の一覧を取得します。",
		input_schema: {
			type: "object" as const,
			properties: {
				page: {
					type: "number",
					description: "ページ番号（デフォルト: 1）",
				},
			},
			required: [],
		},
	},
	{
		name: "get_article",
		description: "指定したIDの記事を取得します。",
		input_schema: {
			type: "object" as const,
			properties: {
				id: {
					type: "string",
					description: "記事のID",
				},
			},
			required: ["id"],
		},
	},
	{
		name: "create_article",
		description: "新しい記事を作成します。エディタにタイトルと本文を反映します。",
		input_schema: {
			type: "object" as const,
			properties: {
				title: {
					type: "string",
					description: "記事のタイトル",
				},
				body: {
					type: "string",
					description: "記事の本文",
				},
			},
			required: ["title", "body"],
		},
	},
	{
		name: "update_article",
		description:
			"既存の記事を更新します。指定されたフィールドのみ上書きします。エディタに反映します。",
		input_schema: {
			type: "object" as const,
			properties: {
				id: {
					type: "string",
					description: "記事のID",
				},
				title: {
					type: "string",
					description: "新しいタイトル（変更する場合のみ）",
				},
				body: {
					type: "string",
					description: "新しい本文（変更する場合のみ）",
				},
			},
			required: ["id"],
		},
	},
	{
		name: "delete_article",
		description: "指定したIDの記事を削除します。ユーザーの承認が必要です。",
		input_schema: {
			type: "object" as const,
			properties: {
				id: {
					type: "string",
					description: "記事のID",
				},
			},
			required: ["id"],
		},
	},
]
