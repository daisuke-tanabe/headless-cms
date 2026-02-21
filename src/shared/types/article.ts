export type Article = {
  readonly id: string
  readonly slug: string
  readonly title: string
  readonly body: string
  readonly authorId: string
  readonly createdAt: string
  readonly updatedAt: string
}

export type ArticleListItem = {
  readonly id: string
  readonly slug: string
  readonly title: string
  readonly createdAt: string
  readonly updatedAt: string
}
