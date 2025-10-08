"use client"

import { useState } from "react"
import { Filter, X } from "lucide-react"
import Button from "@/components/ui/button"
import type { VipFilters, ProductCategory } from "@/lib/types"

interface VipFiltersProps {
  filters: VipFilters
  onFiltersChange: (filters: VipFilters) => void
  className?: string
}

export default function VipFilters({ filters, onFiltersChange, className = "" }: VipFiltersProps) {
  const [isOpen, setIsOpen] = useState(false)

  const categories: { value: ProductCategory | "all"; label: string }[] = [
    { value: "all", label: "Todas las categorías" },
    { value: "mujer", label: "Mujer" },
    { value: "hombre", label: "Hombre" },
    { value: "accesorios", label: "Accesorios" },
  ]

  const sortOptions = [
    { value: "newest", label: "Más recientes" },
    { value: "price-asc", label: "Precio: menor a mayor" },
    { value: "price-desc", label: "Precio: mayor a menor" },
    { value: "name-asc", label: "Nombre: A-Z" },
  ]

  const handleCategoryChange = (category: ProductCategory | "all") => {
    onFiltersChange({ ...filters, category })
  }

  const handleSortChange = (sortValue: string) => {
    const [sortBy, sortOrder] = sortValue.split("-")
    onFiltersChange({
      ...filters,
      sortBy: sortBy as "name" | "price" | "newest",
      sortOrder: sortOrder as "asc" | "desc",
    })
  }

  const handlePriceChange = (type: "min" | "max", value: string) => {
    const numValue = value ? Number.parseFloat(value) : undefined
    onFiltersChange({
      ...filters,
      [type === "min" ? "minPrice" : "maxPrice"]: numValue,
    })
  }

  const clearFilters = () => {
    onFiltersChange({
      category: "all",
      sortBy: "newest",
      sortOrder: "desc",
    })
  }

  const hasActiveFilters =
    filters.category !== "all" || filters.minPrice !== undefined || filters.maxPrice !== undefined

  return (
    <div className={className}>
      {/* Mobile filter button */}
      <div className="lg:hidden mb-4">
        <Button onClick={() => setIsOpen(true)} variant="outline" className="w-full">
          <Filter className="h-4 w-4 mr-2" />
          Filtros
          {hasActiveFilters && (
            <span className="ml-2 bg-accent-orange text-white px-2 py-1 rounded-full text-xs">!</span>
          )}
        </Button>
      </div>

      {/* Desktop filters */}
      <div className="hidden lg:block bg-white rounded-lg border p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Filtros</h3>
          {hasActiveFilters && (
            <Button onClick={clearFilters} variant="outline" size="sm">
              Limpiar
            </Button>
          )}
        </div>

        <div className="space-y-6">
          {/* Categoría */}
          <div>
            <label className="block text-sm font-medium mb-2">Categoría</label>
            <select
              value={filters.category || "all"}
              onChange={(e) => handleCategoryChange(e.target.value as ProductCategory | "all")}
              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-orange"
            >
              {categories.map((category) => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
          </div>

          {/* Precio */}
          <div>
            <label className="block text-sm font-medium mb-2">Rango de precio</label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                placeholder="Mín"
                value={filters.minPrice || ""}
                onChange={(e) => handlePriceChange("min", e.target.value)}
                className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-orange"
              />
              <input
                type="number"
                placeholder="Máx"
                value={filters.maxPrice || ""}
                onChange={(e) => handlePriceChange("max", e.target.value)}
                className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-orange"
              />
            </div>
          </div>

          {/* Ordenar */}
          <div>
            <label className="block text-sm font-medium mb-2">Ordenar por</label>
            <select
              value={`${filters.sortBy || "newest"}${filters.sortOrder ? `-${filters.sortOrder}` : ""}`}
              onChange={(e) => handleSortChange(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-orange"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Mobile filter modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setIsOpen(false)} />
          <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-lg p-6 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Filtros</h3>
              <button onClick={() => setIsOpen(false)} className="p-1">
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Same content as desktop but in mobile layout */}
              <div>
                <label className="block text-sm font-medium mb-2">Categoría</label>
                <select
                  value={filters.category || "all"}
                  onChange={(e) => handleCategoryChange(e.target.value as ProductCategory | "all")}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-orange"
                >
                  {categories.map((category) => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Rango de precio</label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    placeholder="Mín"
                    value={filters.minPrice || ""}
                    onChange={(e) => handlePriceChange("min", e.target.value)}
                    className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-orange"
                  />
                  <input
                    type="number"
                    placeholder="Máx"
                    value={filters.maxPrice || ""}
                    onChange={(e) => handlePriceChange("max", e.target.value)}
                    className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-orange"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Ordenar por</label>
                <select
                  value={`${filters.sortBy || "newest"}${filters.sortOrder ? `-${filters.sortOrder}` : ""}`}
                  onChange={(e) => handleSortChange(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-orange"
                >
                  {sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              {hasActiveFilters && (
                <Button onClick={clearFilters} variant="outline" className="flex-1">
                  Limpiar
                </Button>
              )}
              <Button onClick={() => setIsOpen(false)} className="flex-1">
                Aplicar filtros
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
