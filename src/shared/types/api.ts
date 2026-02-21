export type PaginationMeta = {
	readonly total: number
	readonly page: number
	readonly limit: number
	readonly totalPages: number
}

export type ApiResponse<T> = {
	readonly data: T
	readonly meta?: PaginationMeta
}

export type ErrorResponse = {
	readonly error: string
	readonly details?: readonly string[]
}
