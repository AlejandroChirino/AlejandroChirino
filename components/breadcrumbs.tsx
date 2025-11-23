import Link from "next/link"
import { ChevronRight, Home } from "lucide-react"
import { capitalize } from "@/lib/utils"
import type { BreadcrumbItem } from "@/lib/types"

interface BreadcrumbsProps {
  items: BreadcrumbItem[]
  className?: string
}

export default function Breadcrumbs({ items, className = "" }: BreadcrumbsProps) {
  return (
    <nav aria-label="Breadcrumb" className={`flex items-center space-x-0.5 text-xs w-full py-0 ${className}`}>
      <Link
        href="/"
        className="flex items-center text-gray-500 hover:text-gray-700 transition-colors"
        aria-label="Ir al inicio"
      >
        <Home className="h-3 w-3" />
        <span className="sr-only">Inicio</span>
      </Link>

      {items.map((item, index) => (
        <div key={index} className="flex items-center space-x-1 min-w-0">
          <ChevronRight className="h-3 w-3 text-gray-400" />
          {item.href ? (
            <Link href={item.href} className="text-gray-500 hover:text-gray-700 transition-colors">
              <span className="truncate block">{capitalize(item.label)}</span>
            </Link>
          ) : (
            <span className="text-gray-900 font-medium truncate block">{capitalize(item.label)}</span>
          )}
        </div>
      ))}
    </nav>
  )
}
