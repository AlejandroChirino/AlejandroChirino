"use client"

import { useState } from "react"
import { ChevronDown, ChevronUp } from "lucide-react"
import { SUBCATEGORIAS, type ProductCategory } from "@/lib/types"

interface SubcategoryFilterProps {
  category: ProductCategory | "nuevo" | "rebajas"
  selectedSubcategory: string | null
  onSubcategoryChange: (subcategory: string | null) => void
  className?: string
}

export default function SubcategoryFilter({
  category,
  selectedSubcategory,
  onSubcategoryChange,
  className = "",
}: SubcategoryFilterProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  // Avoid duplicating the explicit "Ver todo" button if SUBCATEGORIAS contains it
  const subcategories = (SUBCATEGORIAS[category as keyof typeof SUBCATEGORIAS] || []).filter(
    (s) => s !== "Ver todo"
  )

  if (subcategories.length === 0) return null

  const visibleSubcategories = isExpanded ? subcategories : subcategories.slice(0, 6)
  const hasMore = subcategories.length > 6

  return (
    <div className={`bg-white rounded-lg border p-4 ${className}`}>
      <h3 className="font-semibold mb-4 text-gray-900">Subcategorías</h3>

      <div className="space-y-2">
        {/* Opción "Ver todo" */}
        <button
          onClick={() => onSubcategoryChange(null)}
          className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
            selectedSubcategory === null ? "bg-accent-orange text-white" : "text-gray-700 hover:bg-gray-100"
          }`}
        >
          Ver todo
        </button>

        {/* Subcategorías */}
        {visibleSubcategories.map((subcategory) => (
          <button
            key={subcategory}
            onClick={() => onSubcategoryChange(subcategory)}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
              selectedSubcategory === subcategory ? "bg-accent-orange text-white" : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            {subcategory}
          </button>
        ))}

        {/* Botón "Ver más/menos" */}
        {hasMore && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm text-accent-orange hover:bg-orange-50 rounded-lg transition-colors"
          >
            {isExpanded ? (
              <>
                Ver menos <ChevronUp className="h-4 w-4" />
              </>
            ) : (
              <>
                Ver más ({subcategories.length - 6}) <ChevronDown className="h-4 w-4" />
              </>
            )}
          </button>
        )}
      </div>
    </div>
  )
}
