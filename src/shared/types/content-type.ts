export type FieldType = "text" | "richtext" | "number" | "date" | "boolean"

export type ContentType = {
  readonly id: string
  readonly slug: string
  readonly name: string
  readonly orgId: string
  readonly createdAt: string
  readonly updatedAt: string
}

export type Field = {
  readonly id: string
  readonly contentTypeId: string
  readonly slug: string
  readonly name: string
  readonly type: FieldType
  readonly required: boolean
  readonly order: number
  readonly createdAt: string
  readonly updatedAt: string
}

export type ContentTypeWithFields = ContentType & {
  readonly fields: readonly Field[]
}

export type Entry = {
  readonly id: string
  readonly slug: string
  readonly contentTypeId: string
  readonly orgId: string
  readonly authorId: string
  readonly data: Record<string, unknown>
  readonly createdAt: string
  readonly updatedAt: string
}

export type EntryListItem = {
  readonly id: string
  readonly slug: string
  readonly data: Record<string, unknown>
  readonly createdAt: string
  readonly updatedAt: string
}
