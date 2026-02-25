import type Anthropic from "@anthropic-ai/sdk"

export const toolDefinitions: Anthropic.Tool[] = [
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
