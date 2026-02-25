import type { ReactNode } from "react"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

interface EntryPaginationProps {
  page: number
  totalPages: number
  onPageChange: (page: number) => void
}

type PageItem = {
  readonly key: string | number
  readonly content: ReactNode
}

function buildPageItems(
  page: number,
  totalPages: number,
  onPageChange: (page: number) => void,
): readonly PageItem[] {
  return Array.from({ length: totalPages }, (_, i) => i + 1).flatMap((i): PageItem[] => {
    if (totalPages <= 5 || i === 1 || i === totalPages || Math.abs(i - page) <= 1) {
      return [
        {
          key: i,
          content: (
            <PaginationLink
              isActive={i === page}
              onClick={() => onPageChange(i)}
              className="cursor-pointer"
            >
              {i}
            </PaginationLink>
          ),
        },
      ]
    }
    if (i === 2 && page > 3) {
      return [
        {
          key: "ellipsis-start",
          content: <span className="flex h-9 w-9 items-center justify-center text-sm">...</span>,
        },
      ]
    }
    if (i === totalPages - 1 && page < totalPages - 2) {
      return [
        {
          key: "ellipsis-end",
          content: <span className="flex h-9 w-9 items-center justify-center text-sm">...</span>,
        },
      ]
    }
    return []
  })
}

export function EntryPagination({ page, totalPages, onPageChange }: EntryPaginationProps) {
  if (totalPages <= 1) return null

  const pageItems = buildPageItems(page, totalPages, onPageChange)

  return (
    <div className="mt-6">
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              onClick={() => onPageChange(Math.max(1, page - 1))}
              aria-disabled={page <= 1}
              className={page <= 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
            />
          </PaginationItem>

          {pageItems.map((item) => (
            <PaginationItem key={item.key}>{item.content}</PaginationItem>
          ))}

          <PaginationItem>
            <PaginationNext
              onClick={() => onPageChange(Math.min(totalPages, page + 1))}
              aria-disabled={page >= totalPages}
              className={page >= totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  )
}
