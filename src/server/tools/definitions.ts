import type Anthropic from "@anthropic-ai/sdk"

export const toolDefinitions: Anthropic.Tool[] = [
  {
    name: "get_entries",
    description: "現在のコンテンツタイプのエントリ一覧を取得します。",
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
    name: "get_entry",
    description: "指定したIDのエントリを取得します。",
    input_schema: {
      type: "object" as const,
      properties: {
        id: {
          type: "string",
          description: "エントリのID",
        },
      },
      required: ["id"],
    },
  },
  {
    name: "create_entry",
    description: "新しいエントリを作成します。エディタにフィールド値を反映します。",
    input_schema: {
      type: "object" as const,
      properties: {
        contentTypeId: {
          type: "string",
          description: "コンテンツタイプのID",
        },
        data: {
          type: "object",
          description: "エントリのフィールド値（フィールドslug → 値）",
        },
      },
      required: ["contentTypeId", "data"],
    },
  },
  {
    name: "update_entry",
    description:
      "既存のエントリを更新します。指定されたフィールドのみ上書きします。エディタに反映します。",
    input_schema: {
      type: "object" as const,
      properties: {
        id: {
          type: "string",
          description: "エントリのID",
        },
        contentTypeId: {
          type: "string",
          description: "コンテンツタイプのID",
        },
        data: {
          type: "object",
          description: "更新するフィールド値（フィールドslug → 値）",
        },
      },
      required: ["id", "contentTypeId", "data"],
    },
  },
  {
    name: "delete_entry",
    description: "指定したIDのエントリを削除します。ユーザーの承認が必要です。",
    input_schema: {
      type: "object" as const,
      properties: {
        id: {
          type: "string",
          description: "エントリのID",
        },
      },
      required: ["id"],
    },
  },
]
