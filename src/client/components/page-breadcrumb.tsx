import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Link } from "react-router"

type BreadcrumbSegment = {
  readonly label: string
  readonly to?: string
}

type PageBreadcrumbProps = {
  readonly items: readonly BreadcrumbSegment[]
  readonly className?: string
}

export function PageBreadcrumb({ items, className }: PageBreadcrumbProps) {
  return (
    <Breadcrumb className={className ?? "mb-6"}>
      <BreadcrumbList className="text-xs">
        {items.map((item, index) => {
          const isLast = index === items.length - 1
          return (
            <BreadcrumbItem key={item.label}>
              {index > 0 ? <BreadcrumbSeparator /> : null}
              {isLast || !item.to ? (
                <BreadcrumbPage>{item.label}</BreadcrumbPage>
              ) : (
                <BreadcrumbLink asChild>
                  <Link
                    to={item.to}
                    className="text-muted-foreground hover:text-foreground transition-colors duration-150"
                  >
                    {item.label}
                  </Link>
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
          )
        })}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
