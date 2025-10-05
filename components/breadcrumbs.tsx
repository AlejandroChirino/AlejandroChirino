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
    <nav aria-label="Breadcrumb" className={`flex items-center space-x-1 text-sm ${className}`}>
      <Link
        href="/"
        className="flex items-center text-gray-500 hover:text-gray-700 transition-colors"
        aria-label="Ir al inicio"
      >
        <Home className="h-4 w-4" />
        <span className="sr-only">Inicio</span>
      </Link>

      {items.map((item, index) => (
        <div key={index} className="flex items-center space-x-1">
          <ChevronRight className="h-4 w-4 text-gray-400" />
          {item.href ? (
            <Link href={item.href} className="text-gray-500 hover:text-gray-700 transition-colors">
              {capitalize(item.label)}
            </Link>
          ) : (
            <span className="text-gray-900 font-medium">{capitalize(item.label)}</span>
          )}
        </div>
      ))}
    </nav>
  )
}
