import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

interface ArticlePaginationProps {
  page: number
  totalPages: number
  onPageChange: (page: number) => void
}

export function ArticlePagination({ page, totalPages, onPageChange }: ArticlePaginationProps) {
  if (totalPages <= 1) return null

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

          {Array.from({ length: totalPages }).map((_, i) => {
            const pageNum = i + 1
            if (
              totalPages <= 5 ||
              pageNum === 1 ||
              pageNum === totalPages ||
              Math.abs(pageNum - page) <= 1
            ) {
              return (
                <PaginationItem key={pageNum}>
                  <PaginationLink
                    isActive={pageNum === page}
                    onClick={() => onPageChange(pageNum)}
                    className="cursor-pointer"
                  >
                    {pageNum}
                  </PaginationLink>
                </PaginationItem>
              )
            }
            if (pageNum === 2 && page > 3) {
              return (
                <PaginationItem key="ellipsis-start">
                  <span className="flex h-9 w-9 items-center justify-center text-sm">...</span>
                </PaginationItem>
              )
            }
            if (pageNum === totalPages - 1 && page < totalPages - 2) {
              return (
                <PaginationItem key="ellipsis-end">
                  <span className="flex h-9 w-9 items-center justify-center text-sm">...</span>
                </PaginationItem>
              )
            }
            return null
          })}

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
