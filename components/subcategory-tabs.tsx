"use client"

import { SUBCATEGORIAS, type ProductCategory } from "@/lib/types"

interface SubcategoryTabsProps {
  category: ProductCategory | "nuevo" | "rebajas"
  selectedSubcategory: string | null
  onSubcategoryChange: (subcategory: string | null) => void
  className?: string
}

export default function SubcategoryTabs({
  category,
  selectedSubcategory,
  onSubcategoryChange,
  className = "",
}: SubcategoryTabsProps) {
  const subcategories = SUBCATEGORIAS[category as keyof typeof SUBCATEGORIAS] || []

  if (subcategories.length === 0) return null

  return (
    <div className={`mb-8 ${className}`}>
      <div className="flex flex-wrap gap-2 md:gap-3">
        {/* Opción "Ver todo" */}
        <button
          onClick={() => onSubcategoryChange(null)}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            selectedSubcategory === null ? "bg-accent-orange text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          Ver todo
        </button>

        {/* Subcategorías */}
        {subcategories.map((subcategory) => (
          <button
            key={subcategory}
            onClick={() => onSubcategoryChange(subcategory)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              selectedSubcategory === subcategory
                ? "bg-accent-orange text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {subcategory}
          </button>
        ))}
      </div>
    </div>
  )
}
