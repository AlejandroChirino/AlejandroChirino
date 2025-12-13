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
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-3">
        <h3 className="text-lg font-medium text-gray-900">Filtros</h3>
        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="outline" size="sm" onClick={() => setShowAdvanced(!showAdvanced)}>
            <Filter className="w-4 h-4 mr-2" />
            {showAdvanced ? "Ocultar filtros" : "Más filtros"}
          </Button>

          {/* Nuevo filtro: Sin fotos */}
          <button
            type="button"
            onClick={() => handleFilterChange("no_image", !filters.no_image)}
            className={`px-3 py-1 rounded text-sm border ${filters.no_image ? "bg-gray-900 text-white border-gray-900" : "bg-gray-100 text-gray-700"}`}
            aria-pressed={!!filters.no_image}
            title="Mostrar solo productos sin fotos"
          >
            Sin fotos
          </button>

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

        {/* Categoría: grupo de botones */}
        <div>
          <div className="mb-1 text-sm font-medium text-gray-700">Categoría</div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => handleFilterChange("category", "")}
              className={`px-3 py-1 rounded text-sm ${!filters.category ? "bg-accent-orange text-white" : "bg-gray-100"}`}
            >
              Todas
            </button>
            <button
              type="button"
              onClick={() => handleFilterChange("category", "hombre")}
              className={`px-3 py-1 rounded text-sm ${filters.category === "hombre" ? "bg-accent-orange text-white" : "bg-gray-100"}`}
            >
              Hombre
            </button>
            <button
              type="button"
              onClick={() => handleFilterChange("category", "mujer")}
              className={`px-3 py-1 rounded text-sm ${filters.category === "mujer" ? "bg-accent-orange text-white" : "bg-gray-100"}`}
            >
              Mujer
            </button>
            <button
              type="button"
              onClick={() => handleFilterChange("category", "accesorios")}
              className={`px-3 py-1 rounded text-sm ${filters.category === "accesorios" ? "bg-accent-orange text-white" : "bg-gray-100"}`}
            >
              Accesorios
            </button>
            <button
              type="button"
              onClick={() => handleFilterChange("category", "unisex")}
              className={`px-3 py-1 rounded text-sm ${filters.category === "unisex" ? "bg-accent-orange text-white" : "bg-gray-100"}`}
            >
              Unisex
            </button>
          </div>
        </div>
      </div>

      <div
        aria-hidden={!showAdvanced}
        className="mt-4 overflow-hidden transition-[max-height] duration-300 ease-in-out"
        style={{ maxHeight: showAdvanced ? 520 : 0 }}
      >
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t border-gray-200">
          {/* Subcategoría: mostramos opciones como lista de botones para mejor visibilidad */}
          <div>
            <div className="mb-2 text-sm font-medium text-gray-700">Subcategoría</div>
            <div className="flex flex-col gap-2 max-h-40 overflow-auto pr-2">
              <button
                type="button"
                onClick={() => handleFilterChange("subcategoria", "")}
                className={`text-left px-3 py-1 rounded ${!filters.subcategoria ? "bg-accent-orange text-white" : "bg-gray-100"}`}
                disabled={!filters.category}
              >
                Todas las subcategorías
              </button>
              {filters.category &&
                SUBCATEGORIAS[filters.category as keyof typeof SUBCATEGORIAS]?.map((sub) => (
                  <button
                    key={sub}
                    type="button"
                    onClick={() => handleFilterChange("subcategoria", sub)}
                    className={`text-left px-3 py-1 rounded ${filters.subcategoria === sub ? "bg-accent-orange text-white" : "bg-gray-100"}`}
                  >
                    {sub}
                  </button>
                ))}
            </div>
          </div>

          {/* Filtros booleanos: mostramos como botones (Todos / Sí / No) */}
          <div>
            <div className="mb-2 text-sm font-medium text-gray-700">VIP</div>
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => handleFilterChange("is_vip", undefined)}
                className={`text-left px-3 py-1 rounded ${filters.is_vip === undefined ? "bg-accent-orange text-white" : "bg-gray-100"}`}
              >
                Todos (VIP)
              </button>
              <button
                type="button"
                onClick={() => handleFilterChange("is_vip", true)}
                className={`text-left px-3 py-1 rounded ${filters.is_vip === true ? "bg-accent-orange text-white" : "bg-gray-100"}`}
              >
                Solo VIP
              </button>
              <button
                type="button"
                onClick={() => handleFilterChange("is_vip", false)}
                className={`text-left px-3 py-1 rounded ${filters.is_vip === false ? "bg-accent-orange text-white" : "bg-gray-100"}`}
              >
                No VIP
              </button>
            </div>
          </div>

          <div>
            <div className="mb-2 text-sm font-medium text-gray-700">Nuevo</div>
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => handleFilterChange("is_new", undefined)}
                className={`text-left px-3 py-1 rounded ${filters.is_new === undefined ? "bg-accent-orange text-white" : "bg-gray-100"}`}
              >
                Todos (Nuevo)
              </button>
              <button
                type="button"
                onClick={() => handleFilterChange("is_new", true)}
                className={`text-left px-3 py-1 rounded ${filters.is_new === true ? "bg-accent-orange text-white" : "bg-gray-100"}`}
              >
                Solo nuevos
              </button>
              <button
                type="button"
                onClick={() => handleFilterChange("is_new", false)}
                className={`text-left px-3 py-1 rounded ${filters.is_new === false ? "bg-accent-orange text-white" : "bg-gray-100"}`}
              >
                No nuevos
              </button>
            </div>
          </div>

          <div>
            <div className="mb-2 text-sm font-medium text-gray-700">Destacado</div>
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => handleFilterChange("featured", undefined)}
                className={`text-left px-3 py-1 rounded ${filters.featured === undefined ? "bg-accent-orange text-white" : "bg-gray-100"}`}
              >
                Todos (Destacado)
              </button>
              <button
                type="button"
                onClick={() => handleFilterChange("featured", true)}
                className={`text-left px-3 py-1 rounded ${filters.featured === true ? "bg-accent-orange text-white" : "bg-gray-100"}`}
              >
                Solo destacados
              </button>
              <button
                type="button"
                onClick={() => handleFilterChange("featured", false)}
                className={`text-left px-3 py-1 rounded ${filters.featured === false ? "bg-accent-orange text-white" : "bg-gray-100"}`}
              >
                No destacados
              </button>
            </div>
          </div>

          <div>
            <div className="mb-2 text-sm font-medium text-gray-700">Archivado</div>
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => handleFilterChange("archived", undefined)}
                className={`text-left px-3 py-1 rounded ${filters.archived === undefined ? "bg-accent-orange text-white" : "bg-gray-100"}`}
              >
                Todos
              </button>
              <button
                type="button"
                onClick={() => handleFilterChange("archived", false)}
                className={`text-left px-3 py-1 rounded ${filters.archived === false ? "bg-accent-orange text-white" : "bg-gray-100"}`}
              >
                Activos
              </button>
              <button
                type="button"
                onClick={() => handleFilterChange("archived", true)}
                className={`text-left px-3 py-1 rounded ${filters.archived === true ? "bg-accent-orange text-white" : "bg-gray-100"}`}
              >
                Archivados
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
