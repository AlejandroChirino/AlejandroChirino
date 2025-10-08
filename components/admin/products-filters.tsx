"use client"

import { useState } from "react"
import { Search, Filter, X } from "lucide-react"
// ✅ Correcto
import Button from "@/components/ui/button"

import { SUBCATEGORIAS } from "@/lib/types"
import type { AdminFilters } from "@/lib/admin-types"

interface ProductsFiltersProps {
  filters: AdminFilters
  onFiltersChange: (filters: AdminFilters) => void
  onClearFilters: () => void
}

export function ProductsFilters({ filters, onFiltersChange, onClearFilters }: ProductsFiltersProps) {
  const [showAdvanced, setShowAdvanced] = useState(false)

  const handleFilterChange = (key: keyof AdminFilters, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value === "" ? undefined : value,
    })
  }

  const hasActiveFilters = Object.values(filters).some((value) => value !== undefined && value !== "")

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">Filtros</h3>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowAdvanced(!showAdvanced)}>
            <Filter className="w-4 h-4 mr-2" />
            {showAdvanced ? "Ocultar filtros" : "Más filtros"}
          </Button>
          {hasActiveFilters && (
            <Button variant="outline" size="sm" onClick={onClearFilters}>
              <X className="w-4 h-4 mr-2" />
              Limpiar
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Búsqueda */}
        <div className="md:col-span-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Buscar productos..."
              value={filters.search || ""}
              onChange={(e) => handleFilterChange("search", e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent-orange focus:border-accent-orange"
            />
          </div>
        </div>

        {/* Categoría */}
        <div>
          <select
            value={filters.category || ""}
            onChange={(e) => handleFilterChange("category", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent-orange focus:border-accent-orange"
          >
            <option value="">Todas las categorías</option>
            <option value="hombre">Hombre</option>
            <option value="mujer">Mujer</option>
            <option value="accesorios">Accesorios</option>
            <option value="unisex">Unisex</option>
          </select>
        </div>
      </div>

      {showAdvanced && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4 pt-4 border-t border-gray-200">
          {/* Subcategoría */}
          <div>
            <select
              value={filters.subcategoria || ""}
              onChange={(e) => handleFilterChange("subcategoria", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent-orange focus:border-accent-orange"
              disabled={!filters.category}
            >
              <option value="">Todas las subcategorías</option>
              {filters.category &&
                SUBCATEGORIAS[filters.category as keyof typeof SUBCATEGORIAS]?.map((sub) => (
                  <option key={sub} value={sub}>
                    {sub}
                  </option>
                ))}
            </select>
          </div>

          {/* Filtros booleanos */}
          <div>
            <select
              value={filters.is_vip?.toString() || ""}
              onChange={(e) =>
                handleFilterChange("is_vip", e.target.value === "" ? undefined : e.target.value === "true")
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent-orange focus:border-accent-orange"
            >
              <option value="">Todos (VIP)</option>
              <option value="true">Solo VIP</option>
              <option value="false">No VIP</option>
            </select>
          </div>

          <div>
            <select
              value={filters.is_new?.toString() || ""}
              onChange={(e) =>
                handleFilterChange("is_new", e.target.value === "" ? undefined : e.target.value === "true")
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent-orange focus:border-accent-orange"
            >
              <option value="">Todos (Nuevo)</option>
              <option value="true">Solo nuevos</option>
              <option value="false">No nuevos</option>
            </select>
          </div>

          <div>
            <select
              value={filters.featured?.toString() || ""}
              onChange={(e) =>
                handleFilterChange("featured", e.target.value === "" ? undefined : e.target.value === "true")
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent-orange focus:border-accent-orange"
            >
              <option value="">Todos (Destacado)</option>
              <option value="true">Solo destacados</option>
              <option value="false">No destacados</option>
            </select>
          </div>
        </div>
      )}
    </div>
  )
}
